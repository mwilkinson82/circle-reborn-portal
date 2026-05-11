import { createFileRoute } from "@tanstack/react-router";
import { Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/takeoff")({
  component: TakeoffPage,
});

function TakeoffPage() {
  return (
    <div className="container-prose py-12">
      <Card className="border-hairline p-8">
        <Ruler className="h-5 w-5 text-amber" />
        <h1 className="font-display text-3xl mt-4">Takeoffs are not migrated yet.</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-prose">
          This keeps the portal navigation from dead-ending while ConstructLine is rebuilt into the
          new Lovable portal.
        </p>
      </Card>
    </div>
  );
}
