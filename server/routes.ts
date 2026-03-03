import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/employees
  app.get(api.employees.list.path, async (req, res) => {
    try {
      const allEmployees = await storage.getEmployees();
      const allAttendances = await storage.getAttendances();

      // Calculate total present for each employee
      const employeesWithStats = allEmployees.map(emp => {
        const presentCount = allAttendances.filter(
          att => att.employeeId === emp.id && att.status === 'Present'
        ).length;
        
        return {
          ...emp,
          totalPresent: presentCount
        };
      });

      res.json(employeesWithStats);
    } catch (err) {
      console.error("Error fetching employees:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/employees
  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = api.employees.create.input.parse(req.body);
      
      // Check for duplicate employee ID
      const existingId = await storage.getEmployeeByEmployeeId(input.employeeId);
      if (existingId) {
        return res.status(400).json({
          message: "Employee ID already exists",
          field: "employeeId"
        });
      }
      
      // Check for duplicate email
      const existingEmail = await storage.getEmployeeByEmail(input.email);
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
          field: "email"
        });
      }

      const employee = await storage.createEmployee(input);
      res.status(201).json(employee);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error creating employee:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/employees/:id
  app.delete(api.employees.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting employee:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/attendance
  app.get(api.attendance.list.path, async (req, res) => {
    try {
      let attendances = await storage.getAttendances();
      const allEmployees = await storage.getEmployees();
      const employeeMap = new Map(allEmployees.map(e => [e.id, e]));

      // Optional filtering
      const employeeIdParam = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      if (employeeIdParam && !isNaN(employeeIdParam)) {
        attendances = attendances.filter(a => a.employeeId === employeeIdParam);
      }
      
      if (req.query.date && typeof req.query.date === 'string') {
         attendances = attendances.filter(a => a.date === req.query.date);
      }

      // Enrich with employee data
      const enrichedAttendances = attendances.map(att => {
        const emp = employeeMap.get(att.employeeId);
        return {
          ...att,
          employee: emp ? {
            fullName: emp.fullName,
            employeeId: emp.employeeId,
            department: emp.department
          } : undefined
        };
      });

      res.json(enrichedAttendances);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/attendance
  app.post(api.attendance.mark.path, async (req, res) => {
    try {
      const input = api.attendance.mark.input.parse(req.body);
      
      // Verify employee exists
      const employee = await storage.getEmployee(input.employeeId);
      if (!employee) {
        return res.status(400).json({
          message: "Employee not found",
          field: "employeeId"
        });
      }

      const attendance = await storage.markAttendance(input);
      res.status(201).json(attendance);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error marking attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/dashboard/summary
  app.get(api.dashboard.summary.path, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const allEmployees = await storage.getEmployees();
      const totalEmployees = allEmployees.length;

      const todayAttendances = await storage.getAttendancesByDate(today);
      const presentToday = todayAttendances.filter(a => a.status === 'Present').length;
      const absentToday = todayAttendances.filter(a => a.status === 'Absent').length;
      
      res.json({
        totalEmployees,
        presentToday,
        absentToday
      });
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
