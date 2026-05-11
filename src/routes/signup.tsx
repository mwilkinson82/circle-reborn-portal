import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — ALP Contractor Circle" },
      { name: "description", content: "Join the ALP Contractor Circle." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Enter the email tied to your Circle membership.");
      return;
    }

    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin + "/portal",
        shouldCreateUser: true,
      },
    });
    setEmailLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmailSent(true);
    toast.success("Check your email for a secure sign-in link.");
  };

  const onDiscord = async () => {
    setDiscordLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin + "/portal",
        scopes: "identify email",
      },
    });
    setDiscordLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <Link to="/" className="font-display text-2xl tracking-tight">
            ALP<span className="text-amber">.</span>
          </Link>
          <h1 className="font-display text-3xl mt-8">Create your member login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already connected?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-3" onSubmit={onEmail}>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Membership email
          </label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailSent(false);
            }}
            placeholder="you@company.com"
          />
          <Button className="w-full" type="submit" disabled={emailLoading}>
            <Mail className="mr-2 h-4 w-4" />
            {emailLoading ? "Sending link…" : "Email me a secure login link"}
          </Button>
          {emailSent ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Open the link from this browser and the portal will match that email against the
              active Circle roster.
            </p>
          ) : null}
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">Community sign-in</span>
          </div>
        </div>

        <Button className="w-full" variant="outline" onClick={onDiscord} disabled={discordLoading}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {discordLoading ? "Opening Discord…" : "Continue with Discord"}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Use the same email that was used at checkout. Discord remains the community layer after
          the member account is active.
        </p>

        <Button asChild variant="ghost" className="w-full">
          <Link to="/join">Join the Circle</Link>
        </Button>
      </div>
    </div>
  );
}
