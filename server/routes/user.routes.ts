import { Router } from "express";
import prisma from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true }
  });
  res.json({ success: true, data: users });
});

router.get("/me", async (req: any, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, role: true }
    });
    res.json({ success: true, data: user });
});

export default router;
