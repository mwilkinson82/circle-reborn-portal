import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALP Contractor Circle — The room serious contractors build in" },
      { name: "description", content: "Weekly live calls with Marshall Wilkinson, a working library of templates, and operating tools built on $2.5B of executed work. For GCs scaling from $5M to $50M." },
      { property: "og:title", content: "ALP Contractor Circle" },
      { property: "og:description", content: "The operating room for serious contractors." },
    ],
  }),
  component: LandingPage,
});

const VALUE = [
  { k: "01", t: "Live working calls", d: "Marshall walks live bids, contracts, and operating decisions every week. You bring real work; the room sharpens it." },
  { k: "02", t: "Templates that ship", d: "SOVs, MSAs, scope sheets, scripts. Versioned and downloaded — built on real projects, not theory." },
  { k: "03", t: "ConstructLine tools", d: "Scheduler, takeoff, and cost library tuned for residential and light commercial. Members get the working beta." },
];

const TESTIMONIALS = [
  { q: "Three calls in and we restructured how we bid. Closed two jobs we would have walked from.", a: "Cole D.", r: "GC, $9M revenue, Texas" },
  { q: "The templates alone paid for the year. We stopped writing scopes from scratch.", a: "Jenna R.", r: "PM, design-build, Colorado" },
  { q: "Marshall doesn't pull punches. The room calls out the things your team won't.", a: "Aaron M.", r: "Owner, $24M revenue, Pacific NW" },
];

const INCLUDED = [
  "Weekly live operating calls with Marshall",
  "Full replay archive — searchable, tagged",
  "Working template library (SOVs, MSAs, scopes, scripts)",
  "ConstructLine beta: scheduler, takeoff, cost library",
  "Private member directory + Discord room",
  "Quarterly intensives on bidding, hiring, and capital",
];

const FAQ = [
  { q: "Who is this for?", a: "GCs and design-build firms running between $5M and $50M in revenue who are tired of operating from gut and want a working system." },
  { q: "What's the time commitment?", a: "One live call per week (90 minutes). Replays if you can't make it. Templates are pull-as-you-need." },
  { q: "Can I cancel?", a: "Yes — month-to-month. Cancel from your account page anytime. We don't do retention calls." },
  { q: "Do I get the ConstructLine tools?", a: "Yes. Members get full beta access to the scheduler, takeoff, and cost library while we build them out." },
  { q: "Is there a refund?", a: "If your first call doesn't justify the month, email us and we'll refund it. One time, no fine print." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      {/* HERO */}
      <section className="container-prose py-20 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Contractor Circle · Members only
          </span>
          <h1 className="font-display text-5xl sm:text-7xl mt-6 leading-[1.05]">
            The room <span className="text-amber italic">serious</span><br />
            contractors build in.
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Weekly live calls with Marshall Wilkinson. A working library of templates, scripts, and operating systems pulled straight from $2.5B in built work. No fluff, no funnels — a private room for GCs scaling from $5M to $50M.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/join">Join the Circle <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/login">Member sign in</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Cancel anytime · First-call money back
          </p>
        </motion.div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="border-y border-hairline bg-secondary/40">
        <div className="container-prose py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "$2.5B", l: "Built work behind it" },
            { n: "400+", l: "Members in the room" },
            { n: "180+", l: "Calls in the archive" },
            { n: "60+", l: "Working templates" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl tabular-nums">{s.n}</p>
              <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE */}
      <section className="container-prose py-24">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">What's in the room</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-4">Operating, not coaching.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We don't sell mindset. The Circle is a working room — calls, files, and tools that move real numbers on real jobs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-hairline border border-hairline">
          {VALUE.map((f) => (
            <div key={f.k} className="bg-background p-8">
              <p className="font-mono text-xs text-amber">{f.k}</p>
              <h3 className="font-display text-xl mt-4">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-hairline bg-secondary/40">
        <div className="container-prose py-24">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs uppercase tracking-wider text-amber">From the room</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-4">Members talk straight.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <figure key={t.a} className="bg-background border border-hairline p-8">
                <Quote className="h-5 w-5 text-amber" />
                <blockquote className="mt-4 text-base leading-relaxed">{t.q}</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-hairline">
                  <p className="font-medium">{t.a}</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">{t.r}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container-prose py-24 scroll-mt-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-4">One price. Everything in.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No tiers, no upsells. Membership is monthly — cancel from your account page anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 border border-hairline bg-elevated p-10">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Circle membership</p>
            <p className="mt-6 font-display text-6xl tabular-nums">
              $497<span className="text-2xl text-muted-foreground font-sans">/mo</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Billed monthly · USD</p>
            <Button asChild size="lg" className="w-full mt-8">
              <Link to="/join">Join the Circle <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground text-center">First-call money back, no questions.</p>
          </div>
          <div className="md:col-span-3 border border-hairline p-10">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">Included</p>
            <ul className="space-y-4">
              {INCLUDED.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-amber mt-1 shrink-0" />
                  <span className="text-sm">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-hairline">
        <div className="container-prose py-24 grid md:grid-cols-3 gap-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-amber">FAQ</p>
            <h2 className="font-display text-4xl mt-4">Common questions.</h2>
          </div>
          <div className="md:col-span-2 divide-y divide-hairline border-y border-hairline">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-display text-lg">{f.q}</span>
                  <span className="font-mono text-amber group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-hairline bg-foreground text-background">
        <div className="container-prose py-24 text-center">
          <h2 className="font-display text-4xl sm:text-6xl max-w-3xl mx-auto leading-tight">
            Stop operating from gut.<br />
            <span className="italic text-amber">Start running plays.</span>
          </h2>
          <div className="mt-10 flex justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/join">Join the Circle <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
