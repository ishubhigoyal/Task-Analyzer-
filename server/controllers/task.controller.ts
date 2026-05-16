import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  projectId: z.string(),
  assignedTo: z.string().optional().nullable()
});

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user?.role === "MEMBER") {
      where.assignedTo = req.user.id;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: { project: true, assignee: true },
      orderBy: { dueDate: "asc" }
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true, assignee: true, creator: true }
    });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdBy: req.user!.id
      }
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Members can only update status if it's assigned to them
    if (req.user?.role === "MEMBER") {
       if (task.assignedTo !== req.user.id) {
         return res.status(403).json({ success: false, message: "Cannot edit this task" });
       }
       // Only allow status update for members via this route too? Better to use separate status route.
       // But user request says: "Member: can only update own task status".
       // We'll restrict fields here
       const { status } = req.body;
       const updated = await prisma.task.update({
         where: { id: req.params.id },
         data: { status: status as any }
       });
       return res.json({ success: true, data: updated });
    }

    const data = taskSchema.parse(req.body);
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const task = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (!task) return res.status(404).json({ success: false, message: "Task not found" });

      if (req.user?.role === "MEMBER" && task.assignedTo !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not assigned to you" });
      }

      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

// Comments
export const getComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const comments = await prisma.comment.findMany({
        where: { taskId: req.params.id },
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" }
      });
      res.json({ success: true, data: comments });
    } catch (error) {
      next(error);
    }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body;
      const comment = await prisma.comment.create({
        data: {
          content,
          taskId: req.params.id,
          userId: req.user!.id
        }
      });
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
};
