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
  // BYPASS AUTH: Always provide a valid database user
  try {
    let user = await prisma.user.findFirst({
      where: { email: "admin@taskmanager.com" }
    });

    if (!user) {
      // If the specific admin is missing, try to get any user
      user = await prisma.user.findFirst();
    }

    if (!user) {
      // If the database is completely empty, create a bootstrap user
      console.log("[AUTH] Creating bootstrap admin user");
      user = await prisma.user.create({
        data: {
          id: "869cf373-8567-49bf-af4e-a693bb3207f4",
          fullName: "System Admin",
          email: "admin@taskmanager.com",
          passwordHash: "bypass",
          role: "ADMIN"
        }
      });
    }

    req.user = { id: user.id, role: user.role as "ADMIN" | "MEMBER" };
    next();
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    // Ultimate fallback if even creation fails (e.g. DB connection issues)
    req.user = { id: "869cf373-8567-49bf-af4e-a693bb3207f4", role: "ADMIN" };
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
