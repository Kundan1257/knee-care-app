import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import Razorpay from "razorpay";

const paymentRouter = express.Router();

// Instantiate Razorpay using the loaded keys
const rzp = new (Razorpay as any)({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

interface CheckoutBody {
  userId?: string;
  currency?: string;
}

const createOrderHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const body = req.body as CheckoutBody;
    const userId = body.userId;
    const chosenCurrency = body.currency;
    
    const currency = chosenCurrency === "USD" ? "USD" : "INR";
    const amount = currency === "USD" ? 4900 : 49900; 

    const options = {
      amount: amount,
      currency: currency,
      receipt: "receipt_" + (userId || Date.now()) + "_" + Date.now(),
    };
        
    console.log(`Creating dynamic Razorpay order (${currency}) for user:`, userId);
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
    return res.status(500).json({ 
      success: false, 
      error: "Order creation failed", 
      details: error.message || error 
    });
  }
};

paymentRouter.post("/create-order", createOrderHandler as unknown as RequestHandler);

export { paymentRouter };
