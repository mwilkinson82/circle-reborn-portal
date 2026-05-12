import { createFileRoute } from "@tanstack/react-router";
import { LeadThankYou } from "@/components/lead-magnet";
import { LEAD_MAGNET_DOWNLOADS } from "@/lib/resource-links";

export const Route = createFileRoute("/estimating/thanks")({
  head: () => ({ meta: [{ title: "Estimating Checklist on the way — ALP" }] }),
  component: () => (
    <LeadThankYou
      title={<>Check your inbox.</>}
      body="The Estimating Checklist is on its way. If you don't see it within a minute, check spam."
      downloadUrl={LEAD_MAGNET_DOWNLOADS.estimating}
      downloadLabel="Download checklist"
    />
  ),
});
