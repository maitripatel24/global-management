import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD ?? "Employee@123";

  const admin = await prisma.user.upsert({
    where: { email: "admin@office.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@office.com",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: Role.ADMIN,
    },
  });

  const employeeSeeds = [
    { name: "Asha Verma", email: "asha@office.com" },
    { name: "Rohit Singh", email: "rohit@office.com" },
    { name: "Priya Nair", email: "priya@office.com" },
  ];

  const employees = [];
  for (const e of employeeSeeds) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        name: e.name,
        email: e.email,
        passwordHash: await bcrypt.hash(employeePassword, 10),
        role: Role.EMPLOYEE,
      },
    });
    employees.push(user);
  }

  const existingTasks = await prisma.task.count();
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Prepare monthly sales report",
          description: "Compile the sales figures for last month and share as PDF.",
          priority: TaskPriority.HIGH,
          status: TaskStatus.IN_PROGRESS,
          assignedToId: employees[0].id,
          assignedById: admin.id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Update client contact sheet",
          description: "Add the new client details from last week's onboarding.",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.PENDING,
          assignedToId: employees[1].id,
          assignedById: admin.id,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Fix invoice numbering issue",
          description: "Invoices generated last week have duplicate numbers, please correct.",
          priority: TaskPriority.HIGH,
          status: TaskStatus.DONE,
          assignedToId: employees[2].id,
          assignedById: admin.id,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@office.com /", adminPassword);
  console.log("Employee login (all employees): <email> /", employeePassword);
  console.log("Employees:", employees.map((e) => e.email).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
