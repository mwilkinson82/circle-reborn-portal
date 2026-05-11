import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/cost-library")({
  component: CostLibraryPage,
});

function CostLibraryPage() {
  return (
    <div className="container-prose py-12">
      <Card className="border-hairline p-8">
        <BookOpen className="h-5 w-5 text-amber" />
        <h1 className="font-display text-3xl mt-4">Cost Library is queued for migration.</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-prose">
          The navigation now lands cleanly here until the regional cost library is connected to this
          portal.
        </p>
      </Card>
    </div>
  );
}
