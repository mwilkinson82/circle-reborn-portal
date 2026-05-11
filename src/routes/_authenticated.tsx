import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PortalSidebar } from "@/components/portal-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { getMyMembershipAccess } from "@/lib/membership.functions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatMembershipPlan, titleCase } from "@/lib/membership-plan";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumb = pathname.replace(/^\/portal\/?/, "") || "Dashboard";
  const title = crumb.charAt(0).toUpperCase() + crumb.slice(1).replace(/-/g, " ");
  const { user, loading, signOut } = useAuth();
  const checkAccess = useServerFn(getMyMembershipAccess);

  const access = useQuery({
    queryKey: ["membership-access", user?.id],
    queryFn: () => checkAccess(),
    enabled: !!user && !loading,
    retry: 1,
    staleTime: 15_000,
  });

  const onSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (loading || access.isLoading || access.isFetching) {
    return <MembershipChecking />;
  }

  if (access.isError) {
    return (
      <MembershipBlocked
        title="Membership check failed"
        body="Your Discord session is connected, but the membership check did not complete. Try again before entering the portal."
        email={user?.email ?? null}
        status={null}
        onRetry={() => access.refetch()}
        onSignOut={onSignOut}
      />
    );
  }

  if (!access.data?.hasAccess) {
    return (
      <MembershipBlocked
        title="Membership required"
        body="Discord confirmed your identity, but this email is not attached to an active paid or comped Contractor Circle record."
        email={access.data?.email ?? user?.email ?? null}
        status={access.data?.member?.status ?? "incomplete"}
        plan={access.data?.member?.plan ?? null}
        onRetry={() => access.refetch()}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-hairline px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{title}</span>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function MembershipChecking() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md border border-hairline bg-elevated p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Checking membership</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Discord is connected. We are matching this login against the paid and comped Circle roster
          before opening the portal.
        </p>
      </div>
    </div>
  );
}

function MembershipBlocked({
  title,
  body,
  email,
  status,
  plan,
  onRetry,
  onSignOut,
}: {
  title: string;
  body: string;
  email: string | null;
  status: string | null;
  plan?: string | null;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-xl border border-hairline bg-elevated p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>

        <dl className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
          <div className="bg-background p-4">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Discord email
            </dt>
            <dd className="mt-1 truncate text-sm font-medium">{email ?? "Not returned"}</dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Member status
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {status ? titleCase(status.replace(/_/g, " ")) : "Not found"}
              {plan ? ` · ${formatMembershipPlan(plan)}` : ""}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Check again
          </Button>
          <Button asChild variant="outline">
            <Link to="/join">
              <CreditCard className="mr-2 h-4 w-4" />
              Join the Circle
            </Link>
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
