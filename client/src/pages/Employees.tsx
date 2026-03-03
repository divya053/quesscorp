import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployees, useCreateEmployee, useDeleteEmployee } from "@/hooks/use-employees";
import { createEmployeeSchema, type InsertEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, Users } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      employeeId: "",
      fullName: "",
      email: "",
      department: "",
    },
  });

  const onSubmit = (data: InsertEmployee) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Success", description: "Employee added successfully" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this employee?")) {
      deleteEmployee.mutate(id, {
        onSuccess: () => toast({ title: "Success", description: "Employee removed" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const filteredEmployees = employees?.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-2 mr-4" />
          <h1 className="text-2xl font-bold font-display tracking-tight">Employees Directory</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details to create a new employee profile.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. EMP-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Engineering, HR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? "Adding..." : "Save Employee"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center space-x-2 bg-background p-2 rounded-xl border shadow-sm w-full max-w-md focus-within:ring-2 ring-primary/20 transition-all">
          <Search className="h-5 w-5 text-muted-foreground ml-2" />
          <Input 
            placeholder="Search by name, ID, or department..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-semibold w-[120px]">EMP ID</TableHead>
                <TableHead className="font-semibold">Employee Details</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold text-center w-[150px]">Total Present</TableHead>
                <TableHead className="text-right w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 mb-3 opacity-20" />
                      <p>No employees found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-600">{emp.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{emp.fullName}</span>
                        <span className="text-xs text-muted-foreground">{emp.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {emp.department}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg text-primary">
                      {emp.totalPresent || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(emp.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
