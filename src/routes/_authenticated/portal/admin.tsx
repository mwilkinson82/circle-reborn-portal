import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/admin")({
  head: () => ({ meta: [{ title: "Admin — ALP Contractor Circle" }] }),
  component: () => <Outlet />,
});
