import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isConfiguredAdminEmail } from "@/lib/admin-access";
import { attachAuthHeader } from "@/lib/auth-client-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const adminReplaySelect =
  "id, title, description, duration_minutes, recorded_at, tags, thumbnail_url, video_url, published, created_at";
const adminSessionSelect =
  "id, title, session_date, session_url, replay_url, notes, published, created_at, updated_at";
const adminQuestionSelect =
  "id, session_id, user_id, question, context, status, admin_note, accepted_at, declined_at, discussed_at, created_at, updated_at";

const saveReplaySchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(2400).optional().default(""),
  durationMinutes: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  recordedAt: z.string().trim().min(1),
  tags: z.string().trim().max(400).optional().default(""),
  thumbnailUrl: z.string().trim().max(1000).optional().default(""),
  videoUrl: z.string().trim().max(1000).optional().default(""),
  published: z.boolean().optional().default(true),
});

const saveBootcampSessionSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(180),
  sessionDate: z.string().trim().min(1),
  sessionUrl: z.string().trim().max(1000).optional().default(""),
  replayUrl: z.string().trim().max(1000).optional().default(""),
  notes: z.string().trim().max(1600).optional().default(""),
  published: z.boolean().optional().default(true),
});

const updateBootcampQuestionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["submitted", "accepted", "declined", "discussed"]),
  adminNote: z.string().trim().max(1200).optional().default(""),
});

function cloudflareStreamUrl(id: string) {
  return `https://iframe.videodelivery.net/${id}`;
}

function cloudflareThumbnailUrl(id: string) {
  return `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?time=1s`;
}

function normalizeReplayVideoUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { video_url: null, thumbnail_url: null };

  const cloudflareIdMatch = trimmed.match(/^[a-f0-9]{32}$/i);
  if (cloudflareIdMatch) {
    return {
      video_url: cloudflareStreamUrl(trimmed),
      thumbnail_url: cloudflareThumbnailUrl(trimmed),
    };
  }

  return { video_url: trimmed, thumbnail_url: null };
}

function tagsFromText(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function assertAdmin(userId: string, email: string | null | undefined) {
  if (isConfiguredAdminEmail(email)) return;

  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Admin access required");
}

export const getAdminContentCenter = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email ?? null;
    await assertAdmin(context.userId, email);

    const [replaysRes, sessionsRes, questionsRes] = await Promise.all([
      supabaseAdmin
        .from("replays")
        .select(adminReplaySelect)
        .order("recorded_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("bootcamp_sessions")
        .select(adminSessionSelect)
        .order("session_date", { ascending: false })
        .limit(12),
      supabaseAdmin
        .from("bootcamp_questions")
        .select(adminQuestionSelect)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    if (replaysRes.error) throw replaysRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (questionsRes.error) throw questionsRes.error;

    return {
      replays: replaysRes.data ?? [],
      sessions: sessionsRes.data ?? [],
      questions: questionsRes.data ?? [],
    };
  });

export const saveAdminReplay = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => saveReplaySchema.parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email ?? null;
    await assertAdmin(context.userId, email);

    const normalizedVideo = normalizeReplayVideoUrl(data.videoUrl);
    const payload = {
      title: data.title,
      description: data.description || null,
      duration_minutes: data.durationMinutes || null,
      recorded_at: new Date(data.recordedAt).toISOString(),
      tags: tagsFromText(data.tags),
      thumbnail_url: data.thumbnailUrl || normalizedVideo.thumbnail_url,
      video_url: normalizedVideo.video_url,
      published: data.published,
    };

    const query = data.id
      ? supabaseAdmin.from("replays").update(payload).eq("id", data.id)
      : supabaseAdmin.from("replays").insert(payload);

    const { data: saved, error } = await query.select(adminReplaySelect).single();
    if (error) throw error;
    return saved;
  });

export const saveBootcampSession = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => saveBootcampSessionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email ?? null;
    await assertAdmin(context.userId, email);

    const payload = {
      title: data.title,
      session_date: new Date(data.sessionDate).toISOString(),
      session_url: data.sessionUrl || null,
      replay_url: data.replayUrl || null,
      notes: data.notes || null,
      published: data.published,
    };

    const query = data.id
      ? supabaseAdmin.from("bootcamp_sessions").update(payload).eq("id", data.id)
      : supabaseAdmin.from("bootcamp_sessions").insert(payload);

    const { data: saved, error } = await query.select(adminSessionSelect).single();
    if (error) throw error;
    return saved;
  });

export const updateBootcampQuestionStatus = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => updateBootcampQuestionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email ?? null;
    await assertAdmin(context.userId, email);

    const now = new Date().toISOString();
    const timestampPatch =
      data.status === "accepted"
        ? { accepted_at: now, declined_at: null, discussed_at: null }
        : data.status === "declined"
          ? { declined_at: now, accepted_at: null, discussed_at: null }
          : data.status === "discussed"
            ? { discussed_at: now }
            : { accepted_at: null, declined_at: null, discussed_at: null };

    const { data: saved, error } = await supabaseAdmin
      .from("bootcamp_questions")
      .update({
        status: data.status,
        admin_note: data.adminNote || null,
        ...timestampPatch,
      })
      .eq("id", data.id)
      .select(adminQuestionSelect)
      .single();

    if (error) throw error;
    return saved;
  });
