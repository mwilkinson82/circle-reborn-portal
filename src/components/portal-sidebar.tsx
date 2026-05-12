import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  PlayCircle,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Calendar,
  Ruler,
  BookOpen,
  UserCircle,
  Shield,
  LogOut,
  Landmark,
  MessageSquareHeart,
  Wrench,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

type NavItem = {
  title: string;
  url: string;
  icon: typeof Home;
};

const companyOs: NavItem[] = [
  { title: "Home", url: "/portal", icon: Home },
  { title: "AOS", url: "/portal/alp-os", icon: ClipboardCheck },
  { title: "Bring One Issue", url: "/portal/call-prep", icon: ClipboardList },
  { title: "Command Tools", url: "/portal/command-tools", icon: Landmark },
];

const guidance: NavItem[] = [
  { title: "Call Library", url: "/portal/replays", icon: PlayCircle },
  { title: "Templates", url: "/portal/templates", icon: FileText },
];

const tools: NavItem[] = [
  { title: "ConstructLine Hub", url: "/portal/constructline", icon: Wrench },
  { title: "Basis (Takeoffs)", url: "/portal/takeoff", icon: Ruler },
  { title: "Baseline (Scheduler)", url: "/portal/scheduler", icon: Calendar },
  { title: "Cost Library", url: "/portal/cost-library", icon: BookOpen },
  { title: "Trade Rate Library", url: "/portal/labor-library", icon: Users },
];

const account: NavItem[] = [
  { title: "Work With Marshall", url: "/portal/intensive", icon: MessageSquareHeart },
  { title: "Profile", url: "/portal/account", icon: UserCircle },
  { title: "Admin", url: "/portal/admin", icon: Shield },
];

export function PortalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();

  const isActive = (url: string) =>
    pathname === url || (url !== "/portal" && pathname.startsWith(url));

  const renderItems = (items: NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          isActive={isActive(item.url)}
          className="h-9 rounded-sm data-[active=true]:bg-foreground data-[active=true]:text-background"
        >
          <Link to={item.url} className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-foreground">
            <img
              src="/favicon-32x32.png"
              alt=""
              className="h-full w-full object-cover"
              aria-hidden="true"
            />
          </span>
          {!collapsed && (
            <span>
              <span className="block font-display text-lg leading-none tracking-tight">
                ALP<span className="text-amber">.</span>
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/55">
                Contractor Circle
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Company OS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(companyOs)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Guidance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(guidance)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5">
            Field Tools
            {!collapsed && <ExternalLink className="h-3 w-3 opacity-60" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(tools)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(account)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="truncate">{user?.email ?? "Sign out"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
