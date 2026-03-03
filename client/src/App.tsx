import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";

import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/employees" component={Employees}/>
      <Route path="/attendance" component={Attendance}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle}>
          <div className="flex h-screen w-full bg-slate-50">
            <AppSidebar />
            <Router />
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
