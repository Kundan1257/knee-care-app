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
import { authRouter } from "./routes/auth";
import { paymentRouter } from "./routes/payment";

import { connectDB, dbStatus } from "./lib/db";

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
    
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());
    
    // Request Logger
    app.use((req, res, next) => {
      console.log(`LOG: [${req.method}] ${req.path}`);
      next();
    });

    // API Routes - Health Check FIRST
    console.log("LOG: [Server] Registering /api/health");
    app.get("/api/health", (req, res) => {
      console.log("LOG: [Health] Checked ✅");
      res.json({ 
        status: "Backend is healthy", 
        db: dbStatus.isConnected ? "Connected" : "Disconnected",
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || "development",
        version: "1.0.5", // Explicit version to track deployments
        port: PORT
      });
    });

    // Test route
    app.get("/api/ping", (req, res) => {
      res.json({ message: "pong", timestamp: new Date().toISOString(), version: "1.0.5" });
    });

    // Mount Auth Router
    console.log("LOG: [Server] Mounting Auth Router at /api/auth");
    app.use("/api/auth", (req, res, next) => {
      console.log(`LOG: [Auth Proxy] ${req.method} ${req.path}`);
      next();
    }, authRouter);

    // Mount Payment Router
    console.log("LOG: [Server] Mounting Payment Router at /api/payment");
    app.use("/api/payment", (req, res, next) => {
      console.log(`LOG: [Payment Proxy] ${req.method} ${req.path}`);
      next();
    }, paymentRouter);

    // Get Razorpay Key ID for client
    app.get("/api/razorpay-key", (req, res) => {
      res.json({ keyId: process.env.RAZORPAY_KEY_ID || "" });
    });

    const publicPath = path.join(process.cwd(), "public");
    
    // Explicitly serve manifest.json with correct Content-Type to fix PWA issues
    app.get("/manifest.json", (req, res) => {
      res.header("Content-Type", "application/manifest+json; charset=utf-8");
      res.header("Access-Control-Allow-Origin", "*");
      res.sendFile(path.join(publicPath, "manifest.json"), (err) => {
        if (err) {
          console.error("LOG ERROR: [Manifest] Failed to serve manifest.json", err);
          res.status(404).send("Manifest not found");
        }
      });
    });

    // Explicitly serve PWA icons
    const pwaIcons = ["icon-192.png", "icon-512.png"];
    pwaIcons.forEach(icon => {
      app.get(`/${icon}`, (req, res) => {
        res.header("Content-Type", "image/png");
        res.header("Access-Control-Allow-Origin", "*");
        // Try serving from publicPath first, then distPath as fallback
        const filePath = path.join(publicPath, icon);
        res.sendFile(filePath, (err) => {
          if (err) {
            const distPath = path.join(process.cwd(), "dist");
            res.sendFile(path.join(distPath, icon), (err2) => {
              if (err2) {
                console.error(`LOG ERROR: [Icons] Failed to serve ${icon} from both public and dist`, err2);
                res.status(404).send("Icon not found");
              }
            });
          }
        });
      });
    });

    // Explicitly serve sw.js for PWA
    app.get("/sw.js", (req, res) => {
      res.header("Content-Type", "application/javascript; charset=utf-8");
      res.header("Service-Worker-Allowed", "/");
      res.sendFile(path.join(publicPath, "sw.js"), (err) => {
        if (err) {
          const distPath = path.join(process.cwd(), "dist");
          res.sendFile(path.join(distPath, "sw.js"), (err2) => {
            if (err2) {
              res.status(404).send("SW not found");
            }
          });
        }
      });
    });

    // Serve public folder static files as early as possible
    app.use(express.static(publicPath));

    // Vite middleware for development
    const isProd = process.env.NODE_ENV === "production";
    console.log(`LOG: [Server] Environment: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);

    if (!isProd) {
      console.log("LOG: [Server] Initializing Vite Middleware...");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : {
            overlay: false, 
          },
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      console.log(`LOG: [Server] Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        // Essential: Allow /api routes to fall through to the custom 404 handler
        // If the path starts with /api, we should not serve index.html
        if (req.path.startsWith("/api/")) {
          console.warn(`LOG WARN: [404] API route not found: ${req.method} ${req.path}`);
          return res.status(404).json({
            error: "API endpoint not found",
            path: req.path,
            method: req.method,
            tip: "Check route registration in server.ts and path correctness."
          });
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // Custom 404 handler for API and non-matched routes
    app.use((req, res) => {
      console.log(`LOG ERROR: [404 Fallback] ${req.method} ${req.path}`);
      res.status(404).json({ 
        error: "Resource not found", 
        method: req.method, 
        path: req.path,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });

    // Connect to database in the background or await it if critical
    // We'll initiate it here but not let it block the listen if possible
    console.log("LOG: [Server] Initiating database connection...");
    connectDB().then(() => {
      console.log("LOG: [Server] Database connected successfully ✅");
    }).catch(err => {
      console.error("LOG ERROR: [Server] Database connection failed during background init:", err.message);
    });

    // Start listening
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`LOG: [Server] Server listening on 0.0.0.0:${PORT} 🚀`);
      
      // Log registered routes for verification
      console.log("LOG: [Server] Registered Routes:");
      app._router.stack.forEach((r: any) => {
        if (r.route && r.route.path) {
          console.log(` - ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
        } else if (r.name === 'router') {
          console.log(` - ROUTER MOUNTED @ ${r.regexp}`);
        }
      });
    });

  } catch (error: any) {
    console.error("LOG ERROR: [Server] Startup failed ❌");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
