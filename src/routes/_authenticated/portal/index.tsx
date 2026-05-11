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
    <div className="container-prose py-8 sm:py-10 space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
      >
        <div className="relative overflow-hidden border border-hairline bg-foreground text-background">
          <div className="absolute inset-y-0 right-0 hidden w-2/5 border-l border-background/10 bg-[linear-gradient(135deg,transparent_0_35%,rgba(255,255,255,0.08)_35%_36%,transparent_36%_100%)] bg-[length:34px_34px] lg:block" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-background/60">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
                  Welcome back,{" "}
                  <span className="text-amber">
                    {profile?.display_name?.split(" ")[0] ?? "Builder"}
                  </span>
                  .
                </h1>
              </div>
              <Button asChild variant="secondary" className="bg-background text-foreground">
                <Link to="/portal/account">View profile</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {commandCenterTools.map((tool) => (
                <CommandCenterCard key={tool.to} {...tool} />
              ))}
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
        <LiveCallCard
          nextCallDate={nextCallDate}
          calendarUrl={calendarUrl}
          liveCallUrl={liveCallUrl}
        />

        <Card className="border-hairline p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">From the Circle</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-5 divide-y divide-hairline">
            {announcements.map((a: (typeof announcements)[number]) => (
              <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2">
                  {a.pinned && <Pin className="h-3.5 w-3.5 text-amber mt-1 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{a.title}</p>
                    {a.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
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
      </section>

      <section className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
        {operatingRhythm.map((item) => (
          <div key={item.label} className="bg-background p-5">
            <item.icon className="h-5 w-5 text-amber" />
            <h3 className="mt-5 font-display text-lg leading-tight">{item.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {latest && (
          <Card className="lg:col-span-2 p-0 overflow-hidden border-hairline">
            <div className="aspect-[16/8] bg-[radial-gradient(circle_at_80%_85%,rgba(212,119,44,0.35),transparent_32%),linear-gradient(135deg,#090a0d_0%,#15171c_52%,#d7c3a6_100%)] relative">
              <div className="absolute inset-0 flex items-end p-6">
                <div className="text-background">
                  <p className="text-xs uppercase tracking-wider opacity-70">Continue watching</p>
                  <h2 className="font-display text-2xl mt-1 max-w-md">{latest.title}</h2>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-background/90 text-foreground text-xs px-3 py-1">
                  <PlayCircle className="h-3 w-3" /> {latest.duration_minutes} min
                </span>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between gap-6">
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {latest.description}
              </p>
              <Button asChild>
                <Link to="/portal/replays">
                  Watch <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        )}

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
            Daily conversation, bid questions, and peer review stay in Discord while the portal
            houses the tools and member library.
          </p>
          <div className="mt-6 border border-hairline bg-secondary p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Best next post</p>
            <p className="mt-2 font-display text-lg leading-tight">
              Share one active estimate decision before it turns into a bid-day problem.
            </p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Featured templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pulled from the library — used on real bids.
            </p>
          </div>
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
        <h2 className="font-display text-2xl">Tool suite</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline">
          <QuickLink
            to="/portal/constructline"
            icon={Hammer}
            label="ConstructLine"
            hint="Open the live workspace"
          />
          <QuickLink to="/portal/takeoff" icon={Ruler} label="Basis" hint="Takeoffs" />
          <QuickLink to="/portal/scheduler" icon={Calendar} label="Baseline" hint="Scheduler" />
          <QuickLink
            to="/portal/cost-library"
            icon={BookOpen}
            label="Cost Library"
            hint="Regional unit costs"
          />
        </div>
      </section>
    </div>
  );
}

function CommandCenterCard({
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
      className="group border border-background/10 bg-background/[0.06] p-4 text-background transition-colors hover:bg-background/[0.12]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-background/50">
            {eyebrow}
          </p>
          <p className="mt-2 font-display text-xl leading-tight">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-amber" />
      </div>
      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-background/55">{hint}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-background/50 opacity-0 transition-opacity group-hover:opacity-100" />
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
                The portal should point members toward action: show up live, bring the real
                constraint, then turn the answer into a better bid or a cleaner operating system.
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

function QuickLink({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: typeof Calendar;
  label: string;
  hint: string;
}) {
  return (
    <Link to={to} className="bg-background p-6 hover:bg-secondary transition-colors group">
      <div className="flex items-start justify-between">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-amber transition-colors" />
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="font-display text-lg mt-6">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </Link>
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
