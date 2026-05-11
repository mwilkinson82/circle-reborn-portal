import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Clock, PlayCircle } from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/replays")({
  head: () => ({ meta: [{ title: "Replays — ALP Contractor Circle" }] }),
  component: ReplaysPage,
});

function ReplaysPage() {
  const { user, loading } = useAuth();
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: !!user && !loading,
  });

  const replays = data?.replays ?? [];

  return (
    <div className="container-prose py-10 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Member Library</p>
        <h1 className="font-display text-4xl mt-2">Replays</h1>
        <p className="text-sm text-muted-foreground mt-2">
          The full replay library is next. This page keeps the portal links live while the library
          room is rebuilt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-48 border-hairline" />
            ))
          : replays.map((replay) => (
              <Card key={replay.id} className="overflow-hidden border-hairline">
                <div className="aspect-video bg-gradient-to-br from-foreground to-amber-soft text-background flex items-center justify-center">
                  <PlayCircle className="h-12 w-12" />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl leading-tight">{replay.title}</h2>
                  {replay.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {replay.description}
                    </p>
                  )}
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {replay.duration_minutes ?? "New"} min
                  </p>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
