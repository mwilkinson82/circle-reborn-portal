import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALP Contractor Circle — The room serious contractors build in" },
      { name: "description", content: "Live calls, templates, and operating tools from Marshall Wilkinson and the ALP team. Built for GCs scaling from $5M to $50M." },
      { property: "og:title", content: "ALP Contractor Circle" },
      { property: "og:description", content: "The operating room for serious contractors." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container-prose flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Hammer className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-tight">ALP<span className="text-amber">.</span></span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild><Link to="/signup">Join the Circle</Link></Button>
        </nav>
      </header>

      <main className="container-prose py-20 sm:py-32">
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
              <Link to="/signup">Join the Circle <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/login">Member sign in</Link>
            </Button>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-32 grid md:grid-cols-3 gap-px bg-hairline border border-hairline"
        >
          {[
            { k: "01", t: "Live working calls", d: "Marshall walks live bids, contracts, and operating decisions every week. You bring real work; the room sharpens it." },
            { k: "02", t: "Templates that ship", d: "SOVs, MSAs, scope sheets, scripts. Versioned and downloaded — built on real projects, not theory." },
            { k: "03", t: "ConstructLine tools", d: "Scheduler, takeoff, and cost library tuned for residential and light commercial. Members get the working beta." },
          ].map((f) => (
            <div key={f.k} className="bg-background p-8">
              <p className="font-mono text-xs text-amber">{f.k}</p>
              <h3 className="font-display text-xl mt-4">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </motion.section>
      </main>

      <footer className="border-t border-hairline mt-20">
        <div className="container-prose py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Altitude Logic Pressure</p>
          <p className="font-mono uppercase tracking-wider">Built for the field.</p>
        </div>
      </footer>
    </div>
  );
}
