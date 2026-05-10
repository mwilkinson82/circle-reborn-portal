import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, FileText, PlayCircle, Pin, Hammer, Ruler, BookOpen } from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/portal/")({
  head: () => ({ meta: [{ title: "Dashboard — ALP Contractor Circle" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  if (isLoading || !data) return <DashboardSkeleton />;

  const { profile, member, replays, featuredTemplates, announcements } = data;
  const latest = replays[0];
  const memberSince = member?.joined_at ? new Date(member.joined_at) : null;
  const days = memberSince ? Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / 86400000)) : 0;

  return (
    <div className="container-prose py-10 space-y-12">
      {/* Welcome strip */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="font-display text-4xl sm:text-5xl mt-1">
              Welcome back, <span className="text-amber">{profile?.display_name?.split(" ")[0] ?? "Builder"}</span>.
            </h1>
            {profile?.headline && (
              <p className="mt-2 text-muted-foreground">{profile.headline}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link to="/portal/account">View profile</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline">
          <Stat label="Status" value={titleCase(member?.status ?? "trialing")} />
          <Stat label="Plan" value={member?.plan ?? "Circle"} />
          <Stat label="Days as member" value={String(days)} />
          <Stat label="Replays" value={String(replays.length) + "+"} />
        </div>
      </motion.section>

      {/* Continue + announcements */}
      <section className="grid lg:grid-cols-3 gap-6">
        {latest && (
          <Card className="lg:col-span-2 p-0 overflow-hidden border-hairline">
            <div className="aspect-[16/8] bg-gradient-to-br from-foreground via-foreground to-amber-soft relative">
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
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{latest.description}</p>
              <Button asChild>
                <Link to="/portal/replays">Watch <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6 border-hairline">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">From the Circle</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-5 divide-y divide-hairline">
            {announcements.map((a) => (
              <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2">
                  {a.pinned && <Pin className="h-3.5 w-3.5 text-amber mt-1 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{a.title}</p>
                    {a.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
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

      {/* Featured templates */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Featured templates</h2>
            <p className="text-sm text-muted-foreground mt-1">Pulled from the library — used on real bids.</p>
          </div>
          <Link to="/portal/templates" className="text-sm text-foreground underline underline-offset-4">All templates</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {featuredTemplates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="p-6 h-full border-hairline hover:border-foreground/30 transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">{t.category}</Badge>
                  {t.badge && <span className="text-[10px] uppercase tracking-wider text-amber">{t.badge}</span>}
                </div>
                <h3 className="font-display text-xl mt-4 leading-tight">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{t.description}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono uppercase">{t.file_type} {t.pages && `· ${t.pages}`}</span>
                  <FileText className="h-4 w-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl">Jump back in</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline">
          <QuickLink to="/portal/scheduler" icon={Calendar} label="Scheduler" hint="CPM + Gantt" />
          <QuickLink to="/portal/takeoff" icon={Ruler} label="Takeoffs" hint="AI-assisted" />
          <QuickLink to="/portal/cost-library" icon={BookOpen} label="Cost Library" hint="Regional unit costs" />
          <QuickLink to="/portal/replays" icon={Hammer} label="Replays" hint="Live call archive" />
        </div>
      </section>
    </div>
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

function QuickLink({ to, icon: Icon, label, hint }: { to: string; icon: typeof Calendar; label: string; hint: string }) {
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

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
