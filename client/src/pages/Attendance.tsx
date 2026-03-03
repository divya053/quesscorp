import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import { createAttendanceSchema, type InsertAttendance } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, CalendarDays, Filter, Plus } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Attendance() {
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: attendance, isLoading } = useAttendance(filterDate);
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const markAttendance = useMarkAttendance();
  const { toast } = useToast();

  const form = useForm<InsertAttendance>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      employeeId: undefined,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: "Present",
    },
  });

  const onSubmit = (data: InsertAttendance) => {
    markAttendance.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset({
          employeeId: undefined,
          date: format(new Date(), 'yyyy-MM-dd'),
          status: "Present",
        });
        toast({ title: "Success", description: "Attendance marked successfully" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-2 mr-4" />
          <h1 className="text-2xl font-bold font-display tracking-tight">Attendance Logs</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <CalendarCheck className="mr-2 h-4 w-4" /> Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Mark Employee Attendance</DialogTitle>
              <DialogDescription>
                Record presence or absence for a specific date.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeesLoading ? (
                            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                          ) : (
                            employees?.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id.toString()}>
                                {emp.fullName} ({emp.employeeId})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={markAttendance.isPending}>
                    {markAttendance.isPending ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 bg-background p-2 rounded-xl border shadow-sm">
            <Filter className="h-5 w-5 text-muted-foreground ml-2" />
            <Input 
              type="date"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-[160px]"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilterDate("")}
                className="text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : attendance && attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-600">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.employee?.employeeId}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {record.employee?.fullName}
                    </TableCell>
                    <TableCell>
                      {record.employee?.department}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.status === "Present" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarDays className="h-12 w-12 mb-3 opacity-20" />
                      <p>No attendance records found for {filterDate ? 'this date' : 'all time'}.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
