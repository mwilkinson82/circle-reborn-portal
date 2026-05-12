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

type ReplayItem = {
  id: string;
  title: string;
  description: string | null;
  recorded_at: string;
  duration_minutes: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
};

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

  const replays = useMemo(() => (data ?? []) as ReplayItem[], [data]);
  const featured = replays[0];
  const totalMinutes = replays.reduce((sum, replay) => sum + (replay.duration_minutes ?? 0), 0);
  const videosReady = replays.filter((replay) => replay.video_url).length;
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
  const hasActiveFilters = tag !== "all" || normalizedQuery.length > 0;

  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="surface-command command-panel p-6 sm:p-8 lg:p-10">
          <p className="eyebrow text-amber">Call Library</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Replays built for bid-room judgment.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/68">
            Archived calls, bid reviews, operating-system decisions, and practical field-to-office
            judgment. These are not videos; they are archived judgment sessions for the next time a
            member needs precedent, not more noise.
          </p>
          <div className="mt-7 grid gap-2 text-xs text-background/62 sm:grid-cols-3">
            <LibraryCue label="Watch" body="Find the judgment" />
            <LibraryCue label="Apply" body="Use it on the live issue" />
            <LibraryCue label="Carry" body="Move decisions into AOS" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
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
          {featured ? <FeaturedReplay replay={featured} /> : null}

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <p className="eyebrow text-amber">Archive</p>
                <h2 className="mt-2 font-display text-2xl">Judgment library</h2>
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
                  className="h-11 pl-9 pr-9"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tagFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTag(item.value)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    tag === item.value
                      ? "surface-command text-background"
                      : "surface-library text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <span className="ml-2 font-mono opacity-70">{item.count}</span>
                </button>
              ))}
              {hasActiveFilters ? (
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
              ) : null}
            </div>

            {filteredReplays.length === 0 ? (
              <Card className="surface-library p-8 text-center">
                <h3 className="font-display text-2xl">No matching sessions</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Try a different keyword or topic.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredReplays.map((replay) => (
                  <ReplayCard key={replay.id} replay={replay} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function FeaturedReplay({ replay }: { replay: ReplayItem }) {
  return (
    <Card className="surface-operating asset-stack overflow-hidden p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ReplayVisual replay={replay} featured />
        <div className="flex flex-col justify-between bg-background p-6">
          <div>
            <p className="eyebrow text-amber">Featured judgment</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ReplayStatus replay={replay} />
              {replay.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="mt-5 font-display text-3xl leading-tight">{replay.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {replay.description ?? "Archived call judgment ready for review."}
            </p>
            <ReplayBestFor replay={replay} />
            <ReplayMeta replay={replay} />
          </div>
          <ReplayAction replay={replay} className="mt-6 w-full justify-between" />
        </div>
      </div>
    </Card>
  );
}

function ReplayCard({ replay }: { replay: ReplayItem }) {
  return (
    <Card className="surface-library asset-stack overflow-hidden p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[17rem_minmax(0,1fr)_12rem]">
        <ReplayVisual replay={replay} />
        <div className="bg-background p-5">
          <div className="flex flex-wrap items-center gap-2">
            <ReplayStatus replay={replay} />
            {replay.tags?.slice(0, 4).map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
          <h3 className="mt-4 font-display text-2xl leading-tight">{replay.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {replay.description ?? "Replay notes are being prepared for this session."}
          </p>
          <ReplayBestFor replay={replay} />
          <ReplayMeta replay={replay} />
        </div>
        <div className="flex items-center bg-background p-5">
          <ReplayAction replay={replay} className="w-full justify-between" />
        </div>
      </div>
    </Card>
  );
}

function ReplayVisual({ replay, featured = false }: { replay: ReplayItem; featured?: boolean }) {
  return (
    <div
      className={`judgment-thumb flex min-h-52 items-end p-5 text-background ${
        featured ? "aspect-[16/8] lg:aspect-auto" : "lg:min-h-full"
      }`}
    >
      {replay.thumbnail_url ? (
        <img
          src={replay.thumbnail_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-foreground/35" />
      <div className="relative z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-background/20 bg-background/10 backdrop-blur">
          <PlayCircle className="h-5 w-5 text-amber" />
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-background/58">
          {replay.video_url ? "Replay ready" : getUnavailableLabel(replay)}
        </p>
      </div>
    </div>
  );
}

function ReplayStatus({ replay }: { replay: ReplayItem }) {
  return (
    <Badge variant={replay.video_url ? "default" : "outline"}>
      {replay.video_url ? "Video ready" : getUnavailableLabel(replay)}
    </Badge>
  );
}

function ReplayMeta({ replay }: { replay: ReplayItem }) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        {replay.duration_minutes ? `${replay.duration_minutes} min` : "Duration pending"}
      </span>
      <span className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5" />
        {formatReplayDate(replay.recorded_at)}
      </span>
      {!replay.video_url ? (
        <span className="flex items-center gap-2">
          <Video className="h-3.5 w-3.5" />
          Replay link pending
        </span>
      ) : null}
    </div>
  );
}

function ReplayBestFor({ replay }: { replay: ReplayItem }) {
  const topics = replay.tags?.slice(0, 2).join(" and ");
  return (
    <p className="mt-4 border-l-2 border-amber/40 pl-3 text-xs leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">Best for:</span>{" "}
      {topics
        ? `Members working through ${topics.toLowerCase()} decisions.`
        : "Members looking for precedent before they bring a live issue into the room."}
    </p>
  );
}

function ReplayAction({ replay, className }: { replay: ReplayItem; className?: string }) {
  if (!replay.video_url) {
    return (
      <Button type="button" variant="outline" disabled className={className}>
        {getUnavailableLabel(replay)}
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <a href={replay.video_url} target="_blank" rel="noopener noreferrer">
        Watch replay <ArrowUpRight className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}

function getUnavailableLabel(replay: ReplayItem) {
  if (replay.recorded_at) return "Awaiting replay link";
  if (replay.duration_minutes) return "Video being added";
  return "Replay link pending";
}

function LibraryCue({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex items-center gap-3 border border-background/10 bg-background/[0.04] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-amber">{label}</span>
      <span>{body}</span>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-library rounded-lg p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
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
    <Card className="surface-library p-8 text-center">
      <h2 className="font-display text-2xl">Replay room is being loaded</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Published calls will appear here as archived judgment for the Circle.
      </p>
    </Card>
  );
}

function formatReplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return format(date, "MMM d, yyyy");
}
