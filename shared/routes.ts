import { z } from 'zod';
import { createEmployeeSchema, createAttendanceSchema, employees, attendances } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const employeeWithAttendanceSchema = z.object({
  id: z.number(),
  employeeId: z.string(),
  fullName: z.string(),
  email: z.string(),
  department: z.string(),
  totalPresent: z.number().optional(),
});

export const attendanceWithEmployeeSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  date: z.string(),
  status: z.string(),
  employee: z.object({
    fullName: z.string(),
    employeeId: z.string(),
    department: z.string()
  }).optional()
});


export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: {
        200: z.array(employeeWithAttendanceSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees' as const,
      input: createEmployeeSchema,
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance' as const,
      input: z.object({
        employeeId: z.coerce.number().optional(),
        date: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(attendanceWithEmployeeSchema),
      },
    },
    mark: {
      method: 'POST' as const,
      path: '/api/attendance' as const,
      input: createAttendanceSchema,
      responses: {
        201: z.custom<typeof attendances.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  dashboard: {
    summary: {
      method: 'GET' as const,
      path: '/api/dashboard/summary' as const,
      responses: {
        200: z.object({
          totalEmployees: z.number(),
          presentToday: z.number(),
          absentToday: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
