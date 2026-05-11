import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Hammer,
  MessageSquareText,
  PlayCircle,
  Ruler,
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

      <MemberCommandStrip
        nextCallDate={nextCallDate}
        calendarUrl={calendarUrl}
        liveCallUrl={liveCallUrl}
        topic={liveCallTopic}
        latest={latest}
        communityUrl={communityUrl}
      />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Member workspaces"
          title="Choose the workspace for the job in front of you"
          body="Start with ALP OS when you are building the business. Use ConstructLine, Basis, Baseline, and the pricing libraries when the work is a live pursuit, estimate, schedule, or cost question."
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
      className="grid gap-6 border border-hairline bg-background p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">
          Contractor Circle home
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">
          Build the company, <span className="text-amber">{firstName}</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Contractor Circle is the business operating room: live guidance, replayed judgment,
          community context, templates, and ALP tools for contractors who want scale, systems,
          profit, and optionality.
        </p>
        <div className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
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

      <div className="flex flex-col justify-between border border-hairline bg-secondary p-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Start here
          </p>
          <h2 className="mt-2 font-display text-xl leading-tight">Your next useful move</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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

function MemberCommandStrip({
  nextCallDate,
  calendarUrl,
  liveCallUrl,
  topic,
  latest,
  communityUrl,
}: {
  nextCallDate: Date;
  calendarUrl: string;
  liveCallUrl: string | null;
  topic: string;
  latest:
    | {
        title: string;
        description: string | null;
        duration_minutes: number | null;
        tags?: string[] | null;
      }
    | undefined;
  communityUrl: string | null;
}) {
  return (
    <section className="grid gap-px overflow-hidden border border-hairline bg-hairline lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.85fr)_minmax(15rem,0.85fr)]">
      <div className="grid gap-px bg-hairline sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        <div className="flex flex-col justify-between bg-amber-soft p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber">
            Next live call
          </p>
          <div className="mt-4">
            <p className="font-display text-5xl leading-none tabular-nums">
              {format(nextCallDate, "d")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {format(nextCallDate, "MMM")}
            </p>
          </div>
          <Badge className="mt-4 w-fit bg-foreground text-background">5:00 PM ET</Badge>
        </div>

        <div className="bg-background p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Every other Sunday at 5:00 PM ET
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl leading-tight">{topic}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Bring one active bid, one stuck decision, or one operating-system gap. This is where the
            consulting side of Contractor Circle becomes usable inside the business.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild={!!liveCallUrl} disabled={!liveCallUrl} size="sm">
              {liveCallUrl ? (
                <a href={liveCallUrl} target="_blank" rel="noopener noreferrer">
                  Join Zoom <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <span>Zoom link pending</span>
              )}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to calendar
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/portal/replays">
                <PlayCircle className="mr-2 h-4 w-4" />
                Past calls
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Link
        to="/portal/replays"
        className="group bg-background p-5 transition-colors hover:bg-secondary"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Latest replay
          </p>
          <PlayCircle className="h-5 w-5 shrink-0 text-amber" />
        </div>
        <h2 className="mt-3 font-display text-2xl leading-tight">
          {latest?.title ?? "Replay library"}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {latest?.description ??
            "Recorded calls preserve the strategy, bid review, and operating-system decisions for later review."}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {latest?.duration_minutes ? `${latest.duration_minutes} min` : "Replay"}
          </Badge>
          {latest?.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>
      </Link>

      <a
        href={communityUrl ?? "https://discord.com/app"}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-background p-5 transition-colors hover:bg-secondary"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Community
          </p>
          <Users className="h-5 w-5 shrink-0 text-amber" />
        </div>
        <h2 className="mt-3 font-display text-2xl leading-tight">Discord is the daily room</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Questions, peer review, context, and quick contractor conversation stay where members
          already gather.
        </p>
        <div className="mt-5 inline-flex items-center text-sm font-medium">
          Open Discord
          <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </a>
    </section>
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
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
