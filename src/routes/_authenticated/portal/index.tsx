import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  Hammer,
  MessageSquareText,
  PlayCircle,
  Ruler,
  ShieldCheck,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getDashboard } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMembershipPlan, titleCase } from "@/lib/membership-plan";

const BIWEEKLY_CALL_INTERVAL_MS = 14 * 86400000;
const LIVE_CALL_DURATION_MS = 90 * 60 * 1000;

const LIVE_CALL_EXCEPTIONS: Record<string, { movedTo: Date; note: string }> = {
  "2026-05-10": {
    movedTo: new Date(Date.UTC(2026, 4, 9, 21, 0, 0)),
    note: "Moved for Mother's Day weekend.",
  },
};

const memberPillars = [
  {
    icon: Calendar,
    label: "Live calls",
    detail: "Bi-weekly strategy, bid review, and operating-system work with Marshall.",
  },
  {
    icon: PlayCircle,
    label: "Replay library",
    detail: "Recorded sessions with the decision context preserved for later review.",
  },
  {
    icon: MessageSquareText,
    label: "Community",
    detail: "Daily contractor conversation stays in Discord where members already gather.",
  },
  {
    icon: FileText,
    label: "Templates",
    detail: "Contracts, SOPs, scorecards, scripts, and frameworks members can put to work.",
  },
];

const alpSystemComponents = [
  { label: "Vision", detail: "V/TO, core focus, targets, and quarterly rocks." },
  { label: "People", detail: "Accountability chart, seats, GWC, and right-person fit." },
  { label: "Data", detail: "Scorecards, leading indicators, ownership, and weekly goals." },
  { label: "Issues", detail: "IDS discipline for root-cause decisions and action items." },
  { label: "Process", detail: "Core processes, SOPs, FBA, and repeatable execution." },
  { label: "Traction", detail: "L10 pulse, rocks, to-dos, and operating cadence." },
];

const commandCenterTools = [
  {
    to: "/portal/templates",
    icon: ClipboardCheck,
    label: "ALP Operating System",
    eyebrow: "Flagship system",
    value: "Build the company",
    hint: "V/TO, accountability, scorecard, process, KPIs",
  },
  {
    to: "/portal/constructline",
    icon: Hammer,
    label: "ConstructLine Hub",
    eyebrow: "Bid command center",
    value: "Run the pursuit",
    hint: "Scope, pricing, schedule, and bid continuity",
  },
  {
    to: "/portal/takeoff",
    icon: Ruler,
    label: "Basis",
    eyebrow: "Takeoff",
    value: "Quantify the work",
    hint: "Scopes, quantities, line items, and review",
  },
  {
    to: "/portal/scheduler",
    icon: Calendar,
    label: "Baseline",
    eyebrow: "Schedule",
    value: "Plan the work",
    hint: "Durations, sequence, milestones, and logic",
  },
  {
    to: "/portal/cost-library",
    icon: DollarSign,
    label: "Cost and Trade Libraries",
    eyebrow: "Pricing",
    value: "Price with memory",
    hint: "Items, assemblies, unit costs, and labor rates",
  },
];

type IconComponent = typeof Hammer;

function getStandardNextCallDate(now = new Date()): Date {
  const anchor = new Date(Date.UTC(2025, 2, 30, 21, 0, 0));

  if (now.getTime() <= anchor.getTime() + LIVE_CALL_DURATION_MS) return anchor;

  const cyclesPassed = Math.floor((now.getTime() - anchor.getTime()) / BIWEEKLY_CALL_INTERVAL_MS);
  const currentCallDate = new Date(anchor.getTime() + cyclesPassed * BIWEEKLY_CALL_INTERVAL_MS);

  if (now.getTime() <= currentCallDate.getTime() + LIVE_CALL_DURATION_MS) {
    return currentCallDate;
  }

  return new Date(currentCallDate.getTime() + BIWEEKLY_CALL_INTERVAL_MS);
}

function getNextCallDate(now = new Date()): Date {
  const standardDate = getStandardNextCallDate(now);
  const exception = LIVE_CALL_EXCEPTIONS[standardDate.toISOString().split("T")[0]];

  if (!exception) return standardDate;

  const exceptionWindowEnd = new Date(exception.movedTo.getTime() + LIVE_CALL_DURATION_MS);
  if (now.getTime() <= exceptionWindowEnd.getTime()) return exception.movedTo;
  return new Date(standardDate.getTime() + BIWEEKLY_CALL_INTERVAL_MS);
}

function buildCalendarUrl({
  title,
  details,
  start,
  durationHours = 1.5,
  location,
}: {
  title: string;
  details: string;
  start: Date;
  durationHours?: number;
  location: string;
}) {
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const serialize = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title,
  )}&dates=${serialize(start)}/${serialize(end)}&details=${encodeURIComponent(
    details,
  )}&location=${encodeURIComponent(location)}`;
}

export const Route = createFileRoute("/_authenticated/portal/")({
  head: () => ({ meta: [{ title: "Dashboard — ALP Contractor Circle" }] }),
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="container-prose space-y-4 py-20 text-center">
      <h1 className="font-display text-3xl">Couldn't load your dashboard</h1>
      <p className="text-sm text-muted-foreground">{error.message || "Please try again."}</p>
      <Button
        onClick={() => {
          router.invalidate();
          reset();
        }}
      >
        Try again
      </Button>
    </div>
  );
}

function DashboardPage() {
  const { user, loading } = useAuth();
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: !!user && !loading,
    retry: 1,
  });

  if (loading || isLoading || !data) return <DashboardSkeleton />;

  const {
    profile,
    member,
    replays,
    featuredTemplates,
    announcements,
    liveCallTopic,
    communityUrl,
  } = data;
  const latest = replays[0];
  const displayName = profile?.display_name ?? "Builder";
  const firstName = displayName.split(" ")[0] || "Builder";
  const memberSince = member?.joined_at ? new Date(member.joined_at) : null;
  const days = memberSince
    ? Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / 86400000))
    : 0;
  const nextCallDate = getNextCallDate();
  const liveCallUrl = data.liveCallUrl;
  const calendarUrl = buildCalendarUrl({
    title: `Contractor Circle: ${liveCallTopic}`,
    details: liveCallUrl
      ? `Contractor Circle live call with Marshall.\n\nTopic:\n${liveCallTopic}\n\nJoin link:\n${liveCallUrl}`
      : `Contractor Circle live call with Marshall.\n\nTopic:\n${liveCallTopic}\n\nJoin details are posted in the portal and Discord before the call.`,
    start: nextCallDate,
    location: liveCallUrl ?? "Contractor Circle portal",
  });

  return (
    <div className="container-prose space-y-7 py-6 sm:py-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden border border-hairline bg-foreground text-background"
      >
        <div className="grid gap-px bg-background/10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="bg-foreground p-6 sm:p-8 lg:p-10">
            <p className="font-mono text-xs uppercase tracking-wider text-amber">
              Contractor Circle member area
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Welcome to Contractor Circle, <span className="text-amber">{firstName}</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-background/68 sm:text-base">
              This is the operating room for live consulting, replayed judgment, community
              conversation, proven templates, and proprietary ALP tools built from real construction
              execution.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-background text-foreground">
                <Link to="/portal/templates">
                  Open ALP OS <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/portal/replays">
                  Watch replays <PlayCircle className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-px bg-background/10 sm:grid-cols-2 lg:grid-cols-1">
            <Stat label="Membership" value={titleCase(member?.status ?? "trialing")} tone="dark" />
            <Stat label="Plan" value={formatMembershipPlan(member?.plan)} tone="dark" />
            <Stat label="Days inside" value={String(days)} tone="dark" />
            <Stat label="Replay archive" value={`${replays.length}+`} tone="dark" />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <NextLiveCallPanel
          nextCallDate={nextCallDate}
          calendarUrl={calendarUrl}
          liveCallUrl={liveCallUrl}
          topic={liveCallTopic}
        />

        <div className="grid gap-5">
          {latest && <LatestReplayCard latest={latest} />}
          <CommunityPanel communityUrl={communityUrl} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <OperatingSystemPanel />
        <MemberValuePanel />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Proprietary tools"
          title="Build the company, then run the work"
          body="ALP OS is the company layer. ConstructLine, Basis, Baseline, and the pricing libraries are the pursuit and project layer."
        />
        <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-5">
          {commandCenterTools.map((tool) => (
            <WorkLaneCard key={tool.to} {...tool} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ResourceLibraryPanel featuredTemplates={featuredTemplates} />
        <AnnouncementsPanel announcements={announcements} />
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-wider text-amber">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={dark ? "bg-foreground p-5" : "bg-background p-5"}>
      <p
        className={`text-xs uppercase tracking-wider ${
          dark ? "text-background/50" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-display text-2xl tabular-nums ${
          dark ? "text-background" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function NextLiveCallPanel({
  nextCallDate,
  calendarUrl,
  liveCallUrl,
  topic,
}: {
  nextCallDate: Date;
  calendarUrl: string;
  liveCallUrl: string | null;
  topic: string;
}) {
  return (
    <Card className="overflow-hidden border-hairline p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="flex flex-col justify-between bg-amber-soft p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-amber">Next live call</p>
            <p className="mt-5 font-display text-6xl leading-none tabular-nums">
              {format(nextCallDate, "d")}
            </p>
            <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              {format(nextCallDate, "MMMM")}
            </p>
          </div>
          <Badge className="mt-6 w-fit bg-foreground text-background">5:00 PM ET</Badge>
        </div>

        <div className="bg-background p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Bi-weekly call</Badge>
            <span className="text-xs text-muted-foreground">
              {format(nextCallDate, "EEEE, MMMM d")}
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight">{topic}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Bring one active bid, one stuck decision, or one operating-system gap. This is where the
            consulting side of Contractor Circle becomes usable inside the business.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild={!!liveCallUrl} disabled={!liveCallUrl}>
              {liveCallUrl ? (
                <a href={liveCallUrl} target="_blank" rel="noopener noreferrer">
                  Join Zoom <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <span>Zoom link pending</span>
              )}
            </Button>
            <Button asChild variant="outline">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to calendar
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/portal/replays">
                <PlayCircle className="mr-2 h-4 w-4" />
                Past calls
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LatestReplayCard({
  latest,
}: {
  latest: {
    title: string;
    description: string | null;
    duration_minutes: number | null;
    tags?: string[] | null;
  };
}) {
  return (
    <Card className="border-hairline p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Latest replay
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">{latest.title}</h2>
        </div>
        <PlayCircle className="h-5 w-5 shrink-0 text-amber" />
      </div>
      {latest.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {latest.description}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {latest.duration_minutes ? `${latest.duration_minutes} min` : "Replay"}
        </Badge>
        {latest.tags?.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/portal/replays">
          Open replay library <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}

function CommunityPanel({ communityUrl }: { communityUrl: string | null }) {
  return (
    <Card className="border-hairline p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Community
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">Discord is the daily room</h2>
        </div>
        <Users className="h-5 w-5 shrink-0 text-amber" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The portal holds the calls, recordings, templates, and tools. Discord remains the active
        conversation layer for quick questions, peer review, and member context.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <a
          href={communityUrl ?? "https://discord.com/app"}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Discord <ArrowUpRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </Card>
  );
}

function OperatingSystemPanel() {
  return (
    <Card className="overflow-hidden border-hairline bg-foreground p-0 text-background">
      <div className="grid gap-px bg-background/10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="bg-foreground p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center border border-background/10 bg-background text-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-7 font-mono text-xs uppercase tracking-wider text-amber">
            Flagship member system
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight">
            ALP Operating System
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/68">
            The commercially durable promise of Contractor Circle is not another folder of
            documents. It is a company operating system: vision, accountability, numbers, issues,
            processes, and weekly traction in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="bg-background text-foreground">
              <Link to="/portal/templates">
                Open OS library <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/portal/replays">
                Watch OS sessions <PlayCircle className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-px bg-background/10 sm:grid-cols-2">
          {alpSystemComponents.map((item) => (
            <div key={item.label} className="bg-foreground p-5">
              <p className="font-display text-xl leading-tight text-background">{item.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-background/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MemberValuePanel() {
  return (
    <Card className="border-hairline p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Member value
      </p>
      <h2 className="mt-2 font-display text-2xl leading-tight">Why members come back</h2>
      <div className="mt-5 divide-y divide-hairline">
        {memberPillars.map((pillar) => (
          <div key={pillar.label} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
              <pillar.icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-medium leading-tight">{pillar.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pillar.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WorkLaneCard({
  to,
  icon: Icon,
  label,
  eyebrow,
  value,
  hint,
}: {
  to: string;
  icon: IconComponent;
  label: string;
  eyebrow: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-44 flex-col justify-between bg-background p-5 transition-colors hover:bg-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
          <h3 className="mt-3 font-display text-xl leading-tight">{label}</h3>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-amber" />
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{value}</span>
          <span> / {hint}</span>
        </p>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function ResourceLibraryPanel({
  featuredTemplates,
}: {
  featuredTemplates: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    badge: string | null;
    pages: string | null;
    file_type: string | null;
  }>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Template library"
          title="Stop rebuilding from scratch"
          body="The most useful assets should feel close to the work: operating system docs, SOPs, contracts, checklists, and scripts."
        />
        <Link
          to="/portal/templates"
          className="text-sm text-foreground underline underline-offset-4"
        >
          All templates
        </Link>
      </div>

      <div className="grid gap-3">
        {featuredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <Link
              to="/portal/templates"
              className="group grid gap-px border border-hairline bg-hairline transition-colors hover:border-foreground/25 md:grid-cols-[11rem_minmax(0,1fr)_6rem]"
            >
              <div className="bg-background p-4">
                <Badge variant={index === 0 ? "default" : "outline"}>{template.category}</Badge>
                {template.badge && (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-amber">
                    {template.badge}
                  </p>
                )}
              </div>
              <div className="bg-background p-4">
                <h3 className="font-display text-xl leading-tight">{template.title}</h3>
                {template.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 bg-background p-4 md:flex-col md:items-end">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {template.file_type}
                  {template.pages ? ` / ${template.pages}` : ""}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AnnouncementsPanel({
  announcements,
}: {
  announcements: Array<{
    id: string;
    title: string;
    body: string | null;
    pinned: boolean | null;
    published_at: string;
  }>;
}) {
  return (
    <Card className="border-hairline p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            From the Circle
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">Updates</h2>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <ul className="mt-5 divide-y divide-hairline">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2">
              {announcement.pinned && (
                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-amber" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{announcement.title}</p>
                {announcement.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {announcement.body}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(announcement.published_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </li>
        ))}
        {announcements.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">Nothing new yet.</li>
        )}
      </ul>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-prose space-y-8 py-10">
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <Skeleton className="h-64" />
        <div className="grid gap-5">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
