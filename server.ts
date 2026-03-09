import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import usersRouter from "./src/api/users.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite development
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL : '*',
    credentials: true
  }));

  // Rate limiting to prevent brute-force attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload too large attacks

  // API routes
  app.use("/api/users", usersRouter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
