import { createFileRoute } from "@tanstack/react-router";
import { ConstructLineLinkOut } from "@/components/constructline-link-out";
import { CONSTRUCTLINE_BY_KEY } from "@/lib/constructline-links";

export const Route = createFileRoute("/_authenticated/portal/constructline")({
  head: () => ({ meta: [{ title: "ConstructLine Hub — ALP Contractor Circle" }] }),
  component: () => <ConstructLineLinkOut link={CONSTRUCTLINE_BY_KEY["constructline"]} />,
});
