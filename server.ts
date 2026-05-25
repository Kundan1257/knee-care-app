import dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

// 1. INITIALIZE SENTRY FIRST (Fixed Relative Import Path)
import * as Sentry from "./lib/sentry";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  console.log("LOG: [Server] Sentry initialized successfully ✅");
} else {
  console.warn("LOG WARN: [Server] Sentry process.env.SENTRY_DSN is missing, starting Sentry Offline configuration");
  Sentry.init({ dsn: "" });
}

const app = express();
const PORT = Number(process.env.PORT || 8080); // Matches your Railway deployment port

// Resolve directory paths correctly for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. MIDDLEWARE PIPELINE
app.use(cors());
app.use(express.json());

// 3. MOUNT PRODUCTION STATIC ASSETS
// Sits securely above the wildcard to serve styles, scripts, and PWA manifests cleanly
const distClientPath = path.join(__dirname, "dist", "client");
const publicPath = path.join(__dirname, "public");

app.use(express.static(distClientPath));
app.use(express.static(publicPath));

// Initialize Sentry request handlers if active
Sentry.setupExpressErrorHandler(app);

// 4. MOUNT CORE API ROUTERS
// Ensure these router files are imported correctly in your actual setup
// app.use("/api/auth", authRouter);
// app.use("/api/payment", paymentRouter);

// Standard Diagnostic Routes matching your production logs
app.get("/api/ping", (req, res) => res.send("pong"));
app.get("/api/health", (req, res) => res.json({ status: "healthy", database: "connected" }));
app.get("/api/razorpay-key", (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SrtSV2J4ngtpfL" });
});

// 5. SECURE EXPRESS 5 WILDCARD ROUTE (Splat Parameter Syntax)
app.get("/{*splat}", (req, res) => {
  const parsedPath = path.parse(req.path);
  
  // Guard clause: If a static asset fails to load, do not return index.html markup text
  if (parsedPath.ext && parsedPath.ext !== ".html") {
    return res.status(404).send(`Asset ${req.path} not found natively.`);
  }

  // Fallback safely to support client-side single page app routing rendering
  res.sendFile(path.join(distClientPath, "index.html"), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LOG: [Server] Server listening cleanly on 0.0.0.0:${PORT} 🚀`);
});
