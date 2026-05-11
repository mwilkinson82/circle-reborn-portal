import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-shell";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Welcome to the Circle — ALP" }],
  }),
  component: WelcomePage,
});

const NEXT = [
  {
    t: "Connect your Discord",
    d: "Use the Discord account tied to the email you checked out with so the portal can attach your Circle membership.",
  },
  {
    t: "Catch the next live call",
    d: "Call schedule and dial-in are pinned at the top of your dashboard.",
  },
  {
    t: "Pull a template",
    d: "Start with the SOV pack or the MSA library — both are in the templates room.",
  },
];

function WelcomePage() {
  const { session_id } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main className="container-prose py-24">
        {session_id ? (
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber">
              <Check className="h-4 w-4" /> You're in
            </span>
            <h1 className="font-display text-5xl sm:text-6xl mt-6 leading-[1.05]">
              Welcome to <span className="italic text-amber">the room</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Your payment is complete. A receipt is on its way to your inbox. Here's what to do
              next.
            </p>

            <ol className="mt-12 divide-y divide-hairline border-y border-hairline">
              {NEXT.map((n, i) => (
                <li key={n.t} className="py-6 flex gap-6">
                  <span className="font-mono text-sm text-amber tabular-nums">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl">{n.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{n.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/portal">
                  Open the portal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/login">Connect Discord</Link>
              </Button>
            </div>

            <p className="mt-10 text-xs font-mono text-muted-foreground">
              Order ref · {session_id.slice(0, 12)}…
            </p>
          </div>
        ) : (
          <div className="max-w-xl">
            <h1 className="font-display text-4xl">No checkout session found.</h1>
            <p className="mt-4 text-muted-foreground">
              If you completed payment but landed here, sign in and your membership will be active.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/join">Try again</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
