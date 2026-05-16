import { Router } from "express";
import prisma from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/admin", async (req: any, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).send("Forbidden");

    console.log(`[DASHBOARD] Fetching admin data for ${req.user.id}`);

    const [projectsCount, membersCount, tasksCount] = await Promise.all([
      prisma.project.count({ where: { createdBy: req.user.id } }),
      prisma.user.count({ where: { role: "MEMBER" } }),
      prisma.task.count({ where: { createdBy: req.user.id } })
    ]);

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { createdBy: req.user.id },
      _count: true
    });

    const overdueTasks = await prisma.task.findMany({
      where: {
        createdBy: req.user.id,
        dueDate: { lt: new Date() },
        status: { not: "DONE" }
      },
      include: { project: true, assignee: true },
      take: 10
    });

    res.json({ 
      success: true, 
      data: { 
        stats: { projectsCount, membersCount, tasksCount, overdueCount: overdueTasks.length },
        tasksByStatus,
        overdueTasks
      } 
    });
  } catch (error) {
    console.error("Dashboard Admin Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/member", async (req: any, res) => {
  try {
    console.log(`[DASHBOARD] Fetching member data for ${req.user.id}`);
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
  } catch (error) {
    console.error("Dashboard Member Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
