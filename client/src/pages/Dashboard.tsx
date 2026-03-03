import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useEmployees } from "@/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useDashboardSummary();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
      <header className="flex h-16 items-center border-b bg-background px-6 shadow-sm z-10 sticky top-0">
        <SidebarTrigger className="-ml-2 mr-4" />
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Dashboard Overview</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">Welcome back</h2>
          <p className="text-3xl font-display font-bold text-foreground">Here is your team's status today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Employees Card */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Total Employees
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-4xl font-bold font-display text-foreground">
                  {summary?.totalEmployees || 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Present Today Card */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-emerald-50/50 to-white">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <UserCheck className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Present Today
              </CardTitle>
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-4xl font-bold font-display text-emerald-700">
                  {summary?.presentToday || 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Absent Today Card */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-rose-50/50 to-white">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <UserX className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Absent Today
              </CardTitle>
              <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-4xl font-bold font-display text-rose-700">
                  {summary?.absentToday || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers Section */}
        <div className="mt-10">
          <h3 className="text-xl font-display font-semibold mb-4 text-foreground">Top Attenders</h3>
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y">
              {employeesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : employees && employees.length > 0 ? (
                employees
                  .sort((a, b) => (b.totalPresent || 0) - (a.totalPresent || 0))
                  .slice(0, 5)
                  .map((emp) => (
                  <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground">{emp.department} • {emp.employeeId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{emp.totalPresent || 0}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Days Present</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No employee data available yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
