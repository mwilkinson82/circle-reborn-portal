import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuthHeader } from "@/lib/auth-client-middleware";

export const packetCategories = ["leadership", "people", "cash", "sales", "production"] as const;

export const packetOutputTypes = [
  "decision",
  "todo",
  "sop_gap",
  "scorecard_metric",
  "aos_issue",
] as const;

export const packetStatuses = ["draft", "ready", "discussed", "converted"] as const;

export type PacketCategory = (typeof packetCategories)[number];
export type PacketOutputType = (typeof packetOutputTypes)[number];
export type PacketStatus = (typeof packetStatuses)[number];

const createCallPrepPacketSchema = z.object({
  category: z.enum(packetCategories),
  issue: z.string().trim().min(1).max(3000),
  tried: z.string().trim().max(3000).optional().default(""),
  avoiding: z.string().trim().max(3000).optional().default(""),
  consequence: z.string().trim().max(3000).optional().default(""),
  win: z.string().trim().max(3000).optional().default(""),
  expectedOutput: z.enum(packetOutputTypes),
  outputSummary: z.string().trim().max(3000).optional().default(""),
  owner: z.string().trim().max(160).optional().default(""),
  dueDate: z.string().trim().max(32).optional().default(""),
});

export type CallPrepPacket = {
  id: string;
  user_id: string;
  category: PacketCategory;
  issue: string;
  tried: string | null;
  avoiding: string | null;
  consequence: string | null;
  win: string | null;
  expected_output: PacketOutputType;
  output_summary: string | null;
  owner: string | null;
  due_date: string | null;
  status: PacketStatus;
  created_at: string;
  updated_at: string;
};

const packetSelect =
  "id, user_id, category, issue, tried, avoiding, consequence, win, expected_output, output_summary, owner, due_date, status, created_at, updated_at";

export const getCallPrepPackets = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }): Promise<CallPrepPacket[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("call_prep_packets")
      .select(packetSelect)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data ?? []) as CallPrepPacket[];
  });

export const createCallPrepPacket = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => createCallPrepPacketSchema.parse(data))
  .handler(async ({ data, context }): Promise<CallPrepPacket> => {
    const { supabase, userId } = context;
    const answeredCount = [
      data.issue,
      data.tried,
      data.avoiding,
      data.consequence,
      data.win,
    ].filter((value) => value.trim().length > 0).length;
    const status: PacketStatus = data.outputSummary
      ? "converted"
      : answeredCount >= 5
        ? "ready"
        : "draft";

    const { data: created, error } = await supabase
      .from("call_prep_packets")
      .insert({
        user_id: userId,
        category: data.category,
        issue: data.issue,
        tried: data.tried || null,
        avoiding: data.avoiding || null,
        consequence: data.consequence || null,
        win: data.win || null,
        expected_output: data.expectedOutput,
        output_summary: data.outputSummary || null,
        owner: data.owner || null,
        due_date: data.dueDate || null,
        status,
      })
      .select(packetSelect)
      .single();

    if (error) throw error;
    return created as CallPrepPacket;
  });
