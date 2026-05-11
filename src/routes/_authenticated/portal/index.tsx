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
  MessageSquare,
  PlayCircle,
  Pin,
  Hammer,
  Ruler,
  BookOpen,
  Users,
  Video,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { formatMembershipPlan, titleCase } from "@/lib/membership-plan";

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
    to: "/portal/constructline",
    icon: Hammer,
    label: "ConstructLine Hub",
    eyebrow: "Workspace",
    value: "Open",
    hint: "Bid command center",
  },
  {
    to: "/portal/takeoff",
    icon: Ruler,
    label: "Basis",
    eyebrow: "Takeoff",
    value: "Quantify",
    hint: "Scopes, quantities, line items",
  },
  {
    to: "/portal/cost-library",
    icon: DollarSign,
    label: "Cost Library",
    eyebrow: "Pricing",
    value: "Price",
    hint: "Items, assemblies, unit costs",
  },
  {
    to: "/portal/scheduler",
    icon: Calendar,
    label: "Baseline",
    eyebrow: "Schedule",
    value: "Plan",
    hint: "Durations, sequence, milestones",
  },
];

const operatingRhythm = [
  {
    icon: ClipboardCheck,
    label: "Review the bid basis",
    detail: "Scope, inclusions, exclusions, and open decisions",
  },
  {
    icon: DollarSign,
    label: "Pressure-test cost",
    detail: "Labor, production, material, and coverage",
  },
  {
    icon: CheckCircle2,
    label: "Package the next move",
    detail: "Proposal, SOV, clarifications, and follow-up",
  },
];

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
    <div className="container-prose py-20 text-center space-y-4">
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

  const { profile, member, replays, featuredTemplates, announcements } = data;
  const latest = replays[0];
  const memberSince = member?.joined_at ? new Date(member.joined_at) : null;
  const days = memberSince
    ? Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / 86400000))
    : 0;
  const nextCallDate = getNextCallDate();
  const liveCallUrl = data.liveCallUrl;
  const calendarUrl = buildCalendarUrl({
    title: "Contractor Circle Live Call",
    details: liveCallUrl
      ? `Contractor Circle live call with Marshall.\n\nJoin link:\n${liveCallUrl}`
      : "Contractor Circle live call with Marshall. Join details are posted in the portal and Discord before the call.",
    start: nextCallDate,
    location: liveCallUrl ?? "Contractor Circle portal",
  });

  return (
    <div className="container-prose py-8 sm:py-10 space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]"
      >
        <div className="border border-hairline bg-foreground text-background">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="font-mono text-xs uppercase tracking-wider text-background/55">
              Contractor Circle
            </p>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                  Welcome back,{" "}
                  <span className="text-amber">
                    {profile?.display_name?.split(" ")[0] ?? "Builder"}
                  </span>
                  .
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/65">
                  Start with the live room, move into the tool suite, or pull a proven template from
                  the library.
                </p>
              </div>
              <Button asChild variant="secondary" className="bg-background text-foreground">
                <Link to="/portal/account">View profile</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-px border border-background/10 bg-background/10 md:grid-cols-3">
              <PrimaryPath
                to="/portal/constructline"
                icon={Hammer}
                eyebrow="Build"
                title="Open ConstructLine"
                body="Bid hub, takeoff, schedule, and pricing continuity."
              />
              <PrimaryPath
                to="/portal/replays"
                icon={PlayCircle}
                eyebrow="Study"
                title="Watch the latest call"
                body={latest?.title ?? "Replay library and bid-room sessions."}
              />
              <PrimaryPath
                to="/portal/templates"
                icon={FileText}
                eyebrow="Ship"
                title="Pull a template"
                body="Scopes, SOVs, scripts, finance, and operating tools."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-1">
          <Stat label="Status" value={titleCase(member?.status ?? "trialing")} />
          <Stat label="Plan" value={formatMembershipPlan(member?.plan)} />
          <Stat label="Days as member" value={String(days)} />
          <Stat label="Replays" value={String(replays.length) + "+"} />
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Today"
            title="Live room and current focus"
            body="One place for the next call, the next decision, and the next working session."
          />
          <LiveCallCard
            nextCallDate={nextCallDate}
            calendarUrl={calendarUrl}
            liveCallUrl={liveCallUrl}
          />
        </div>

        <AnnouncementsPanel announcements={announcements} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Tool suite"
          title="Choose the work lane"
          body="ConstructLine is the production workspace. The new portal keeps the member entry clean while we rebuild the tools behind it."
        />
        <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-4">
          {commandCenterTools.map((tool) => (
            <WorkLaneCard key={tool.to} {...tool} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {latest && <ReplayPanel latest={latest} className="lg:col-span-2" />}

        <CommunityPanel />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Member library"
            title="Pull from proven material"
            body="Templates and sessions stay close to the work instead of buried in a file dump."
          />
          <Link
            to="/portal/templates"
            className="text-sm text-foreground underline underline-offset-4"
          >
            All templates
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {featuredTemplates.map((t: (typeof featuredTemplates)[number], i: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="p-6 h-full border-hairline hover:border-foreground/30 transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {t.category}
                  </Badge>
                  {t.badge && (
                    <span className="text-[10px] uppercase tracking-wider text-amber">
                      {t.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl mt-4 leading-tight">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{t.description}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono uppercase">
                    {t.file_type} {t.pages && `· ${t.pages}`}
                  </span>
                  <FileText className="h-4 w-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Operating rhythm"
          title="Review, price, package"
          body="The portal now points every member back to the same contractor workflow."
        />
        <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
          {operatingRhythm.map((item) => (
            <div key={item.label} className="bg-background p-5">
              <item.icon className="h-5 w-5 text-amber" />
              <h3 className="mt-5 font-display text-lg leading-tight">{item.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
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

function PrimaryPath({
  to,
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  to: string;
  icon: typeof Hammer;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-44 flex-col justify-between bg-foreground p-5 text-background transition-colors hover:bg-background/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-wider text-background/50">{eyebrow}</p>
        <Icon className="h-5 w-5 text-amber" />
      </div>
      <div>
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-background/55">{body}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-background/50 opacity-0 transition-opacity group-hover:opacity-100" />
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
  icon: typeof Hammer;
  label: string;
  eyebrow: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-48 flex-col justify-between bg-background p-5 transition-colors hover:bg-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-amber" />
      </div>
      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-2xl mt-2 tabular-nums">{value}</p>
    </div>
  );
}

function LiveCallCard({
  nextCallDate,
  calendarUrl,
  liveCallUrl,
}: {
  nextCallDate: Date;
  calendarUrl: string;
  liveCallUrl: string | null;
}) {
  return (
    <Card className="overflow-hidden border-hairline p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="bg-foreground p-6 text-background">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">Next live room</p>
          <p className="mt-4 font-display text-5xl leading-none tabular-nums">
            {format(nextCallDate, "d")}
          </p>
          <p className="mt-2 text-sm text-background/65">{format(nextCallDate, "MMMM yyyy")}</p>
          <div className="mt-8 border border-background/10 p-4">
            <p className="text-xs uppercase tracking-wider text-background/50">Bring this</p>
            <p className="mt-2 text-sm leading-relaxed text-background/75">
              One active bid, one stuck decision, or one operating issue worth pressure-testing.
            </p>
          </div>
        </div>
        <div className="bg-background p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Live call</Badge>
                <Badge variant="secondary">5:00 PM ET</Badge>
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight">
                Contractor Circle Live Call
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Show up with one live bid, one stuck decision, or one operating issue. Leave with a
                cleaner next move.
              </p>
            </div>
            <Calendar className="h-5 w-5 text-amber" />
          </div>

          <div className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            <DashboardAction
              href={liveCallUrl ?? undefined}
              icon={Video}
              label={liveCallUrl ? "Join Zoom" : "Join details"}
              detail={liveCallUrl ? format(nextCallDate, "EEE, MMM d") : "Pinned before call"}
              external
              disabled={!liveCallUrl}
            />
            <DashboardAction
              href={calendarUrl}
              icon={CalendarPlus}
              label="Add to calendar"
              detail="Google Calendar"
              external
            />
            <DashboardAction
              to="/portal/replays"
              icon={PlayCircle}
              label="Past calls"
              detail="Replay library"
            />
          </div>

          <div className="mt-6 flex items-start gap-3 border border-hairline bg-secondary p-4">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Discord is still the daily conversation layer. The portal is the operating layer:
              calls, tools, templates, and ConstructLine work product.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DashboardAction({
  to,
  href,
  icon: Icon,
  label,
  detail,
  external,
  disabled,
}: {
  to?: string;
  href?: string;
  icon: typeof Calendar;
  label: string;
  detail: string;
  external?: boolean;
  disabled?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-5 w-5 text-amber" />
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-5 font-display text-lg leading-tight">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </>
  );

  const className = "group bg-background p-5 text-left transition-colors hover:bg-secondary";

  if (disabled) {
    return (
      <div className={`${className} cursor-not-allowed opacity-70 hover:bg-background`}>{body}</div>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
      >
        {body}
      </a>
    );
  }

  return (
    <Link to={to ?? "/portal"} className={className}>
      {body}
    </Link>
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
          <h2 className="mt-2 font-display text-xl">Updates</h2>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <ul className="mt-5 divide-y divide-hairline">
        {announcements.map((a) => (
          <li key={a.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2">
              {a.pinned && <Pin className="mt-1 h-3.5 w-3.5 shrink-0 text-amber" />}
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{a.title}</p>
                {a.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}
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

function ReplayPanel({
  latest,
  className,
}: {
  latest: {
    title: string;
    description: string | null;
    duration_minutes: number | null;
  };
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden border-hairline p-0 ${className ?? ""}`}>
      <div className="grid gap-px bg-hairline md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="bg-background p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">Latest replay</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight">{latest.title}</h2>
          {latest.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {latest.description}
            </p>
          )}
          <Button asChild className="mt-6">
            <Link to="/portal/replays">
              Open replays <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex min-h-56 flex-col justify-between bg-foreground p-6 text-background">
          <PlayCircle className="h-9 w-9 text-amber" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-background/50">
              Watch time
            </p>
            <p className="mt-2 font-display text-4xl tabular-nums">
              {latest.duration_minutes ?? 0}
              <span className="ml-1 text-base font-sans text-background/50">min</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CommunityPanel() {
  return (
    <Card className="border-hairline p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Community layer
          </p>
          <h2 className="mt-2 font-display text-xl">Discord stays live</h2>
        </div>
        <Users className="h-5 w-5 text-amber" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Daily questions and peer review stay in Discord. The portal holds the calls, templates,
        tools, and work product.
      </p>
      <div className="mt-6 border border-hairline bg-secondary p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Best next post</p>
        <p className="mt-2 font-display text-lg leading-tight">
          Share one active estimate decision before it turns into a bid-day problem.
        </p>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-prose py-10 space-y-8">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
