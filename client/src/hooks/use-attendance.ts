import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertAttendance } from "@shared/schema";
import { z } from "zod";

export type AttendanceListRes = z.infer<typeof api.attendance.list.responses[200]>;

export function useAttendance(date?: string) {
  return useQuery({
    queryKey: [api.attendance.list.path, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      
      const url = `${api.attendance.list.path}${params.size > 0 ? `?${params.toString()}` : ''}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const res = await fetch(api.attendance.mark.path, {
        method: api.attendance.mark.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.attendance.mark.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to mark attendance");
      }
      return api.attendance.mark.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}
