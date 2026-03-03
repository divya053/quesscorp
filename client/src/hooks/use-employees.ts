import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertEmployee } from "@shared/schema";
import { z } from "zod";

export type EmployeeListRes = z.infer<typeof api.employees.list.responses[200]>;

export function useEmployees() {
  return useQuery({
    queryKey: [api.employees.list.path],
    queryFn: async () => {
      const res = await fetch(api.employees.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch employees");
      return api.employees.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const res = await fetch(api.employees.create.path, {
        method: api.employees.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.employees.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create employee");
      }
      return api.employees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.employees.delete.path, { id });
      const res = await fetch(url, { 
        method: api.employees.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete employee");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}
