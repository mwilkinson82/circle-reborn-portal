import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetPage } from "@/components/lead-magnet";

export const Route = createFileRoute("/q2")({
  head: () => ({
    meta: [
      { title: "The Q2 Playbook — ALP" },
      {
        name: "description",
        content: "The exact 90-day operating plan we run from April to June. Free.",
      },
      { property: "og:title", content: "The Q2 Playbook — ALP" },
    ],
  }),
  component: () => (
    <LeadMagnetPage
      source="q2"
      eyebrow="Free playbook · 24 pages"
      title={
        <>
          The <span className="italic text-amber">Q2</span> playbook.
        </>
      }
      intro="The 90-day operating plan we run from April to June — bidding rhythm, hiring windows, cash flow waypoints. The same calendar we use to push a Q1 backlog through summer."
      bullets={[
        "Week-by-week bidding cadence",
        "Hiring & onboarding windows aligned to job starts",
        "Cash flow waypoints and trigger checks",
        "The four reports we run every Friday",
      ]}
      thankYouPath="/q2/thanks"
    />
  ),
});
