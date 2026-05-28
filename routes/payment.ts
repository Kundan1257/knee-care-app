import express from "express";
import crypto from "crypto";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { dbStatus } from "../lib/db";

// Direct CommonJS load ensures esbuild bundling never scrambles the constructor class
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
    try {
      const RazorpayConstructor = Razorpay.default || Razorpay;
      razorpay = new RazorpayConstructor({
        key_id: key_id,
        key_secret: key_secret
      });
      console.log("LOG: [Payment] Razorpay Class Constructor fully instantiated ✅");
    } catch (err: any) {
      console.error("LOG ERROR: [Payment] Constructor initialization exception:", err.message || err);
      return null;
    }
  }
  return razorpay;
};

paymentRouter.get("/razorpay-key", (req, res) => {
  return res.json({ keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SrtSV2J4ngtpfL" });
});

paymentRouter.post("/create-order", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
  
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(503).json({
        success: false,
        error: "Payment system currently unavailable",
        message: "Payment credentials not configured"
      });
    }

    const options = {
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: "receipt_" + (userId || Date.now()) + "_" + Date.now(),
    };
        
    console.log("Creating Razorpay order for user:", userId);
    const order = await rzp.orders.create(options);
    console.log("Razorpay order created successfully:", order.id);
    
    return res.json({
      success: true,
      order_id: order.id,
      amount: options.amount,
      currency: options.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("LOG ERROR: [Payment] Order creation exception:", error.message || error);
    return res.status(500).json({ success: false, error: "Order creation failed", details: error.message || error });
  }
});

export { paymentRouter };
