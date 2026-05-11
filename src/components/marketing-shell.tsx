import { Link } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-hairline">
      <div className="container-prose flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Hammer className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-tight">
            ALP<span className="text-amber">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            to="/"
            hash="pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/constructline"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ConstructLine
          </Link>
          <Link
            to="/estimating"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Free tools
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/join">Join the Circle</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline mt-32">
      <div className="container-prose py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <Hammer className="h-4 w-4" />
            </span>
            <span className="font-display text-xl">
              ALP<span className="text-amber">.</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            The operating room for serious contractors. Built by builders, for builders.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Circle
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" hash="pricing" className="hover:text-amber">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/join" className="hover:text-amber">
                Join
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-amber">
                Member sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Tools
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/constructline" className="hover:text-amber">
                ConstructLine
              </Link>
            </li>
            <li>
              <Link to="/estimating" className="hover:text-amber">
                Estimating checklist
              </Link>
            </li>
            <li>
              <Link to="/silos" className="hover:text-amber">
                Three silos guide
              </Link>
            </li>
            <li>
              <Link to="/q2" className="hover:text-amber">
                Q2 playbook
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Company
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Altitude Logic Pressure</li>
            <li>Marshall Wilkinson</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="container-prose py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Altitude Logic Pressure</p>
          <p className="font-mono uppercase tracking-wider">Built for the field.</p>
        </div>
      </div>
    </footer>
  );
}
