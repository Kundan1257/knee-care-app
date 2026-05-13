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

    // Explicitly serve manifest.json with correct Content-Type to fix PWA issues
    app.get("/manifest.json", (req, res) => {
      const filePath = path.resolve(__dirname, "public", "manifest.json");
      res.header("Content-Type", "application/json; charset=utf-8");
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("LOG ERROR: [Manifest] Failed to serve manifest.json", err);
          res.status(404).send("Manifest not found");
        }
      });
    });

    // Explicitly serve sw.js for PWA
    app.get("/sw.js", (req, res) => {
      const filePath = path.resolve(__dirname, "public", "sw.js");
      res.header("Content-Type", "application/javascript; charset=utf-8");
      res.sendFile(filePath);
    });

    // Serve public folder static files (like icons)
    app.use(express.static(path.resolve(__dirname, "public")));

    // API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/payment", paymentRoutes);

    // Get Razorpay Key ID for client
    app.get("/api/razorpay-key", (req, res) => {
      res.json({ keyId: process.env.RAZORPAY_KEY_ID || "" });
    });

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
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

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
