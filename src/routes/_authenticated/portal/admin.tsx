import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/portal/admin")({
  head: () => ({ meta: [{ title: "Admin — ALP Contractor Circle" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="container-prose py-12 space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin</p>
        <h1 className="font-display text-3xl mt-2">Admin tools</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Run one-time maintenance actions for membership and billing data.
        </p>
      </div>
      <Button asChild>
        <Link to="/portal/admin/backfill">Open subscription backfill</Link>
      </Button>
    </div>
  );
}