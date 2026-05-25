import express from "express";
import jwt from "jsonwebtoken"; // Ensure jsonwebtoken is imported to safely peek at tokens

export const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
  const userId = "user_1779170551728_wmgk";
  res.json({
    token: "dummy_jwt_token_123",
    user: {
      user_id: userId,
      isPremium: true
    }
  });
});

// 💡 ROBUST PROFILE RECOVERY ENDPOINT
// We handle token inspection manually here instead of forcing hard middleware rejection
authRouter.get("/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // 🟢 Return explicit JSON for unauthenticated visitors instead of throwing an error
      return res.json({
        user_id: "user_guest_123456789",
        isPremium: false,
        authenticated: false
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return res.json({
      user_id: decoded.userId || "user_1779170551728_wmgk",
      isPremium: decoded.isPremium || true,
      authenticated: true
    });
  } catch (err) {
    // If a token is corrupt or expired, fall back to guest JSON cleanly
    return res.json({
      user_id: "user_guest_123456789",
      isPremium: false,
      authenticated: false,
      sessionExpired: true
    });
  }
});

