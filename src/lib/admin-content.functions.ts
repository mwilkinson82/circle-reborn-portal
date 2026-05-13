import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isConfiguredAdminEmail } from "@/lib/admin-access";
import { attachAuthHeader } from "@/lib/auth-client-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabaseAdminEnvStatus, supabaseAdmin } from "@/integrations/supabase/client.server";
import { PLACEHOLDER_REPLAY_TITLES, PLACEHOLDER_TEMPLATE_TITLES } from "@/lib/library-catalog";

const adminReplaySelect =
  "id, title, description, duration_minutes, recorded_at, tags, thumbnail_url, video_url, published, created_at";
const adminSessionSelect =
  "id, title, session_date, session_url, replay_url, notes, published, created_at, updated_at";
const adminQuestionSelect =
  "id, session_id, user_id, question, context, status, admin_note, accepted_at, declined_at, discussed_at, created_at, updated_at";
const adminIntensiveApplicationSelect =
  "id, user_id, full_name, company_name, annual_revenue_range, biggest_challenge, already_tried, applying_for, email, phone, status, email_status, email_error, created_at, updated_at";

const saveReplaySchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(2400).optional().default(""),
  durationMinutes: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  recordedAt: z.string().trim().min(1),
  tags: z.string().trim().max(400).optional().default(""),
  thumbnailUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default("")
    .refine((value) => !value || isHttpUrl(value), "Thumbnail URL must be an http(s) URL."),
  videoUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default("")
    .refine(
      (value) => !value || isRecognizedReplaySource(value),
      "Use a Zoom clip URL/embed, Cloudflare Stream ID, Cloudflare URL, or http(s) replay URL.",
    ),
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
  const trimmed = value.trim().replace(/&amp;/g, "&");
  if (!trimmed) return { video_url: null, thumbnail_url: null };

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const raw = srcMatch?.[1]?.trim() ?? trimmed;

  const cloudflareIdMatch = raw.match(/^[a-f0-9]{32}$/i);
  if (cloudflareIdMatch) {
    return {
      video_url: cloudflareStreamUrl(raw),
      thumbnail_url: cloudflareThumbnailUrl(raw),
    };
  }

  const cloudflareDeliveryMatch = raw.match(/videodelivery\.net\/([a-f0-9]{32})/i);
  if (cloudflareDeliveryMatch?.[1] && !raw.includes("iframe.videodelivery.net")) {
    return {
      video_url: cloudflareStreamUrl(cloudflareDeliveryMatch[1]),
      thumbnail_url: cloudflareThumbnailUrl(cloudflareDeliveryMatch[1]),
    };
  }

  if (raw.includes("zoom.us/clips/share/")) {
    return { video_url: raw.replace("/clips/share/", "/clips/embed/"), thumbnail_url: null };
  }

  return { video_url: raw, thumbnail_url: null };
}

function extractReplaySource(value: string) {
  const trimmed = value.trim().replace(/&amp;/g, "&");
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1]?.trim() ?? trimmed;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRecognizedReplaySource(value: string) {
  const raw = extractReplaySource(value);
  if (/^[a-f0-9]{32}$/i.test(raw)) return true;
  if (raw.includes("zoom.us/clips/")) return true;
  if (raw.includes("videodelivery.net/")) return true;
  return isHttpUrl(raw);
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
    const envStatus = getSupabaseAdminEnvStatus();
    if (!envStatus.ready) {
      throw new Error(envStatus.message ?? "Supabase admin environment is not configured.");
    }
    await assertAdmin(context.userId, email);

    const [replaysRes, sessionsRes, questionsRes, templatesRes, applicationsRes] =
      await Promise.all([
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
        supabaseAdmin
          .from("templates")
          .select("id, title, download_url, published")
          .order("created_at", { ascending: false })
          .limit(80),
        supabaseAdmin
          .from("intensive_applications")
          .select(adminIntensiveApplicationSelect)
          .order("created_at", { ascending: false })
          .limit(24),
      ]);

    if (replaysRes.error) throw replaysRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (questionsRes.error) throw questionsRes.error;
    if (templatesRes.error) throw templatesRes.error;
    if (applicationsRes.error) throw applicationsRes.error;

    const replays = replaysRes.data ?? [];
    const templates = templatesRes.data ?? [];
    const placeholderTemplateCount = templates.filter((template) =>
      PLACEHOLDER_TEMPLATE_TITLES.has(template.title),
    ).length;
    const placeholderReplayCount = replays.filter((replay) =>
      PLACEHOLDER_REPLAY_TITLES.has(replay.title),
    ).length;

    return {
      replays,
      sessions: sessionsRes.data ?? [],
      questions: questionsRes.data ?? [],
      applications: applicationsRes.data ?? [],
      diagnostics: {
        supabaseAdminEnv: envStatus,
        templateCount: templates.length,
        replayCount: replays.length,
        placeholderTemplateCount,
        placeholderReplayCount,
        manusTemplateUrlCount: templates.filter((template) =>
          template.download_url?.includes("alpcontractorcircle.com/manus-storage"),
        ).length,
        usingTemplateFallback: templates.length < 20 || placeholderTemplateCount > 0,
        usingReplayFallback: replays.length === 0 || placeholderReplayCount > 0,
      },
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
