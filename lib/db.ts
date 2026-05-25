import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (uri) {
      await mongoose.connect(uri);
      console.log("LOG: [DB] Connected to MongoDB successfully ✅");
    } else {
      console.warn("LOG: [DB] No MONGO_URI in process.env, running offline without DB");
    }
  } catch (err: any) {
    console.error("LOG: [DB] Connection failed:", err.message);
  }
};

export const dbStatus = {
  get isConnected() {
    return mongoose.connection.readyState === 1;
  }
};
