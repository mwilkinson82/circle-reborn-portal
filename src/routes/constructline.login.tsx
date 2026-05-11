import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-shell";

export const Route = createFileRoute("/constructline/login")({
  head: () => ({ meta: [{ title: "ConstructLine beta sign in — ALP" }] }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <main className="container-prose py-24 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Beta access</p>
        <h1 className="font-display text-4xl mt-4">Sign in to ConstructLine.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          ConstructLine uses your Circle membership for access. Sign in with the email tied to your
          paid or comped account.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/login">
              Member sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link to="/join">Join the Circle</Link>
          </Button>
        </div>
      </main>
      <MarketingFooter />
    </div>
  ),
});
