import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", process.env.MONGO_URI ? "MONGO_URI Loaded ✅" : "MONGO_URI Missing ❌");

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";

import { connectDB, dbStatus } from "./lib/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Handlers to prevent process crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception thrown:", err.message, err.stack);
});

console.log("LOG: [Server] Starting application initialization...");

async function startServer() {
  try {
    console.log("LOG: [Server] Starting application...");
    
    // Connect to database before starting the server
    await connectDB();
    
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());
    
    // Request Logger
    app.use((req, res, next) => {
      console.log(`LOG: [${req.method}] ${req.path}`);
      next();
    });

    // API Routes
    app.get("/api/health", (req, res) => {
      console.log("LOG: [Health] Checked");
      res.json({ status: "Backend is healthy", time: new Date().toISOString() });
    });

    // Mount Auth Router - simplified and direct
    console.log("LOG: [Server] Mounting Auth Routes at /api/auth");
    
    // Safety check for the import
    const finalAuthRouter = (authRoutes as any).default || authRoutes;
    if (typeof finalAuthRouter === "function" || finalAuthRouter?.post) {
      app.use("/api/auth", finalAuthRouter);
    } else {
      console.error("LOG ERROR: [Server] Invalid authRoutes router ❌");
    }

    app.use("/api/payment", paymentRoutes);

    // Get Razorpay Key ID for client
    app.get("/api/razorpay-key", (req, res) => {
      res.json({ keyId: process.env.RAZORPAY_KEY_ID || "" });
    });

    const publicPath = path.join(process.cwd(), "public");
    
    // Explicitly serve manifest.json with correct Content-Type to fix PWA issues
    app.get("/manifest.json", (req, res) => {
      res.header("Content-Type", "application/json; charset=utf-8");
      res.header("Access-Control-Allow-Origin", "*");
      res.sendFile(path.join(publicPath, "manifest.json"), (err) => {
        if (err) {
          console.error("LOG ERROR: [Manifest] Failed to serve manifest.json", err);
          res.status(404).send("Manifest not found");
        }
      });
    });

    // Explicitly serve sw.js for PWA
    app.get("/sw.js", (req, res) => {
      res.header("Content-Type", "application/javascript; charset=utf-8");
      res.header("Service-Worker-Allowed", "/");
      res.sendFile(path.join(publicPath, "sw.js"), (err) => {
        if (err) {
          res.status(404).send("SW not found");
        }
      });
    });

    // Serve public folder static files as early as possible
    app.use(express.static(publicPath));

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : {
            overlay: false, // Ensure no overlay even if partially enabled
          },
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        // Only handle GET requests for SPA fallback
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // Custom 404 handler for API and non-matched routes
    app.use((req, res) => {
      console.log(`LOG ERROR: [404] ${req.method} ${req.path}`);
      res.status(404).json({ 
        error: "Route not found", 
        method: req.method, 
        path: req.path,
        suggestion: "Verify API_URL configuration and route definitions"
      });
    });

    // Start listening
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error("LOG ERROR: [Server] Startup failed ❌");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
