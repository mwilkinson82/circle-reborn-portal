import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Calculator, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-shell";

export const Route = createFileRoute("/constructline")({
  head: () => ({
    meta: [
      { title: "ConstructLine — Operating tools for residential & light commercial GCs" },
      {
        name: "description",
        content:
          "Scheduler, takeoff, and cost library tuned for the way GCs actually work. In private beta with Circle members.",
      },
      { property: "og:title", content: "ConstructLine — by ALP" },
    ],
  }),
  component: ConstructLineLanding,
});

const TOOLS = [
  {
    i: Calendar,
    t: "Scheduler",
    d: "CPM under the hood, plain language on top. Drag a job, the dependent dates move. Reports that read like an owner update, not a Gantt dump.",
  },
  {
    i: Calculator,
    t: "Takeoff",
    d: "Mark up plans on screen, AI extracts the line items, answers go straight to your estimate template. No double entry.",
  },
  {
    i: Database,
    t: "Cost & Labor Library",
    d: "Your real numbers, versioned. Pull a unit price into a bid in two clicks. Update once, every active estimate sees it.",
  },
];

function ConstructLineLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <section className="container-prose py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            ConstructLine · Private beta
          </span>
          <h1 className="font-display text-5xl sm:text-7xl mt-6 leading-[1.05]">
            Operating tools
            <br />
            for the <span className="text-amber italic">field</span>.
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Scheduler, takeoff, and a real cost library — built for residential and light commercial
            GCs and tuned by the way actual jobs run, not how software vendors think they should.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/constructline/login">
                Beta sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/join">Join the Circle to access the beta</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-hairline bg-secondary/40">
        <div className="container-prose py-24 grid md:grid-cols-3 gap-px bg-hairline border border-hairline">
          {TOOLS.map((t) => (
            <div key={t.t} className="bg-background p-8">
              <t.i className="h-5 w-5 text-amber" />
              <h3 className="font-display text-xl mt-4">{t.t}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-prose py-24 text-center max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Access</p>
        <h2 className="font-display text-4xl sm:text-5xl mt-4">Beta is bundled with the Circle.</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Members get full access while we build it out. Feedback shapes what ships next.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/join">
            Join the Circle <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <MarketingFooter />
    </div>
  );
}
