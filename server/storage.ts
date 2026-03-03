import { db } from "./db";
import {
  employees,
  attendances,
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Employee
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;

  // Attendance
  getAttendances(): Promise<Attendance[]>;
  getAttendancesByEmployee(employeeId: number): Promise<Attendance[]>;
  getAttendancesByDate(date: string): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
}

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(insertEmployee).$returningId();
    const [employee] = await db.select().from(employees).where(eq(employees.id, created.id));
    if (!employee) {
      throw new Error("Failed to load created employee");
    }
    return employee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getAttendances(): Promise<Attendance[]> {
    return await db.select().from(attendances);
  }

  async getAttendancesByEmployee(employeeId: number): Promise<Attendance[]> {
    return await db.select().from(attendances).where(eq(attendances.employeeId, employeeId));
  }

  async getAttendancesByDate(date: string): Promise<Attendance[]> {
    return await db.select().from(attendances).where(eq(attendances.date, date));
  }

  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    // Check if an attendance record already exists for this employee and date
    const [existing] = await db.select()
      .from(attendances)
      .where(
        and(
          eq(attendances.employeeId, insertAttendance.employeeId),
          eq(attendances.date, insertAttendance.date)
        )
      );

    if (existing) {
      // Update existing record
      await db.update(attendances)
        .set({ status: insertAttendance.status })
        .where(eq(attendances.id, existing.id));
      const [updated] = await db.select().from(attendances).where(eq(attendances.id, existing.id));
      if (!updated) {
        throw new Error("Failed to load updated attendance");
      }
      return updated;
    }

    // Insert new record
    const [created] = await db.insert(attendances).values(insertAttendance).$returningId();
    const [attendance] = await db.select().from(attendances).where(eq(attendances.id, created.id));
    if (!attendance) {
      throw new Error("Failed to load created attendance");
    }
    return attendance;
  }
}

export const storage = new DatabaseStorage();
