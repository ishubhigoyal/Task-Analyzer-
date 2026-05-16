import prisma from "./server/config/prisma";

async function checkDashboard() {
  const adminId = "869cf373-8567-49bf-af4e-a693bb3207f4";
  try {
    console.log("Projects:", await prisma.project.count({ where: { createdBy: adminId } }));
    console.log("Users:", await prisma.user.count({ where: { role: "MEMBER" } }));
    console.log("Tasks:", await prisma.task.count({ where: { createdBy: adminId } }));
    
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { createdBy: adminId },
      _count: true
    });
    console.log("Tasks by status:", tasksByStatus);

    const overdueTasks = await prisma.task.findMany({
      where: {
        createdBy: adminId,
        dueDate: { lt: new Date() },
        status: { not: "DONE" }
      },
      include: { project: true, assignee: true },
      take: 10
    });
    console.log("Overdue tasks:", overdueTasks.length);
    console.log("Success!");
  } catch (err) {
    console.error("Dashboard check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDashboard();
