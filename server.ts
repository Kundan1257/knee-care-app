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

    // PRODUCTION CORS CONFIGURATION
    const allowedOrigins = [
      "https://vercel.app",
      "http://localhost:3000",
      "http://localhost:8080"
    ];

    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        } else {
          console.warn(`LOG WARN: [CORS] Blocked request from unauthorized origin: ${origin}`);
          return callback(new Error("Not allowed by CORS security policies"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    }));

    app.use(express.json());
    
    // Request Logger
    app.use((req, res, next) => {
      console.log(`LOG: [${req.method}] ${req.path}`);
      next();
    });

    // API Routes - Health Check FIRST
    console.log("LOG: [Server] Registering core API routes...");
    
    app.get("/api/health", (req, res) => {
      console.log("LOG: [Health] Checked ✅");
      res.json({ 
        status: "Backend is healthy", 
        db: dbStatus.isConnected ? "Connected" : "Disconnected",
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || "development",
        version: "1.0.8", // Incremented version
        port: PORT
      });
    });

    // Diagnostically list all routes
    app.get("/api/routes", (req, res) => {
      const routes: string[] = [];
      app._router.stack.forEach((r: any) => {
        if (r.route && r.route.path) {
          routes.push(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
        } else if (r.name === 'router') {
           // Handle nested routers (simplified)
           routes.push(`ROUTER mounted at ${r.regexp}`);
        }
      });
      res.json({ routes });
    });

    app.get("/api/ping", (req, res) => {
      res.json({ message: "pong", timestamp: new Date().toISOString(), version: "1.0.8" });
    });

    // Temporary diagnostic route
    app.get("/api/test123", (req, res) => {
      console.log("LOG: [Test123] Route hit ✅");
      res.json({
        success: true,
        message: "TEST ROUTE ACTIVE",
        timestamp: new Date().toISOString(),
        version: "1.0.8"
      });
    });

    // Mount Auth Router
    console.log("LOG: [Server] Mounting Auth Router at /api/auth");
    app.use("/api/auth", authRouter);

    // Mount Payment Router
    console.log("LOG: [Server] Mounting Payment Router at /api/payment");
    app.use("/api/payment", paymentRouter);

    // API 404 Handler - If it reaches here, no API route matched
    app.use("/api", (req, res) => {
      console.warn(`LOG WARN: [404 API] No route matched for ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        error: "API endpoint not found",
        method: req.method,
        path: req.originalUrl,
        tip: "This is a custom JSON 404. If you see this, the server IS RUNNING but the route is not registered.",
        version: "1.0.8"
      });
    });

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
