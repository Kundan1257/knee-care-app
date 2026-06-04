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

export default authRouter;
