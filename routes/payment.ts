import express from "express";
import crypto from "crypto";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { dbStatus } from "../lib/db";

// Use standard CJS loading for esbuild compatibility
const Razorpay = require("razorpay");

const paymentRouter = express.Router();
let razorpay: any = null;

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    console.error("LOG ERROR: [Payment] Keys missing from process.env inside getRazorpay!");
    return null;
  }

  if (!razorpay) {
    if (key_id.startsWith('rzp_test_')) {
      console.log("LOG: [Payment] Razorpay initialized in TEST MODE ✅");
    } else {
      console.warn("LOG WARN: [Payment] Razorpay initialized in LIVE MODE ⚠️");
    }
    
    // Unpack runtime bundler definitions automatically
    const RazorpayConstructor = (Razorpay as any).default || Razorpay;
    razorpay = new RazorpayConstructor({
      key_id: key_id,
      key_secret: key_secret
    });
  }
  return razorpay;
};

paymentRouter.post("/create-order", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
  
    const rzp = getRazorpay();
    if (!rzp) {
      console.warn("LOG WARN: [Payment] Razorpay not configured - Order creation aborted");
      return res.status(503).json({
        success: false,
        error: "Payment system currently unavailable",
        message: "Payment credentials not configured"
      });
    }

    const options = {
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: "receipt_" + (typeof userId !== 'undefined' ? userId : Date.now()) + "_" + Date.now(),
    };
        
    console.log("Creating Razorpay order for user:", userId);
    const order = await rzp.orders.create(options);
    console.log("Razorpay order created:", order.id);
    
    return res.json({
      success: true,
      order_id: order.id,
      amount: options.amount,
      currency: options.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("LOG ERROR: [Payment] Order creation failed:", error.message || error);
    return res.status(500).json({ success: false, error: "Order creation failed", details: error.message || error });
  }
});

export { paymentRouter };
