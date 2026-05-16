import { Router } from "express";
import prisma from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/admin", async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).send("Forbidden");

  const [projectsCount, membersCount, tasksCount] = await Promise.all([
    prisma.project.count({ where: { createdBy: req.user.id } }),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.task.count({ where: { creator: { id: req.user.id } } })
  ]);

  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { createdBy: req.user.id },
    _count: true
  });

  const now = new Date();
  const overdueTasks = await prisma.task.findMany({
    where: {
      createdBy: req.user.id,
      dueDate: { lt: now },
      status: { not: "DONE" }
    },
    include: { project: true, assignee: true }
  });

  res.json({ 
    success: true, 
    data: { 
      stats: { projectsCount, membersCount, tasksCount, overdueCount: overdueTasks.length },
      tasksByStatus,
      overdueTasks
    } 
  });
});

router.get("/member", async (req: any, res) => {
  const tasks = await prisma.task.findMany({
    where: { assignedTo: req.user.id },
    include: { project: true }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "DONE").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length
  };

  res.json({ success: true, data: { stats, tasks } });
});

export default router;
