import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuthHeader } from "@/lib/auth-client-middleware";

export type BootcampSession = {
  id: string;
  title: string;
  session_date: string;
  session_url: string | null;
  replay_url: string | null;
  notes: string | null;
  published: boolean;
};

export type BootcampQuestion = {
  id: string;
  session_id: string | null;
  question: string;
  context: string | null;
  status: "submitted" | "accepted" | "declined" | "discussed";
  admin_note: string | null;
  created_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  discussed_at: string | null;
};

const sessionSelect = "id, title, session_date, session_url, replay_url, notes, published";
const questionSelect =
  "id, session_id, question, context, status, admin_note, created_at, accepted_at, declined_at, discussed_at";

const submitBootcampQuestionSchema = z.object({
  sessionId: z.string().uuid().optional().nullable(),
  question: z.string().trim().min(8).max(1600),
  context: z.string().trim().max(1600).optional().default(""),
});

export const getBootcampCenter = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();

    const [sessionRes, questionRes] = await Promise.all([
      supabase
        .from("bootcamp_sessions")
        .select(sessionSelect)
        .eq("published", true)
        .gte("session_date", now)
        .order("session_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("bootcamp_questions")
        .select(questionSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (sessionRes.error) throw sessionRes.error;
    if (questionRes.error) throw questionRes.error;

    return {
      nextSession: (sessionRes.data ?? null) as BootcampSession | null,
      questions: (questionRes.data ?? []) as BootcampQuestion[],
    };
  });

export const submitBootcampQuestion = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => submitBootcampQuestionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: created, error } = await supabase
      .from("bootcamp_questions")
      .insert({
        user_id: userId,
        session_id: data.sessionId || null,
        question: data.question,
        context: data.context || null,
      })
      .select(questionSelect)
      .single();

    if (error) throw error;
    return created as BootcampQuestion;
  });
