import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/madhuram";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    return false;
  }
}

export default connectDB;
