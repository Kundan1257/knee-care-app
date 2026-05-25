import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { dbStatus } from "../lib/db";
import { verifyToken, AuthRequest } from "../middleware/auth";

import User from "../models/User";

export const paymentRouter = express.Router();

// Health check for payment router
paymentRouter.get("/status", (req, res) => {
  res.json({ 
    status: "Payment router is active", 
    razorpayConfigured: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    timestamp: new Date().toISOString() 
  });
});

let razorpay: Razorpay | null = null;

const getRazorpay = () => {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      return null;
    }

    if (key_id.startsWith('rzp_test_')) {
      console.log("LOG: [Payment] Razorpay initialized in TEST MODE ✅");
    } else {
      console.warn("LOG WARN: [Payment] Razorpay initialized in LIVE MODE ⚠️");
    }
    
    razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });
  }
  return razorpay;
};

// 2. BACKEND: CREATE ORDER API
paymentRouter.post("/create-order", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const rzp = getRazorpay();
    if (!rzp) {
      console.warn("LOG WARN: [Payment] Razorpay not configured - Order creation skipped");
      return res.status(503).json({ 
        success: false, 
        error: "Payment system currently unavailable",
        message: "Payment credentials not configured" 
      });
    }

    // DB Check - CRITICAL: Block order creation if DB is disconnected
    if (!dbStatus.isConnected) {
      console.warn("LOG WARN: [Payment] DB Disconnected - Blocking order creation");
      return res.status(503).json({ 
        success: false, 
        error: "Database Service Unavailable",
        message: "Payment cannot be processed without a stable database connection." 
      });
    }

    const options = {
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: "receipt_" + userId + "_" + Date.now(),
    };

    console.log("Creating Razorpay order for user:", userId);
    const order = await rzp.orders.create(options);
    console.log("Razorpay order created:", order.id);

    return res.json({
      success: true,
      order: order
    });
  } catch (err: any) {
    console.error("LOG ERROR: [Payment] Order creation failed:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Order creation failed",
      message: err.message 
    });
  }
});

// 3. RAZORPAY PAYMENT VERIFICATION
paymentRouter.post("/verify-payment", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const userId = req.user?.user_id;

    if (!secret) {
      console.error("LOG ERROR: [Payment] RAZORPAY_KEY_SECRET not found");
      return res.status(500).json({ error: "Razorpay secret not configured" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      // PERSISTENCE: Update user as premium in DB
      console.log("LOG: [Payment] Verification started - Updating user premium status for:", userId);
      
      if (!dbStatus.isConnected) {
        console.error("LOG ERROR: [Payment] DB Disconnected during verification!");
        return res.status(503).json({ success: false, error: "Database disconnected during verification. Please contact support." });
      }

      const updatedUser = await User.findOneAndUpdate(
        { user_id: userId },
        { 
          isPremium: true,
          paymentId: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id
        },
        { upsert: true, returnDocument: 'after' }
      );

      console.log("LOG: [Payment] User premium updated successfully ✅");

      return res.json({ 
        success: true, 
        message: "Payment verified successfully",
        isPremium: true,
        user: updatedUser
      });
    } else {
      console.error("LOG ERROR: [Payment] Invalid signature detected");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("LOG ERROR: [Payment] Verification crashed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. PREMIUM ACCESS PROTECTION
paymentRouter.get("/premium-content", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!dbStatus.isConnected) {
      return res.status(503).json({ error: "Database Service Unavailable" });
    }

    try {
      const user = await User.findOne({ user_id: userId });

      if (!user || !user.isPremium) {
        return res.status(403).json({ error: "Upgrade required" });
      }

      res.json({ data: "Premium content unlocked" });
    } catch (dbError: any) {
      console.error("Database query for premium content failed:", dbError.message);
      res.status(503).json({ error: "Database service error" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default paymentRouter;
