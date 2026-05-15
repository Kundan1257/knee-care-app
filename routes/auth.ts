import express from "express";
import { dbStatus } from "../lib/db";
import { generateToken, verifyToken, AuthRequest } from "../middleware/auth";
import User from "../models/User";

const authRouter = express.Router();

// Health check for auth router
authRouter.get("/status", (req, res) => {
  res.json({ status: "Auth router is active", timestamp: new Date().toISOString() });
});

// Register / Login (Simplified for this app)
authRouter.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // DB Check
    if (!dbStatus.isConnected) {
      return res.status(503).json({ error: "Database Service Unavailable" });
    }

    try {
      // Check if user exists or create new
      let user = await User.findOne({ email });
      
      if (!user) {
        const user_id = "user_" + Math.random().toString(36).substr(2, 9);
        user = await User.create({ email, user_id });
      }

      const token = generateToken({ user_id: user.user_id });

      return res.json({ 
        token, 
        user: { 
          email: user.email, 
          user_id: user.user_id,
          isPremium: user.isPremium 
        } 
      });
    } catch (dbError: any) {
      console.error("Login database operation failed:", dbError.message);
      const user_id = "guest_" + Math.random().toString(36).substr(2, 5);
      const token = generateToken({ user_id });
      return res.json({ 
        token, 
        user: { 
          email, 
          user_id,
          isPremium: false 
        } 
      });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Auto Login / Anonymous Session
authRouter.post("/auto-login", async (req, res) => {
  console.log("LOG: [Auth] Matched POST /api/auth/auto-login");
  try {
    const user_id = "user_" + Date.now();
    const token = generateToken({ user_id });
    
    return res.json({ 
      success: true, 
      token, 
      user_id,
      user: null
    });
  } catch (error: any) {
    console.error("LOG ERROR: [Auth] Auto-login flow critically failed:", error.message);
    res.status(500).json({ error: "Auto-login failed" });
  }
});

// Get profile
authRouter.get("/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user info in token" });
    }

    // DB Check
    if (!dbStatus.isConnected) {
      return res.status(503).json({ error: "Database Service Unavailable" });
    }

    try {
      const user = await User.findOne({ user_id: userId });
      
      if (!user) {
        return res.json({ user_id: userId, isPremium: false, isGuest: true }); // Return guest state instead of 404
      }

      res.json({ 
        user_id: user.user_id, 
        email: user.email || "guest@example.com",
        isPremium: user.isPremium,
        isGuest: !user.email
      });
    } catch (dbError: any) {
      console.error("Database query failed, returning fallback:", dbError.message);
      return res.json({ 
        user_id: userId, 
        email: "guest@example.com",
        isPremium: false,
        isGuest: true 
      });
    }
  } catch (error: any) {
    console.error(`LOG ERROR: [Auth] Profile fetch failed:`, error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { authRouter as authRoutes };
export default authRouter;
