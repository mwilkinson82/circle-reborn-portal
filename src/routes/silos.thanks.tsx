import { createFileRoute } from "@tanstack/react-router";
import { LeadThankYou } from "@/components/lead-magnet";
import { LEAD_MAGNET_DOWNLOADS } from "@/lib/resource-links";

export const Route = createFileRoute("/silos/thanks")({
  head: () => ({ meta: [{ title: "Three Silos guide on the way — ALP" }] }),
  component: () => (
    <LeadThankYou
      title={<>Check your inbox.</>}
      body="The Three Silos guide is on its way. Check spam if it doesn't show up in a minute."
      downloadUrl={LEAD_MAGNET_DOWNLOADS.silos}
      downloadLabel="Download guide"
    />
  ),
});
