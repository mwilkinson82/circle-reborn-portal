import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Hammer,
  Landmark,
  PlayCircle,
  Ruler,
  Send,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getDashboard } from "@/lib/dashboard.functions";
import {
  getBootcampCenter,
  submitBootcampQuestion,
  type BootcampQuestion,
  type BootcampSession,
} from "@/lib/bootcamp.functions";
import { AOS_APP_URL } from "@/lib/aos-link";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AosMark } from "@/components/aos-mark";
import { toast } from "sonner";

const BIWEEKLY_CALL_INTERVAL_MS = 14 * 86400000;
const LIVE_CALL_DURATION_MS = 90 * 60 * 1000;

const LIVE_CALL_EXCEPTIONS: Record<string, { movedTo: Date; note: string }> = {
  "2026-05-10": {
    movedTo: new Date(Date.UTC(2026, 4, 9, 21, 0, 0)),
    note: "Moved for Mother's Day weekend.",
  },
};

const aosHomeBaseTool = {
  to: "/portal/alp-os",
  icon: ClipboardList,
  image: "/aos-logo.png",
  label: "AOS",
  eyebrow: "Home base",
  value: "Build the company",
  hint: "Where pressure becomes structure",
};

const fieldSupportTools = [
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

const ownerCommandTools = [
  "Owner Dependency",
  "Capacity Map",
  "System Gap Finder",
  "Cash Control Snapshot",
  "Contract Risk Scan",
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
  const fetchBootcamp = useServerFn(getBootcampCenter);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: !!user && !loading,
    retry: 1,
  });
  const bootcamp = useQuery({
    queryKey: ["bootcamp-center", user?.id],
    queryFn: () => fetchBootcamp(),
    enabled: !!user && !loading,
    retry: 1,
  });

  if (loading || isLoading || !data) return <DashboardSkeleton />;

  const { profile, replays, featuredTemplates, announcements, liveCallTopic, liveCallCalendarUrl } =
    data;
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
        ? `Contractor Circle group session.\n\nTopic:\n${liveCallTopic}\n\nJoin link:\n${liveCallUrl}`
        : `Contractor Circle group session.\n\nTopic:\n${liveCallTopic}\n\nJoin details are posted in the portal before the session.`,
      start: nextCallDate,
      location: liveCallUrl ?? "Contractor Circle portal",
    });

  return (
    <div className="mx-auto max-w-[82rem] space-y-8 px-5 py-5 sm:px-6 sm:py-7 2xl:max-w-[88rem]">
      <CircleHomeHero firstName={firstName} />

      <OperatingPriorities
        nextCallDate={nextCallDate}
        calendarUrl={calendarUrl}
        liveCallUrl={liveCallUrl}
        topic={liveCallTopic}
        latest={latest}
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <OwnerCommandToolsPanel />
        <BootcampQuestionPanel data={bootcamp.data ?? null} isLoading={bootcamp.isLoading} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Support tools"
          title="Use field tools when the work calls for them"
          body="Use the portal to get ready. Use AOS to run the company. ConstructLine, Basis, Baseline, and the pricing libraries stay secondary for pursuits, estimates, schedules, and cost questions."
        />
        <div className="surface-tool-row grid gap-3 rounded-xl p-3 lg:grid-cols-[minmax(16rem,0.82fr)_minmax(0,2fr)]">
          <WorkLaneCard {...aosHomeBaseTool} isHomeBase />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {fieldSupportTools.map((tool) => (
              <WorkLaneCard key={tool.to} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ResourceLibraryPanel featuredTemplates={featuredTemplates} />
        <div className="space-y-5">
          <IntensiveCard />
          <AnnouncementsPanel announcements={announcements} />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-amber">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function OwnerCommandToolsPanel() {
  return (
    <Card className="surface-operating overflow-hidden p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="bg-background p-5 sm:p-6">
          <p className="eyebrow text-amber">Owner Command Tools</p>
          <h2 className="mt-2 font-display text-3xl leading-tight">
            Diagnose the constraint before you bring it to the room.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Thin-sliced owner tools for owner dependency, capacity, systems, cash, contracts, and
            decisions. Use the output to pull assets, prepare one issue, and carry the next move
            into AOS.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {ownerCommandTools.map((tool) => (
              <Badge key={tool} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between bg-background p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
            <Landmark className="h-6 w-6" />
          </div>
          <Button asChild className="mt-6 w-full justify-between">
            <Link to="/portal/command-tools">
              Open Command Tools <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BootcampQuestionPanel({
  data,
  isLoading,
}: {
  data: { nextSession: BootcampSession | null; questions: BootcampQuestion[] } | null;
  isLoading: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const queryClient = useQueryClient();
  const saveQuestion = useServerFn(submitBootcampQuestion);
  const mutation = useMutation({
    mutationFn: () =>
      saveQuestion({
        data: {
          sessionId: data?.nextSession?.id ?? null,
          question,
          context,
        },
      }),
    onSuccess: () => {
      setQuestion("");
      setContext("");
      queryClient.invalidateQueries({ queryKey: ["bootcamp-center"] });
      toast.success("Bootcamp question submitted for review.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Question could not be submitted.");
    },
  });
  const latestQuestion = data?.questions?.[0];

  return (
    <Card className="surface-library p-5">
      <p className="eyebrow text-amber">Monthly bootcamp</p>
      <h2 className="mt-2 font-display text-2xl leading-tight">Submit a bootcamp question</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Bootcamp questions are reviewed by Marshall. If accepted, you will receive a confirmation
        when the email workflow is connected.
      </p>
      <div className="mt-4 border border-hairline bg-background p-3">
        <p className="text-xs text-muted-foreground">Next bootcamp</p>
        <p className="mt-1 text-sm font-medium">
          {isLoading
            ? "Loading..."
            : data?.nextSession
              ? `${data.nextSession.title} · ${format(new Date(data.nextSession.session_date), "MMM d")}`
              : "Date being set"}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What would you like Marshall to consider for the bootcamp?"
          className="min-h-24"
        />
        <Textarea
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Optional context: company size, situation, what you have tried."
          className="min-h-20"
        />
        <Button
          className="w-full justify-between"
          disabled={question.trim().length < 8 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Submitting..." : "Submit for review"}
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {latestQuestion ? (
        <div className="mt-4 border-t border-hairline pt-4">
          <p className="text-xs text-muted-foreground">Latest submission</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="line-clamp-2 text-sm">{latestQuestion.question}</p>
            <Badge variant={latestQuestion.status === "accepted" ? "default" : "outline"}>
              {latestQuestion.status}
            </Badge>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function IntensiveCard() {
  return (
    <Card className="surface-command command-panel p-5">
      <p className="eyebrow text-amber">Work With Marshall</p>
      <h2 className="mt-2 font-display text-2xl leading-tight text-background">
        When the group room is not enough.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-background/64">
        Six-Week Contractor Intensive. $5,000 upfront. Six private sessions with Marshall.
      </p>
      <Button asChild variant="secondary" className="mt-5 w-full justify-between">
        <Link to="/portal/intensive">
          Request Intensive <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}

function CircleHomeHero({ firstName }: { firstName: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative isolate grid overflow-hidden rounded-[1.35rem] border border-hairline bg-[linear-gradient(105deg,oklch(0.99_0.006_82)_0%,oklch(0.975_0.012_78)_48%,oklch(0.955_0.012_75)_100%)] px-0 py-5 shadow-[0_30px_90px_rgba(35,24,12,0.08)] lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center lg:gap-6 xl:grid-cols-[minmax(0,1fr)_29rem]"
    >
      <HeroSketchLayer />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_32%_22%,oklch(0.82_0.08_62/0.16),transparent_19rem),radial-gradient(circle_at_78%_52%,oklch(0.45_0.025_260/0.08),transparent_22rem),linear-gradient(90deg,transparent,oklch(0.98_0.006_82/0.65)_48%,transparent)]"
      />

      <div className="relative z-10 max-w-3xl px-5 py-8 sm:px-7 sm:py-10 lg:py-12">
        <GreetingLine firstName={firstName} />
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,5.3vw,4.55rem)] leading-[1.02]">
          Build the company <span className="text-amber">behind</span> the projects.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/68 sm:text-base">
          Contractor Circle gives you group guidance, peer pressure, and AOS to turn stuck decisions
          into structure. Bring one issue, make it specific, use the session to pressure-test the
          pattern, then carry the output into AOS.
        </p>
      </div>

      <div className="relative z-10 px-5 pb-3 sm:px-7 lg:px-0 lg:pb-0 lg:pr-6">
        <NextMoveCard />
      </div>
    </motion.section>
  );
}

function HeroSketchLayer() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-12 -left-10 -top-10 z-0 hidden w-[76%] overflow-hidden rounded-[3rem] opacity-80 sm:block lg:w-[68%]"
    >
      <img
        src="/contractor-circle-hero-sketch.jpg"
        alt=""
        className="h-full w-full object-cover object-left-top opacity-34 mix-blend-multiply grayscale-[18%] sepia-[10%]"
      />
      <div className="absolute inset-0 blueprint-fade opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,oklch(0.81_0.09_62/0.2),transparent_18rem),linear-gradient(90deg,oklch(0.985_0.006_82/0.6),oklch(0.985_0.006_82/0.38)_40%,oklch(0.985_0.006_82/0.92)_88%)]" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-r from-background/0 via-background/72 to-background" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background via-background/60 to-background/0" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/68 to-background/0" />
    </div>
  );
}

function GreetingLine({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState("Good to see you");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <p className="text-xs font-semibold text-amber">
      {greeting}, {firstName}.
    </p>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function NextMoveCard() {
  return (
    <Card className="surface-command command-panel min-h-60 p-6 shadow-[0_34px_100px_rgba(28,20,12,0.2)]">
      <div className="relative z-10 grid h-full gap-6 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center">
        <div>
          <p className="eyebrow text-amber">Your next move</p>
          <h2 className="mt-3 font-display text-3xl leading-tight">Open AOS</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-background/72">
            Contractor Circle brings the pressure. AOS turns it into structure.
          </p>
          <div className="mt-6 grid gap-2 sm:max-w-52">
            <Button
              asChild
              className="bg-amber text-white shadow-[0_16px_40px_rgba(210,122,38,0.24)] hover:bg-amber/90"
            >
              <a href={AOS_APP_URL} target="_blank" rel="noopener noreferrer">
                Open AOS <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/portal/call-prep">
                Bring one issue <ClipboardList className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <AosMark className="mx-auto w-40 sm:w-44" imageClassName="w-24 rounded-2xl sm:w-28" />
      </div>
    </Card>
  );
}

function OperatingPriorities({
  nextCallDate,
  calendarUrl,
  liveCallUrl,
  topic,
  latest,
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
}) {
  return (
    <section className="space-y-3">
      <p className="eyebrow text-amber">This Week's Operating Priorities</p>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.85fr)_minmax(14rem,0.85fr)_16rem]">
        <Card className="surface-operating overflow-hidden rounded-lg p-0 lg:col-span-2 xl:col-span-1">
          <div className="grid h-full min-h-52 grid-cols-[8rem_minmax(0,1fr)]">
            <div className="flex flex-col justify-between bg-amber-soft p-4">
              <p className="eyebrow text-amber">Next group session</p>
              <div>
                <p className="font-display text-5xl leading-none tabular-nums">
                  {format(nextCallDate, "d")}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {format(nextCallDate, "MMM")}
                </p>
              </div>
              <Badge className="w-fit whitespace-nowrap bg-foreground text-background">
                5:00 PM ET
              </Badge>
            </div>
            <div className="flex min-w-0 flex-col justify-between p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Group session
                </p>
                <h2 className="mt-2 line-clamp-2 font-display text-2xl leading-tight">{topic}</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Bring one prepared issue, bid pattern, or systems gap.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild={!!liveCallUrl} disabled={!liveCallUrl} size="sm">
                  {liveCallUrl ? (
                    <a href={liveCallUrl} target="_blank" rel="noopener noreferrer">
                      Join session <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <span>Zoom pending</span>
                  )}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Calendar
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Link
          to="/portal/call-prep"
          className="surface-operating group flex min-h-52 flex-col justify-between rounded-lg p-5 transition-all hover:-translate-y-1 hover:border-foreground/28"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="eyebrow text-muted-foreground">Session prep</p>
              <ClipboardList className="h-5 w-5 shrink-0 text-amber" />
            </div>
            <h2 className="mt-3 font-display text-2xl leading-tight">Bring One Issue</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Make one business problem specific before the next Contractor Circle session.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-sm font-medium">
            Prepare issue
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>

        <CompanyBuildPath />

        <Link
          to="/portal/replays"
          className="surface-library group flex min-h-52 flex-col justify-between rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/18"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="eyebrow text-muted-foreground">Latest judgment</p>
              <PlayCircle className="h-5 w-5 shrink-0 text-amber" />
            </div>
            <h2 className="mt-3 line-clamp-3 font-display text-xl leading-tight">
              {latest?.title ?? "Replay library"}
            </h2>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {latest?.description ??
                "Recorded calls preserve the strategy, bid review, and operating-system decisions for later review."}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">
              {latest?.duration_minutes ? `${latest.duration_minutes} min` : "Replay"}
            </Badge>
            <span className="ml-auto inline-flex items-center text-xs font-medium">
              Watch replay <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

const companyBuildPath = [
  { label: "Vision", status: "Start here", tone: "bg-amber" },
  { label: "People", status: "Build next", tone: "bg-muted-foreground/35" },
  { label: "Numbers", status: "Scorecard", tone: "bg-amber" },
  { label: "Issues", status: "Active room", tone: "bg-amber" },
  { label: "Process", status: "Template library", tone: "bg-muted-foreground/35" },
  { label: "Traction", status: "Group rhythm", tone: "bg-foreground/55" },
];

function CompanyBuildPath() {
  return (
    <Card className="surface-library system-map p-4">
      <p className="eyebrow text-amber">AOS build path</p>
      <div className="mt-5 space-y-3">
        {companyBuildPath.map((item, index) => (
          <div
            key={item.label}
            className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 text-xs"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-background font-mono text-[10px] text-amber">
              {index + 1}
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{item.label}</span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                {item.status}
                <span className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-between px-0">
        <a href={AOS_APP_URL} target="_blank" rel="noopener noreferrer">
          Open AOS <ArrowUpRight className="h-4 w-4" />
        </a>
      </Button>
    </Card>
  );
}

function WorkLaneCard({
  to,
  icon: Icon,
  image,
  label,
  eyebrow,
  value,
  hint,
  isHomeBase = false,
}: {
  to: string;
  icon: IconComponent;
  image?: string;
  label: string;
  eyebrow: string;
  value: string;
  hint: string;
  isHomeBase?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex min-h-44 flex-col justify-between rounded-lg p-5 transition-all ${
        isHomeBase
          ? "surface-command command-panel text-background hover:-translate-y-1"
          : "surface-library hover:-translate-y-0.5 hover:border-foreground/15"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`eyebrow ${isHomeBase ? "text-amber" : "text-muted-foreground"}`}>
            {eyebrow}
          </p>
          <h3 className="mt-3 font-display text-xl leading-tight">{label}</h3>
        </div>
        {image ? (
          <img src={image} alt="" className="h-7 w-7 shrink-0 rounded-md object-cover" />
        ) : (
          <Icon className="h-5 w-5 shrink-0 text-amber" />
        )}
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <p
          className={`text-xs leading-relaxed ${
            isHomeBase ? "text-background/62" : "text-muted-foreground"
          }`}
        >
          <span className={`font-medium ${isHomeBase ? "text-background" : "text-foreground"}`}>
            {value}
          </span>
          <span> / {isHomeBase ? "Where pressure becomes structure." : hint}</span>
        </p>
        <ArrowUpRight
          className={`h-4 w-4 shrink-0 transition-opacity group-hover:opacity-100 ${
            isHomeBase ? "text-amber opacity-100" : "text-muted-foreground opacity-0"
          }`}
        />
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
          title="Implementation assets for the next move"
          body="The most useful assets should feel close to the work: operating-system docs, SOPs, contracts, checklists, and scripts."
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
              className="surface-library asset-stack group grid gap-px overflow-hidden rounded-lg transition-all hover:-translate-y-0.5 hover:border-foreground/20 md:grid-cols-[12rem_minmax(0,1fr)_7rem]"
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
    <Card className="surface-library p-6">
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
