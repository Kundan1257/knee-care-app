import express from "express";
import type { Response } from "express";
import { dbStatus } from "../lib/db.ts";
import { generateToken, verifyToken } from "../middleware/auth.ts";
import type { AuthRequest } from "../middleware/auth.ts";
import User from "../models/User.ts";

const authRouter = express.Router();

authRouter.get("/me", verifyToken as any, (async (req: any, res: Response) => {
  try {
    const userId = req.userId || req.user?.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication identification missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.json({
      user_id: user._id || user.id,
      email: user.email || "guest@example.com",
      isPremium: user.isPremium || false,
      isGuest: !user.email
    });

  } catch (dbError: any) {
    console.error("Database query exception:", dbError.message || dbError);
    return res.json({
      user_id: req.userId,
      email: "guest@example.com",
      isPremium: false,
      isGuest: true
    });
  }
}) as any);
// UPDATED ANONYMOUS AUTO-LOGIN ENDPOINT WITH UNIQUE UTILITIES
authRouter.post("/auto-login", (async (req: any, res: Response) => {
  try {
    // Generate a completely unique identifier for this guest session
    const uniqueId = Math.floor(100000 + Math.random() * 900000);
    const guestEmail = `guest_${uniqueId}@knee-care.local`;
    const guestPassword = `Pass_${uniqueId}_${Date.now()}`;

    // Create the guest user filling your model's required fields
    const guestUser = new User({
      email: guestEmail,
      password: guestPassword, // If your model hashes passwords, this is fine
      isPremium: false
    });

    await guestUser.save();

    const userIdString = (guestUser._id || guestUser.id).toString();
    const token = generateToken(userIdString);

    return res.status(200).json({
      success: true,
      token: token,
      user: {
        user_id: userIdString,
        email: guestEmail,
        isPremium: false,
        isGuest: true
      }
    });

  } catch (error: any) {
    // Crucial: This logs the EXACT reason MongoDB rejected it into your Render console!
    console.error("Auto-login database validation failure details:", error.message || error);
    return res.status(500).json({ 
      error: "Failed to initialize secure auto-login session",
      details: error.message 
    });
  }
}) as any);


export default authRouter;
