import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(false);

  const onDiscord = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin + "/portal",
        scopes: "identify email",
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <Link to="/" className="font-display text-2xl tracking-tight">
            ALP<span className="text-amber">.</span>
          </Link>
          <h1 className="font-display text-3xl mt-8">Connect your Discord</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already connected?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        <Button className="w-full" onClick={onDiscord} disabled={loading}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {loading ? "Opening Discord…" : "Continue with Discord"}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Your portal access unlocks after Discord returns an email that matches a paid or comped
          Circle membership.
        </p>

        <Button asChild variant="ghost" className="w-full">
          <Link to="/join">Join the Circle</Link>
        </Button>
      </div>
    </div>
  );
}
