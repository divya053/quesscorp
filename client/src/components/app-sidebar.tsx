import { Users, CalendarCheck, LayoutDashboard, Command } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center gap-3">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Command className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-display font-semibold text-lg">HRMS Lite</span>
          <span className="truncate text-xs text-muted-foreground">Workspace</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 px-4">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className="font-medium h-10 transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
