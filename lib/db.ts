import mongoose from "mongoose";

// Use an object to ensure live bindings across modules for the connection state
export const dbStatus = {
  isConnected: false,
};

// Prevent mongoose buffering timeout to avoid "hanging" requests when DB is down
mongoose.set("bufferCommands", false);

// Connection Events
mongoose.connection.on("connected", () => {
  console.log("LOG: [Database] Mongoose event: connected ✅");
  dbStatus.isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("LOG ERROR: [Database] Mongoose event: error ❌:", err.message);
  dbStatus.isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.warn("LOG WARN: [Database] Mongoose event: disconnected ⚠️");
  dbStatus.isConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("LOG: [Database] Mongoose event: reconnected ✅");
  dbStatus.isConnected = true;
});

export async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!MONGO_URI) {
    const errorMsg = "MONGODB_URI not found in environment variables";
    console.error(`LOG ERROR: [Database] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    console.log("Starting MongoDB connection...");
    
    // Attempt connection with a timeout
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,
    });
    
    console.log("MongoDB connected successfully");
    dbStatus.isConnected = true;

    // Heartbeat ping to keep connection alive every 30 seconds
    const heartbeatId = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.db?.admin().ping();
        } catch (pingError) {
          console.error("LOG ERROR: [Database] Heartbeat ping failed:", pingError);
        }
      }
    }, 30000);
    
    // @ts-ignore
    if (global.__dbHeartbeat) clearInterval(global.__dbHeartbeat);
    // @ts-ignore
    global.__dbHeartbeat = heartbeatId;

  } catch (error: any) {
    console.error(error.message);
    dbStatus.isConnected = false;
    throw error; // Throwing to ensure startup failure is visible
  }
}
