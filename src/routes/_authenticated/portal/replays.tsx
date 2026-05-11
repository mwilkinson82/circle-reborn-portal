import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, Calendar, Clock, PlayCircle, Search, Video, X } from "lucide-react";
import { getReplayLibrary } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/portal/replays")({
  head: () => ({ meta: [{ title: "Replays — ALP Contractor Circle" }] }),
  component: ReplaysPage,
});

function ReplaysPage() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const fetchReplays = useServerFn(getReplayLibrary);
  const { data, isLoading } = useQuery({
    queryKey: ["replay-library", user?.id],
    queryFn: () => fetchReplays(),
    enabled: !!user && !loading,
  });

  const replays = useMemo(() => data ?? [], [data]);
  const featured = replays[0];
  const totalMinutes = replays.reduce((sum, replay) => sum + (replay.duration_minutes ?? 0), 0);
  const normalizedQuery = query.trim().toLowerCase();
  const tagFilters = useMemo(() => {
    const counts = new Map<string, number>();
    replays.forEach((replay) => {
      replay.tags?.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
    });

    return [
      { value: "all", label: "All", count: replays.length },
      ...[...counts.keys()].sort().map((value) => ({
        value,
        label: value,
        count: counts.get(value) ?? 0,
      })),
    ];
  }, [replays]);
  const filteredReplays = useMemo(() => {
    return replays.filter((replay) => {
      const tagMatch = tag === "all" || replay.tags?.includes(tag);
      const searchable = [replay.title, replay.description, ...(replay.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return tagMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [normalizedQuery, replays, tag]);
  const videosReady = replays.filter((replay) => replay.video_url).length;
  const hasActiveFilters = tag !== "all" || normalizedQuery.length > 0;

  return (
    <div className="container-prose py-8 sm:py-10 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="border border-hairline bg-foreground p-6 text-background sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">Member Library</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Replays built for bid-room judgment.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/65">
            Live calls, bid reviews, frameworks, and practical field-to-office decision work.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-1">
          <StatBlock label="Sessions" value={String(replays.length)} />
          <StatBlock label="Ready" value={`${videosReady}/${replays.length}`} />
          <StatBlock label="Watch time" value={totalMinutes ? `${totalMinutes}m` : "New"} />
          <StatBlock
            label="Latest"
            value={featured ? format(new Date(featured.recorded_at), "MMM d") : "Soon"}
          />
        </div>
      </section>

      {isLoading ? (
        <ReplaySkeleton />
      ) : replays.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {featured && (
            <Card className="grid overflow-hidden border-hairline lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="relative aspect-[16/8] bg-[radial-gradient(circle_at_80%_85%,rgba(212,119,44,0.35),transparent_32%),linear-gradient(135deg,#090a0d_0%,#15171c_52%,#d7c3a6_100%)]">
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-background">
                    <p className="text-xs uppercase tracking-wider opacity-70">Latest replay</p>
                    <h2 className="mt-2 max-w-xl font-display text-3xl leading-tight">
                      {featured.title}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {featured.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {featured.description}
                  </p>
                </div>
                <ReplayAction replay={featured} className="mt-6" />
              </div>
            </Card>
          )}

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <h2 className="font-display text-2xl">Replay library</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredReplays.length} of {replays.length} sessions
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sessions"
                  className="h-11 rounded-none pl-9 pr-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tagFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTag(item.value)}
                  className={`border px-3 py-2 text-xs font-medium transition-colors ${
                    tag === item.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-hairline bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <span className="ml-2 font-mono opacity-70">{item.count}</span>
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setTag("all");
                    setQuery("");
                  }}
                  className="border border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            {filteredReplays.length === 0 ? (
              <Card className="border-hairline p-8 text-center">
                <h3 className="font-display text-2xl">No matching sessions</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Try a different keyword or topic.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredReplays.map((replay) => (
                  <Card key={replay.id} className="overflow-hidden border-hairline p-0 shadow-sm">
                    <div className="grid gap-px bg-hairline lg:grid-cols-[15rem_minmax(0,1fr)_11rem]">
                      <div className="relative flex min-h-40 items-center justify-center bg-[linear-gradient(135deg,#101216_0%,#20242b_70%,#d4a15e_100%)] text-background">
                        {replay.thumbnail_url ? (
                          <img
                            src={replay.thumbnail_url}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-foreground/20" />
                        <PlayCircle className="relative h-11 w-11" />
                      </div>

                      <div className="bg-background p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={replay.video_url ? "default" : "outline"}>
                            {replay.video_url ? "Video ready" : "Video link needed"}
                          </Badge>
                          {replay.tags?.map((item) => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="mt-4 font-display text-xl leading-tight">{replay.title}</h3>
                        {replay.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            {replay.description}
                          </p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {replay.duration_minutes ?? "New"} min
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatReplayDate(replay.recorded_at)}
                          </span>
                          {!replay.video_url && (
                            <span className="flex items-center gap-2">
                              <Video className="h-3.5 w-3.5" />
                              Awaiting Manus export
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-start bg-background p-5 lg:justify-center">
                        <ReplayAction replay={replay} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ReplayAction({
  replay,
  className,
}: {
  replay: { video_url: string | null };
  className?: string;
}) {
  if (!replay.video_url) {
    return (
      <Button type="button" variant="outline" disabled className={className}>
        Coming soon
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <a href={replay.video_url} target="_blank" rel="noopener noreferrer">
        Watch <ArrowUpRight className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}

function ReplaySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-72 border-hairline" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-hairline p-8 text-center">
      <h2 className="font-display text-2xl">Replay room is warming up</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Published sessions will appear here as the Circle library is loaded into the new portal.
      </p>
    </Card>
  );
}

function formatReplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return format(date, "MMM d, yyyy");
}
