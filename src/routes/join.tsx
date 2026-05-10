import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarketingHeader } from "@/components/marketing-shell";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { StripeEmbeddedCheckout } from "@/components/stripe-embedded-checkout";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Circle — ALP Contractor Circle" },
      { name: "description", content: "Membership to the ALP Contractor Circle. $497/month, cancel anytime." },
      { property: "og:title", content: "Join the ALP Contractor Circle" },
    ],
  }),
  component: JoinPage,
});

const INCLUDED = [
  "Weekly live operating calls with Marshall",
  "Full replay archive — searchable, tagged",
  "Working template library",
  "ConstructLine beta access",
  "Private member directory + Discord",
];

function JoinPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [returnUrl, setReturnUrl] = useState("");

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`);
  }, []);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  const canStart = ready && (user?.email || /\S+@\S+\.\S+/.test(email));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <MarketingHeader />

      <main className="container-prose py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Order summary */}
          <aside className="lg:col-span-2">
            <p className="font-mono text-xs uppercase tracking-wider text-amber">Membership</p>
            <h1 className="font-display text-4xl mt-3 leading-tight">Contractor Circle</h1>
            <p className="mt-3 text-muted-foreground text-sm">Monthly · cancel anytime</p>

            <div className="mt-8 border-t border-hairline pt-6 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="font-display text-3xl tabular-nums">$497.00</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>Then $497.00 / month</span>
              <span>USD</span>
            </div>

            <ul className="mt-10 space-y-3">
              {INCLUDED.map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-amber mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-xs text-muted-foreground leading-relaxed">
              First-call money back, no questions. By continuing you agree to be billed monthly until you cancel from your account page.
            </p>
          </aside>

          {/* Checkout */}
          <section className="lg:col-span-3 border border-hairline bg-elevated p-6 sm:p-10">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !canStart ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl">Your details</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user
                      ? "Confirm your email and we'll start checkout."
                      : "Already a member? "}
                    {!user && (
                      <Link to="/login" className="text-amber underline-offset-4 hover:underline">
                        Sign in
                      </Link>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={!!user?.email}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!/\S+@\S+\.\S+/.test(email)}
                  onClick={() => setReady(true)}
                >
                  Continue to payment
                </Button>
              </div>
            ) : (
              <StripeEmbeddedCheckout
                priceId="circle_monthly"
                customerEmail={user?.email ?? email}
                userId={user?.id}
                returnUrl={returnUrl}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
