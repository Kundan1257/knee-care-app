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
// NEW ANONYMOUS AUTO-LOGIN ENDPOINT
authRouter.post("/auto-login", (async (req: any, res: Response) => {
  try {
    // 1. Create a brand new anonymous guest user in your database
    const guestUser = new User({
      isPremium: false
      // You can leave email empty or omit it if your model allows it,
      // which flags them as an anonymous guest user profile.
    });

    await guestUser.save();

    // 2. Generate an authorization token using your existing middleware utility
    const userIdString = (guestUser._id || guestUser.id).toString();
    const token = generateToken(userIdString);

    // 3. Return the token and user details to the frontend
    return res.status(200).json({
      success: true,
      token: token,
      user: {
        user_id: userIdString,
        email: "guest@example.com",
        isPremium: false,
        isGuest: true
      }
    });

  } catch (error: any) {
    console.error("Auto-login pipeline exception:", error.message || error);
    return res.status(500).json({ error: "Failed to initialize secure auto-login session" });
  }
}) as any);

export default authRouter;
