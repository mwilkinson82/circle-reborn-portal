import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
  DollarSign,
  FileText,
  Hammer,
  Network,
  MessageSquareText,
  PlayCircle,
  Ruler,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getDashboard } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    to: "/portal/alp-os",
    icon: ClipboardList,
    label: "ALP Operating System",
    eyebrow: "Company system",
    value: "Scale the business",
    hint: "Vision, accountability, process, KPIs",
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

const businessSystemTools = [
  {
    to: "/portal/alp-os",
    icon: ClipboardCheck,
    label: "Operating System Library",
    eyebrow: "Use now",
    body: "Build the company layer: V/TO, accountability, scorecards, SOPs, processes, rocks, and weekly cadence.",
  },
  {
    to: "/portal/alp-os",
    icon: BarChart3,
    label: "Scorecard and KPI Builder",
    eyebrow: "Build next",
    body: "The future dashboard starts here: leading indicators, owner assignment, targets, and weekly visibility.",
  },
  {
    to: "/portal/alp-os",
    icon: Network,
    label: "Accountability Chart",
    eyebrow: "Build next",
    body: "Clarify seats, roles, ownership, and right-person/right-seat decisions as the company scales.",
  },
  {
    to: "/portal/replays",
    icon: TrendingUp,
    label: "Scale and Exit Path",
    eyebrow: "Member guidance",
    body: "Replay-backed guidance for margin, systems, leadership depth, and building a business that can transfer.",
  },
];

type IconComponent = typeof Hammer;

function getStandardNextCallDate(now = new Date()): Date {
  const anchor = new Date(Date.UTC(2026, 4, 24, 21, 0, 0));

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
  head: () => ({ meta: [{ title: "Home — ALP Contractor Circle" }] }),
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="container-prose space-y-4 py-20 text-center">
      <h1 className="font-display text-3xl">Couldn't load your home base</h1>
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
    replays,
    featuredTemplates,
    announcements,
    liveCallTopic,
    liveCallCalendarUrl,
    communityUrl,
  } = data;
  const latest = replays[0];
  const displayName = profile?.display_name ?? "Builder";
  const firstName = displayName.split(" ")[0] || "Builder";
  const nextCallDate = getNextCallDate();
  const liveCallUrl = data.liveCallUrl;
  const calendarUrl =
    liveCallCalendarUrl ??
    buildCalendarUrl({
      title: `Contractor Circle: ${liveCallTopic}`,
      details: liveCallUrl
        ? `Contractor Circle live call with Marshall.\n\nTopic:\n${liveCallTopic}\n\nJoin link:\n${liveCallUrl}`
        : `Contractor Circle live call with Marshall.\n\nTopic:\n${liveCallTopic}\n\nJoin details are posted in the portal and Discord before the call.`,
      start: nextCallDate,
      location: liveCallUrl ?? "Contractor Circle portal",
    });

  return (
    <div className="container-prose space-y-8 py-6 sm:py-8">
      <CircleHomeHero firstName={firstName} nextCallDate={nextCallDate} />

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

      <BusinessSystemPanel />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Specialist tools"
          title="Use the project tools when the work calls for them"
          body="ConstructLine, Basis, Baseline, and the pricing libraries are powerful specialist tools. They support estimating, scheduling, and bid continuity when that is the problem in front of you."
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

function CircleHomeHero({ firstName, nextCallDate }: { firstName: string; nextCallDate: Date }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-8 border border-hairline bg-background p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-10"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">
          Contractor Circle home
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Build the company, <span className="text-amber">{firstName}</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Contractor Circle is the business operating room: live guidance, replayed judgment,
          community context, templates, and ALP tools for contractors who want scale, systems,
          profit, and optionality.
        </p>
        <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
          <HomeSignal
            label="Next call"
            value={format(nextCallDate, "MMM d")}
            detail="Bring a bid, a people issue, or a systems gap."
          />
          <HomeSignal
            label="Core system"
            value="ALP OS"
            detail="Vision, accountability, scorecards, process, KPIs."
          />
          <HomeSignal
            label="Daily room"
            value="Discord"
            detail="Questions, context, peer review, and member conversation."
          />
        </div>
      </div>

      <div className="flex flex-col justify-between border border-hairline bg-secondary p-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Start here
          </p>
          <h2 className="mt-3 font-display text-2xl leading-tight">Your next useful move</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This is not a data dashboard yet. It is the home base for getting guidance, using the
            operating system, and putting the tools to work.
          </p>
        </div>
        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link to="/portal/alp-os">
              Open ALP OS <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/portal/replays">
              Watch replays <PlayCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

function HomeSignal({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl leading-tight">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
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
              Every other Sunday at 5:00 PM ET · Next: {format(nextCallDate, "MMMM d")}
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
              <Link to="/portal/alp-os">
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

function BusinessSystemPanel() {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
          <Building2 className="h-5 w-5" />
        </span>
        <SectionHeader
          eyebrow="Business growth tools"
          title="The tools should help owners scale, not just estimate"
          body="The highest-value path for most members is learning how to make more money, install systems, build leadership depth, and create a company that can run with less owner drag."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {businessSystemTools.map((tool) => (
          <GrowthToolCard key={tool.label} {...tool} />
        ))}
      </div>
    </section>
  );
}

function GrowthToolCard({
  to,
  icon: Icon,
  label,
  eyebrow,
  body,
}: {
  to: string;
  icon: IconComponent;
  label: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-56 flex-col justify-between border border-hairline bg-background p-5 transition-colors hover:border-foreground/25 hover:bg-secondary"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber">{eyebrow}</p>
          <Icon className="h-5 w-5 shrink-0 text-amber" />
        </div>
        <h3 className="mt-5 font-display text-2xl leading-tight">{label}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm font-medium">
        Open path
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
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
