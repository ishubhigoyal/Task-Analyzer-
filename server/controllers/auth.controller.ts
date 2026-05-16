import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MEMBER"])
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role }
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, role } = req.body;
    console.log(`Login attempt for: ${fullName} as ${role}`);

    if (!fullName) {
      return res.status(400).json({ success: false, message: "Full Name is required" });
    }

    // Generate a placeholder email based on the full name to satisfy Prisma schema
    const email = `${fullName.toLowerCase().replace(/\s+/g, ".")}@teamtask.internal`;

    // FIND OR CREATE USER
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`User ${fullName} not found, creating...`);
      // Use a fixed placeholder for password since no authentication is needed
      const passwordHash = await bcrypt.hash("no-password-needed", 10);
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: role || "MEMBER"
        }
      });
      console.log(`User created: ${user.id}`);
    } else if (role && user.role !== role) {
      // Update role if the user explicitly chose a different one
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role }
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: "lax",
      path: "/"
    });
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: "lax",
      path: "/"
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error("Login controller error:", error);
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const accessToken = generateAccessToken(user.id, user.role);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, { 
      httpOnly: true, 
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
      path: "/"
    });

    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.json({ success: true, message: "Logged out" });
};

export const getMe = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, fullName: true, email: true, role: true }
  });
  res.json({ success: true, data: user });
};
