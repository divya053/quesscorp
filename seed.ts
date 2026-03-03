import { db } from "./server/db";
import { employees } from "./shared/schema";

async function main() {
  await db.insert(employees).values([
    { employeeId: 'EMP001', fullName: 'John Doe', email: 'john.doe@example.com', department: 'Engineering' },
    { employeeId: 'EMP002', fullName: 'Jane Smith', email: 'jane.smith@example.com', department: 'Marketing' },
    { employeeId: 'EMP003', fullName: 'Alice Johnson', email: 'alice.johnson@example.com', department: 'HR' }
  ]).onConflictDoNothing({ target: employees.email });
  console.log("Seeded database");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
