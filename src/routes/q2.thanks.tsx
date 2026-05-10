import { createFileRoute } from "@tanstack/react-router";
import { LeadThankYou } from "@/components/lead-magnet";

export const Route = createFileRoute("/q2/thanks")({
  head: () => ({ meta: [{ title: "Q2 Playbook on the way — ALP" }] }),
  component: () => (
    <LeadThankYou
      title={<>Check your inbox.</>}
      body="The Q2 Playbook is on its way. Give it a minute — if you don't see it, check spam and whitelist hello@alp.build."
    />
  ),
});
