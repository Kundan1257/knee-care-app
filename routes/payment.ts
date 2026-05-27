import express from "express";
import crypto from "crypto";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { dbStatus } from "../lib/db";

const Razorpay = require("razorpay");
const paymentRouter = express.Router();
let razorpay: any = null;

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    console.error("LOG ERROR: [Payment] Keys missing inside getRazorpay!");
    return null;
  }

  if (!razorpay) {
    const RazorpayConstructor = Razorpay.default || Razorpay;
    razorpay = new RazorpayConstructor({
      key_id: key_id,
      key_secret: key_secret
    });
    console.log("LOG: [Payment] Razorpay Class Constructor fully unpacked ✅");
  }
  return razorpay;
};

paymentRouter.get("/razorpay-key", (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SrtSV2J4ngtpfL" });
});

paymentRouter.post("/create-order", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
  
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(503).json({ success: false, error: "Payment system currently unavailable" });
    }

    const options = {
      amount: 49900,
      currency: "INR",
      receipt: `receipt_${userId || Date.now()}_${Date.now()}`
    };
        
    const order = await rzp.orders.create(options);
    return res.json({
      success: true,
      order_id: order.id,
      amount: options.amount,
      currency: options.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("LOG ERROR: [Payment] Backend Exception:", error.message || error);
    return res.status(500).json({ success: false, error: "Order creation failed" });
  }
});

export { paymentRouter };
