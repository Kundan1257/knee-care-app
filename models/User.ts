import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  user_id: string;
  email?: string;
  password?: string;
  isPremium: boolean;
  paymentId?: string;
  razorpay_order_id?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  paymentId: {
    type: String,
  },
  razorpay_order_id: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
