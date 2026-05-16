import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "ADMIN" | "MEMBER";
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // BYPASS AUTH: Always provide the seeded admin user
  try {
    const admin = await prisma.user.findFirst({
      where: { email: "admin@taskmanager.com" }
    });

    if (admin) {
      req.user = { id: admin.id, role: admin.role as "ADMIN" | "MEMBER" };
    } else {
      // Fallback if seed didn't run
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        req.user = { id: firstUser.id, role: firstUser.role as "ADMIN" | "MEMBER" };
      } else {
        req.user = { id: "system-admin", role: "ADMIN" };
      }
    }
    next();
  } catch (error) {
    req.user = { id: "system-admin", role: "ADMIN" };
    next();
  }
};

export const authorize = (roles: ("ADMIN" | "MEMBER")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};
