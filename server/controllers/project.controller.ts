import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional()
});

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: req.user?.role === "ADMIN" 
        ? { createdBy: req.user.id } 
        : { members: { some: { userId: req.user?.id } } },
      include: { _count: { select: { tasks: true, members: true } } }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, fullName: true, email: true, role: true } } } },
        tasks: true
      }
    });

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    
    // Check access
    const isMember = project.members.some(m => m.userId === req.user?.id);
    const isCreator = project.createdBy === req.user?.id;
    if (!isMember && !isCreator && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "No access to this project" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        ...data,
        createdBy: req.user!.id,
        members: {
          create: { userId: req.user!.id }
        }
      }
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id, createdBy: req.user!.id },
      data
    });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id, createdBy: req.user!.id }
    });
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

// Members
export const getMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.id },
      include: { user: { select: { id: true, fullName: true, email: true, role: true } } }
    });
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId }
    });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: req.params.memberId,
          projectId: req.params.id
        }
      }
    });
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
};
