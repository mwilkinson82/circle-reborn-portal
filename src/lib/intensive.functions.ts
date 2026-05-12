import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachAuthHeader } from "@/lib/auth-client-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const APPLICATION_TO_EMAIL = "marshall@marshallwilkinson.com";

const intensiveApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().min(2).max(180),
  annualRevenueRange: z.string().trim().min(2).max(80),
  biggestChallenge: z.string().trim().min(12).max(3000),
  alreadyTried: z.string().trim().min(8).max(3000),
  applyingFor: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(60),
});

type IntensiveApplicationInput = z.infer<typeof intensiveApplicationSchema>;

function applicationEmailHtml(data: IntensiveApplicationInput) {
  const rows = [
    ["Full name", data.fullName],
    ["Company", data.companyName],
    ["Annual revenue range", data.annualRevenueRange],
    ["Applying for", data.applyingFor],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Biggest business challenge", data.biggestChallenge],
    ["What they have already tried", data.alreadyTried],
  ];

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#171411;line-height:1.5">
      <h1 style="font-size:24px;margin:0 0 12px">New Contractor Intensive Application</h1>
      <p style="margin:0 0 20px;color:#5b534b">Submitted from the Contractor Circle portal.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border:1px solid #ded2bd;padding:10px 12px;font-weight:700;width:220px;vertical-align:top">${label}</td>
                <td style="border:1px solid #ded2bd;padding:10px 12px;white-space:pre-wrap">${value}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;
}

function applicationEmailText(data: IntensiveApplicationInput) {
  return [
    "New Contractor Intensive Application",
    "",
    `Full name: ${data.fullName}`,
    `Company: ${data.companyName}`,
    `Annual revenue range: ${data.annualRevenueRange}`,
    `Applying for: ${data.applyingFor}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    "",
    "Biggest business challenge:",
    data.biggestChallenge,
    "",
    "What they have already tried:",
    data.alreadyTried,
  ].join("\n");
}

async function sendApplicationEmail(data: IntensiveApplicationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INTENSIVE_APPLICATION_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      sent: false,
      error: "Missing RESEND_API_KEY or INTENSIVE_APPLICATION_FROM_EMAIL.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [APPLICATION_TO_EMAIL],
      reply_to: data.email,
      subject: `Contractor Intensive application — ${data.fullName}`,
      html: applicationEmailHtml(data),
      text: applicationEmailText(data),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      sent: false,
      error: body || `Resend returned ${response.status}`,
    };
  }

  return { sent: true, error: null };
}

export const submitIntensiveApplication = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((data: unknown) => intensiveApplicationSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emailResult = await sendApplicationEmail(data);

    const { data: created, error } = await supabase
      .from("intensive_applications")
      .insert({
        user_id: userId,
        full_name: data.fullName,
        company_name: data.companyName,
        annual_revenue_range: data.annualRevenueRange,
        biggest_challenge: data.biggestChallenge,
        already_tried: data.alreadyTried,
        applying_for: data.applyingFor,
        email: data.email,
        phone: data.phone,
        email_status: emailResult.sent ? "sent" : "pending_email_config",
        email_error: emailResult.error,
      })
      .select("id, email_status")
      .single();

    if (error) throw error;

    return {
      id: created.id,
      emailSent: emailResult.sent,
      emailStatus: created.email_status,
    };
  });
