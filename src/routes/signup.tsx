import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
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
            {emailLoading ? "Sending link..." : "Email me a setup link"}
          </Button>
          {emailSent ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Open the link from this browser and the portal will match that email against the
              active Circle roster.
            </p>
          ) : null}
        </form>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Use the same email that was used at checkout or comped into the Circle. Password sign-in
          is the standard path into the portal.
        </p>

        <Button asChild variant="ghost" className="w-full">
          <Link to="/join">Join the Circle</Link>
        </Button>
      </div>
    </div>
  );
}
