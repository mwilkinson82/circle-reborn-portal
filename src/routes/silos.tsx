import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetPage } from "@/components/lead-magnet";

export const Route = createFileRoute("/silos")({
  head: () => ({
    meta: [
      { title: "The Three Silos — ALP" },
      { name: "description", content: "How serious GCs separate sales, ops, and finance so the company doesn't break at scale. Free guide." },
    ],
  }),
  component: () => (
    <LeadMagnetPage
      source="silos"
      eyebrow="Free guide · 18 pages"
      title={<>The <span className="italic text-amber">three silos</span> guide.</>}
      intro="How serious GCs separate sales, operations, and finance so the company doesn't break when revenue doubles. The org chart we wish we'd drawn at $5M instead of $20M."
      bullets={[
        "Where each silo starts and stops",
        "The two roles that hold the seams together",
        "Reporting cadence between silos",
        "Failure modes at $5M, $15M, and $30M",
      ]}
      thankYouPath="/silos/thanks"
    />
  ),
});
