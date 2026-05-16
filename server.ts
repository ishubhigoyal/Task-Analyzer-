import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes/auth.routes";
import projectRoutes from "./server/routes/project.routes";
import taskRoutes from "./server/routes/task.routes";
import userRoutes from "./server/routes/user.routes";
import dashboardRoutes from "./server/routes/dashboard.routes";
import { errorHandler } from "./server/middleware/error.middleware";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy is essential for Railway (reverse proxy) to handle cookies correctly
  app.set("trust proxy", 1);

  // Basic Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs this disabled in dev
  }));
  app.use(cors({
    origin: true, // In production, you might want to specify your domain
    credentials: true,
  }));
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    console.log(`[API DEBUG] ${req.method} ${req.url}`);
    next();
  });
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // Global Error Handler
  app.use(errorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
