import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetPage } from "@/components/lead-magnet";

export const Route = createFileRoute("/estimating")({
  head: () => ({
    meta: [
      { title: "The Estimating Checklist — ALP" },
      { name: "description", content: "The 47-point checklist we run before every bid leaves the office. Free." },
    ],
  }),
  component: () => (
    <LeadMagnetPage
      source="estimating"
      eyebrow="Free checklist · 47 points"
      title={<>The <span className="italic text-amber">estimating</span> checklist.</>}
      intro="The 47-point review we run before any bid leaves the office. Built from the ten most expensive misses we've watched contractors make over the last decade."
      bullets={[
        "Scope traps that cost more than the bid",
        "Pricing assumptions to flag in writing",
        "The four lines that protect your margin",
        "Sign-off rules so nothing ships unreviewed",
      ]}
      thankYouPath="/estimating/thanks"
    />
  ),
});
