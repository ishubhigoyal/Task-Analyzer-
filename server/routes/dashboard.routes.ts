import { Router } from "express";
import prisma from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/admin", async (req: any, res) => {
  try {
    console.log(`[DASHBOARD] Admin access for ${req.user.id} (${req.user.role})`);
    
    if (req.user.role !== "ADMIN") {
      console.warn(`[DASHBOARD] Forbidden access for ${req.user.id}`);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [projectsCount, membersCount, tasksCount] = await Promise.all([
      prisma.project.count({ where: { createdBy: req.user.id } }).catch(e => { console.error("Prisma Count Projects Error:", e); return 0; }),
      prisma.user.count({ where: { role: "MEMBER" } }).catch(e => { console.error("Prisma Count Users Error:", e); return 0; }),
      prisma.task.count({ where: { createdBy: req.user.id } }).catch(e => { console.error("Prisma Count Tasks Error:", e); return 0; })
    ]);

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { createdBy: req.user.id },
      _count: true
    }).catch(e => { console.error("Prisma GroupBy Error:", e); return []; });

    const overdueTasks = await prisma.task.findMany({
      where: {
        createdBy: req.user.id,
        dueDate: { lt: new Date() },
        status: { not: "DONE" }
      },
      include: { project: true, assignee: true },
      take: 10
    }).catch(e => { console.error("Prisma FindMany Overdue Error:", e); return []; });

    res.json({ 
      success: true, 
      data: { 
        stats: { projectsCount, membersCount, tasksCount, overdueCount: overdueTasks.length },
        tasksByStatus,
        overdueTasks
      } 
    });
  } catch (error: any) {
    console.error("Dashboard Admin Route Fatal Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error during dashboard synthesis",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
