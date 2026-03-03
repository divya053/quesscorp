# HRMS Lite

## Project Overview
HRMS Lite is a web-based Human Resource Management System designed to allow administrators to manage employee records and track daily attendance. It focuses on delivering essential HR operations through a clean, stable, and functional interface.

Features include:
- **Dashboard:** A quick overview of total employees and daily attendance statistics.
- **Employee Management:** Add, view, and delete employee records (Employee ID, Name, Email, Department).
- **Attendance Management:** Mark attendance (Present/Absent) by date, and view records with simple filtering by date.

## Tech Stack Used
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter (for routing), React Query, Recharts.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL with Drizzle ORM.
- **Validation:** Zod for shared schema validation across frontend and backend.

## Steps to Run the Project Locally
1. Clone the repository to your local machine.
2. Ensure you have Node.js (v18 or newer) and MySQL running.
3. Install dependencies by running:
   ```bash
   npm install
   ```
4. Set up your environment variables by creating a `.env` file:
   ```env
   DATABASE_URL=mysql://username:password@localhost:3306/hrms_lite
   ```
5. Push the database schema:
   ```bash
   npm run db:push
   ```
6. Start the development server (which runs both the Express backend and Vite frontend):
   ```bash
   npm run dev
   ```
7. Open the application in your browser at `http://localhost:5000`.

## Assumptions or Limitations
- **Single Admin User:** The system assumes a single admin user and does not currently implement authentication or authorization.
- **Scope:** Advanced HR features such as payroll, leave management, and role-based access control are out of scope for this lightweight version.
- **Timezone:** Attendance dates are managed as simple string dates (`YYYY-MM-DD`) and do not account for complex timezone logic.
