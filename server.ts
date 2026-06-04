import fs from "fs";
import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Routes will be dynamically imported after loading environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    // Load .env file manually (avoid depending on the `dotenv` package)
    try {
      const envPath = process.cwd() + "/.env";
      if (fs.existsSync(envPath)) {
        const contents = fs.readFileSync(envPath, "utf8");
        for (const line of contents.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq === -1) continue;
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) process.env[key] = val;
        }
      }
    } catch (e) {
      console.warn("LOG WARN: .env loader failed, continuing without it.", (e as any).message || e);
    }

    // Import routes after env is available
    const { default: authRouter } = await import("./routes/auth.ts");
    const { paymentRouter } = await import("./routes/payment.ts");

    const app = express();
    const PORT = process.env.PORT || 8080;

    // Use standard, fully-typed CORS middleware layer configuration
    app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = ["https://vercel.app", "http://localhost:3000", "http://localhost:8080"];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    }));

    app.use(express.json());
    
    // Request Logger
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`LOG: [${req.method}] ${req.path}`);
      next();
    });

    console.log("LOG: [Server] Registering core API routes...");
    
    // Health Check Endpoint
    app.get("/api/health", (req: Request, res: Response) => {
      console.log("LOG: [Health] Checked ✅");
      res.json({ 
        status: "Backend is healthy", 
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || "development",
        version: "1.0.8",
        port: PORT
      });
    });

    // Mount Routers safely using explicit casting
    app.use("/api/auth", authRouter as unknown as RequestHandler);
    app.use("/api/payment", paymentRouter as unknown as RequestHandler);

    // Get Razorpay Key for Frontend
    app.get("/api/razorpay-key", (req: Request, res: Response) => {
      res.json({ keyId: process.env.RAZORPAY_KEY_ID });
    });

    // Serving Static Assets
    const publicPath = path.join(__dirname, "public");
    app.use(express.static(publicPath));

    app.get("/manifest.json", (req: Request, res: Response) => {
      res.sendFile(path.join(publicPath, "manifest.json"));
    });

    // Custom 404 handler
        // Custom 404 handler
    app.use((req: Request, res: Response) => {
      console.log(`LOG ERROR: [404 Fallback] ${req.method} ${req.path}`);
      res.status(404).json({ error: "Resource not found" });
    });

    // Start Listening
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`LOG: [Server] Server listening on 0.0.0.0:${PORT} 🚀`);
    });

  } catch (error: any) {
    console.error("LOG ERROR: [Server] Startup failed ❌");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

