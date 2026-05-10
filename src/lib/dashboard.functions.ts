import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, memberRes, replaysRes, templatesRes, announcementsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url, company, headline").eq("id", userId).maybeSingle(),
      supabase.from("members").select("status, plan, joined_at, current_period_end").eq("user_id", userId).maybeSingle(),
      supabase.from("replays").select("id, title, description, duration_minutes, recorded_at, tags, thumbnail_url").eq("published", true).order("recorded_at", { ascending: false }).limit(4),
      supabase.from("templates").select("id, title, description, category, badge, pages, file_type").eq("published", true).eq("featured", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("announcements").select("id, title, body, link_url, link_label, pinned, published_at").eq("published", true).order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(5),
    ]);

    return {
      profile: profileRes.data,
      member: memberRes.data,
      replays: replaysRes.data ?? [],
      featuredTemplates: templatesRes.data ?? [],
      announcements: announcementsRes.data ?? [],
    };
  });
