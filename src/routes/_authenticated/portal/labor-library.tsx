import { createFileRoute } from "@tanstack/react-router";
import { ConstructLineLinkOut } from "@/components/constructline-link-out";
import { CONSTRUCTLINE_BY_KEY } from "@/lib/constructline-links";

export const Route = createFileRoute("/_authenticated/portal/labor-library")({
  head: () => ({ meta: [{ title: "Trade Rate Library — ALP Contractor Circle" }] }),
  component: () => <ConstructLineLinkOut link={CONSTRUCTLINE_BY_KEY["labor-library"]} />,
});
