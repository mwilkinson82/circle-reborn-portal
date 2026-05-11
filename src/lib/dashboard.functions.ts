import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isConfiguredAdminEmail } from "@/lib/admin-access";
import {
  circleReplayCatalog,
  circleTemplateCatalog,
  shouldUseReplayCatalogFallback,
  shouldUseTemplateCatalogFallback,
} from "@/lib/library-catalog";
import { titleCase } from "@/lib/membership-plan";
import { attachAuthHeader } from "./auth-client-middleware";

function getLiveCallUrl() {
  return process.env.CIRCLE_LIVE_CALL_URL?.trim() || null;
}

function getLiveCallTopic() {
  return process.env.CIRCLE_NEXT_CALL_TOPIC?.trim() || "Live coaching and bid review";
}

function getCommunityUrl() {
  return process.env.CIRCLE_DISCORD_URL?.trim() || null;
}

function newestReplayCatalog() {
  return [...circleReplayCatalog].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  );
}

function dashboardTemplateFallback() {
  const priorityIds = ["legacy-template-20", "legacy-template-34", "legacy-template-25"];
  const priority = priorityIds
    .map((id) => circleTemplateCatalog.find((template) => template.id === id))
    .filter((template): template is (typeof circleTemplateCatalog)[number] => Boolean(template));

  return priority.length >= 3
    ? priority
    : circleTemplateCatalog.filter((template) => template.featured).slice(0, 3);
}

function friendlyNameFromEmail(email: string | null | undefined) {
  if (!email) return null;
  const local = email.split("@")[0];
  const parts = local
    .split(/[._+-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  // Owner/admin emails are sometimes last.first; prefer the personal name.
  if (isConfiguredAdminEmail(email) && parts.length > 1) {
    return titleCase(parts[parts.length - 1]);
  }

  return titleCase(parts[0]);
}

function profileDisplayName(displayName: string | null | undefined, email: string | null) {
  const fallback = friendlyNameFromEmail(email);
  if (!displayName) return fallback;

  const normalizedDisplayName = displayName.trim().toLowerCase();
  const emailLocal = email?.split("@")[0]?.toLowerCase();

  if (emailLocal && normalizedDisplayName === emailLocal) return fallback;
  return displayName;
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string } | undefined)?.email ?? null;
    const isConfiguredAdmin = isConfiguredAdminEmail(email);

    const [profileRes, memberRes, replaysRes, templatesRes, announcementsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url, company, headline")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("members")
        .select("status, plan, joined_at, current_period_end")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("replays")
        .select("id, title, description, duration_minutes, recorded_at, tags, thumbnail_url")
        .eq("published", true)
        .order("recorded_at", { ascending: false })
        .limit(4),
      supabase
        .from("templates")
        .select("id, title, description, category, badge, pages, file_type")
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("announcements")
        .select("id, title, body, link_url, link_label, pinned, published_at")
        .eq("published", true)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(5),
    ]);

    const profile = profileRes.data
      ? {
          ...profileRes.data,
          display_name: profileDisplayName(profileRes.data.display_name, email),
        }
      : {
          display_name: profileDisplayName(null, email),
          avatar_url: null,
          company: null,
          headline: null,
        };

    const member = isConfiguredAdmin
      ? {
          status: "active",
          plan: "comped",
          joined_at: memberRes.data?.joined_at ?? new Date().toISOString(),
          current_period_end: null,
        }
      : memberRes.data;

    const dashboardReplays = replaysRes.data ?? [];
    const dashboardTemplates = templatesRes.data ?? [];

    return {
      profile,
      member,
      liveCallUrl: getLiveCallUrl(),
      liveCallTopic: getLiveCallTopic(),
      communityUrl: getCommunityUrl(),
      replays: shouldUseReplayCatalogFallback(dashboardReplays)
        ? newestReplayCatalog().slice(0, 4)
        : dashboardReplays,
      featuredTemplates: shouldUseTemplateCatalogFallback(dashboardTemplates)
        ? dashboardTemplateFallback()
        : dashboardTemplates,
      announcements: announcementsRes.data ?? [],
    };
  });

export const getReplayLibrary = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase
      .from("replays")
      .select(
        "id, title, description, duration_minutes, recorded_at, tags, thumbnail_url, video_url",
      )
      .eq("published", true)
      .order("recorded_at", { ascending: false })
      .limit(24);

    const replays = data ?? [];
    return shouldUseReplayCatalogFallback(replays) ? newestReplayCatalog() : replays;
  });

export const getTemplateLibrary = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase
      .from("templates")
      .select(
        "id, title, description, long_description, category, badge, pages, file_type, highlights, download_url, featured, created_at",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(48);

    const templates = data ?? [];
    return shouldUseTemplateCatalogFallback(templates) ? circleTemplateCatalog : templates;
  });
