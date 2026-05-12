import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, LockKeyhole, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/intensive")({
  head: () => ({ meta: [{ title: "Work With Marshall — Contractor Circle" }] }),
  component: IntensivePage,
});

const included = [
  "Six private sessions with Marshall over six weeks",
  "Business pressure-test and priority sequence",
  "A focused implementation plan for the next operating constraint",
  "Guidance on what belongs in AOS, templates, scorecards, SOPs, and issues",
];

const fitSignals = [
  "The group room is useful, but your business needs direct pressure.",
  "Owner dependency is high and the first priorities are unclear.",
  "You need help choosing what not to work on next.",
  "The business is growing faster than the current operating system can hold.",
];

function IntensivePage() {
  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <section className="surface-command command-panel overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="eyebrow text-amber">Work With Marshall</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              When the group room is not enough.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/70">
              Contractor Circle gives you the operating room. The Intensive gives you six private
              sessions to pressure-test the business, install the right priorities, and move faster
              with direct guidance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href="mailto:marshall@alpcoaching.com?subject=Six-Week%20Contractor%20Intensive%20Request">
                  Request Intensive <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/portal/command-tools">Run owner scorecard</Link>
              </Button>
            </div>
          </div>

          <Card className="border-background/12 bg-background/[0.05] p-5 text-background">
            <p className="eyebrow text-amber">Six-Week Contractor Intensive</p>
            <p className="mt-4 font-display text-4xl">$5,000</p>
            <p className="mt-1 text-sm text-background/62">upfront</p>
            <div className="mt-5 grid gap-3 text-sm text-background/70">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber" />
                Six weeks
              </p>
              <p className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-amber" />
                Six private sessions
              </p>
              <p className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-amber" />
                Limited and separate from Circle membership
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="surface-library p-6">
          <p className="eyebrow text-amber">What it is</p>
          <h2 className="mt-2 font-display text-3xl">Direct implementation pressure.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This is private consulting, not a replacement for Contractor Circle. It is for owners
            who need Marshall inside the business for a short, focused sprint around priorities,
            structure, decisions, and implementation.
          </p>
          <div className="mt-6 grid gap-3">
            {included.map((item) => (
              <div key={item} className="flex gap-3 border border-hairline bg-background p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="surface-operating p-6">
          <p className="eyebrow text-amber">Best fit</p>
          <h2 className="mt-2 font-display text-3xl">Apply when speed matters.</h2>
          <div className="mt-5 grid gap-3">
            {fitSignals.map((item) => (
              <p
                key={item}
                className="border-l-2 border-amber/50 pl-3 text-sm text-muted-foreground"
              >
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Contractor Circle remains a group membership. Private consulting is limited, controlled,
            and accepted separately.
          </p>
        </Card>
      </section>
    </div>
  );
}
