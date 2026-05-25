import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { dbStatus } from "../lib/db";
import { verifyToken, AuthRequest } from "../middleware/auth";
import * as Sentry from "../lib/sentry";

export const paymentRouter = express.Router();

let razorpay: any = null;

const getRazorpay = () => {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      console.warn("LOG: [Payment] Razorpay keys missing from environment (KEY_ID: " + (key_id ? "SET" : "MISSING") + ")");
      return null;
    }

    try {
      console.log("LOG: [Payment] Attempting to initialize Razorpay SDK...");
      
      let RZPCtor: any = Razorpay;
      if (typeof (RZPCtor as any).default === 'function') {
        RZPCtor = (RZPCtor as any).default;
      } else if (typeof RZPCtor !== 'function' && (RZPCtor as any).default) {
        RZPCtor = (RZPCtor as any).default;
      }
      
      if (typeof RZPCtor !== 'function') {
        if ((RZPCtor as any).Razorpay) RZPCtor = (RZPCtor as any).Razorpay;
      }

      if (typeof RZPCtor !== 'function') {
        console.error("LOG ERROR: [Payment] Razorpay import resolved to:", typeof RZPCtor, RZPCtor);
        throw new Error("Razorpay constructor not found in imported module");
      }

      razorpay = new RZPCtor({
        key_id: key_id,
        key_secret: key_secret,
      });

      console.log("LOG: [Payment] Razorpay SDK initialized successfully ✅");
    } catch (initErr: any) {
      console.error("LOG ERROR: [Payment] SDK Initialization crashed:", initErr.message);
      Sentry.captureException(initErr);
      return null;
    }
  }
  return razorpay;
};

paymentRouter.post("/create-order", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const rzp = getRazorpay();
    
    if (!rzp) {
      console.warn("LOG WARN: [Payment] Razorpay not configured on the server, order creation bypassed");
      return res.status(500).json({
        success: false,
        error: "Razorpay keys not configured on server"
      });
    }

    const options = {
      amount: 49900, // ₹499 in paise (Verify: ₹499 * 100 = 49900 ✅)
      currency: "INR",
      receipt: "rcpt_" + (userId ? userId.toString().slice(-10) : "gst") + "_" + Math.floor(Date.now() / 1000),
    };
    
    console.log("LOG: [Payment] RAZORPAY ORDER PAYLOAD:", JSON.stringify(options, null, 2));
    
    if (!rzp.orders || typeof rzp.orders.create !== 'function') {
      console.error("LOG ERROR: [Payment] rzp.orders.create is not available on the initialized object");
      throw new Error("Razorpay SDK is missing the orders.create method");
    }

    try {
      console.log("LOG: [Payment] Calling rzp.orders.create...");
      const order = await rzp.orders.create(options);
      console.log("LOG: [Payment] Razorpay order success ✅:", order.id);

      return res.json({
        success: true,
        order: order
      });
    } catch (razorpayErr: any) {
      console.error("LOG ERROR: [Payment] Razorpay order creation failed ❌");
      Sentry.captureException(razorpayErr);
      
      let debugInfo = {};
      try {
        debugInfo = JSON.parse(JSON.stringify(razorpayErr, Object.getOwnPropertyNames(razorpayErr)));
      } catch (e) {
        debugInfo = { raw: String(razorpayErr) };
      }
      console.error("ERROR JSON STRUCTURE:", JSON.stringify(debugInfo, null, 2));

      const errMsg = razorpayErr.description || razorpayErr.message || (typeof razorpayErr === 'string' ? razorpayErr : "Unknown Razorpay error");
      console.error("RESOLVED ERROR MESSAGE:", errMsg);

      return res.status(500).json({ 
        success: false, 
        error: "Order creation failed",
        message: errMsg,
        code: razorpayErr.code || "PAYMENT_API_ERROR",
        details: debugInfo
      });
    }
  } catch (err: any) {
    console.error("LOG ERROR: [Payment] General handler exception ❌:", err.message);
    Sentry.captureException(err);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error during payment initialization",
      message: err.message
    });
  }
});

paymentRouter.post("/verify-payment", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing required verification fields" });
    }
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
      
    if (generated_signature !== razorpay_signature) {
      console.error("LOG ERROR: [Payment] Signature verification failed! ❌");
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }
    
    console.log("LOG: [Payment] Payment verified successfully! ✅");
    return res.json({ success: true, message: "Payment verified successfully" });
  } catch (err: any) {
    console.error("LOG ERROR: [Payment] Verification crashed:", err.message);
    Sentry.captureException(err);
    return res.status(500).json({ success: false, error: "Payment verification failed", message: err.message });
  }
});
