import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  department: varchar("department", { length: 100 }).notNull(),
});

export const attendances = mysqlTable("attendances", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // ISO date string YYYY-MM-DD
  status: varchar("status", { length: 10 }).notNull(), // 'Present' or 'Absent'
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendances).omit({ id: true });

// Custom validations
export const createEmployeeSchema = insertEmployeeSchema.extend({
  email: z.string().email("Invalid email format"),
  employeeId: z.string().min(1, "Employee ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  department: z.string().min(1, "Department is required"),
});

export const createAttendanceSchema = insertAttendanceSchema.extend({
  status: z.enum(["Present", "Absent"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  employeeId: z.coerce.number(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof createEmployeeSchema>;

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = z.infer<typeof createAttendanceSchema>;
