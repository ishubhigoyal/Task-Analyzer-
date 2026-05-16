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
  // BYPASS AUTH: Always provide a guest user session
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  let userId = "guest-id";

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch (e) {
      // Ignore token errors
    }
  }

  // Try to find the user, or just use a default one from database
  try {
    let user = await prisma.user.findFirst(); // Just grab any user to act as context
    
    if (!user) {
      // Create a default system user if none exists
      user = await prisma.user.create({
        data: {
          email: "system@workspace.internal",
          fullName: "System Admin",
          passwordHash: "no-auth",
          role: "ADMIN"
        }
      });
    }

    req.user = { id: user.id, role: user.role as "ADMIN" | "MEMBER" };
    next();
  } catch (error) {
    // Ultimate fallback to hardcoded guest info
    req.user = { id: "permanent-guest", role: "ADMIN" };
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
