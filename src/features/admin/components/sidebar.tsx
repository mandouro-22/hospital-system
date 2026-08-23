"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  HandHelping,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Search,
  Stethoscope,
  UserRound,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as AppSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/features/auth/hooks/use-session";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { toast } from "sonner";

type NavChild = {
  title: string;
  url: string;
};

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: NavChild[];
};

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Doctors",
    url: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    title: "Receptionists",
    url: "/admin/receptionists",
    icon: HandHelping,
  },
  {
    title: "Patients",
    url: "/admin/patients",
    icon: HeartPulse,
  },
  {
    title: "Hospital Configuration",
    url: "/admin/departments",
    icon: Building2,
    children: [
      {
        title: "Departments",
        url: "/admin/departments",
      },
      {
        title: "Specialties",
        url: "/admin/specialties",
      },
    ],
  },
];

function isChildActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const logout = useLogout();

  const user = session?.user;

  const filteredNavigation = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return navigation;

    return navigation
      .map((item) => {
        const matches =
          item.title.toLowerCase().includes(query) ||
          isChildActive(pathname, item.url);
        const children = item.children?.filter(
          (child) =>
            child.title.toLowerCase().includes(query) ||
            isChildActive(pathname, child.url),
        );
        return { ...item, matches, children };
      })
      .filter((item) => item.matches || item.children?.length);
  }, [search, pathname]);

  const isActive = (item: NavItem) => isChildActive(pathname, item.url);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        router.push("/sign-in");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <AppSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
            H
          </div>
          <span className="truncate font-semibold">Hospital System</span>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="pl-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Routes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const active = isActive(item);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.children?.length ? (
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const childActive = isChildActive(
                            pathname,
                            child.url,
                          );
                          return (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={childActive}
                              >
                                <Link href={child.url}>{child.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
              {!filteredNavigation.length ? (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No results found
                </li>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md p-2 text-start transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring outline-hidden"
            >
              <Avatar size="default" className="shrink-0">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user?.name ?? "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.role ?? "Guest"}
                </p>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {user?.name ?? "User"}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={logout.isPending}
              onClick={handleLogout}
            >
              <LogOut />
              {logout.isPending ? "Signing out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </AppSidebar>
  );
}
