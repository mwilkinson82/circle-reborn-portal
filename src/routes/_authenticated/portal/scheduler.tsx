import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/scheduler")({
  component: SchedulerPage,
});

function SchedulerPage() {
  return (
    <div className="container-prose py-12">
      <Card className="border-hairline p-8">
        <Calendar className="h-5 w-5 text-amber" />
        <h1 className="font-display text-3xl mt-4">Scheduler is coming over next.</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-prose">
          Lovable has the portal shell live. The CPM and Gantt scheduler can be wired in after the
          membership and admin migration path is stable.
        </p>
      </Card>
    </div>
  );
}
