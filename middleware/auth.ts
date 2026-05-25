import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { user_id: string };
}

export function generateToken(user: any) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("LOG ERROR: [Auth] JWT_SECRET is missing. Generation failed.");
    throw new Error("JWT_SECRET is missing");
  }
  
  const payload = { user_id: user.user_id || user._id };
  const token = jwt.sign(payload, secret, { expiresIn: '365d' });
  
  console.log(`LOG SUCCESS: [Auth] Token generated for user: ${payload.user_id}`);
  return token;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn("LOG WARNING: [Auth] Missing authorization header");
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("LOG WARNING: [Auth] Invalid authorization format");
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("LOG ERROR: [Auth] JWT_SECRET is missing. Verification failed.");
      return res.status(500).json({ error: "Internal server config error" });
    }

    const decoded = jwt.verify(token, secret) as { user_id: string };
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("LOG ERROR: [Auth] Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
