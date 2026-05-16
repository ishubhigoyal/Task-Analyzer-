import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@taskmanager.com" },
    update: {},
    create: {
      fullName: "Admin User",
      email: "admin@taskmanager.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Members
  const member1 = await prisma.user.upsert({
    where: { email: "member1@taskmanager.com" },
    update: {},
    create: {
      fullName: "John Member",
      email: "member1@taskmanager.com",
      passwordHash,
      role: "MEMBER",
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: "member2@taskmanager.com" },
    update: {},
    create: {
      fullName: "Jane Member",
      email: "member2@taskmanager.com",
      passwordHash,
      role: "MEMBER",
    },
  });

  // Project
  const project = await prisma.project.create({
    data: {
      name: "Q2 Marketing Blitz",
      description: "Ambitious project to scale our user base by 50% in Q2.",
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
          { userId: member2.id }
        ]
      },
      tasks: {
        create: [
          {
            title: "Draft Social Media Strategy",
            description: "Prepare a plan for Twitter, LinkedIn and Instagram.",
            status: "DONE",
            priority: "HIGH",
            createdBy: admin.id,
            assignedTo: member1.id,
            dueDate: new Date()
          },
          {
            title: "Redesign Landing Page",
            description: "New hero section and better CTA placement.",
            status: "IN_PROGRESS",
            priority: "URGENT",
            createdBy: admin.id,
            assignedTo: member2.id,
            dueDate: new Date(Date.now() + 86400000 * 2)
          },
          {
            title: "Fix Overdue Task Bug",
            description: "Ensure labels show even if negative time.",
            status: "TODO",
            priority: "MEDIUM",
            createdBy: admin.id,
            assignedTo: member1.id,
            dueDate: new Date(Date.now() - 86400000) // Yesterday
          }
        ]
      }
    }
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
