import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/madhuramCafe";

export async function connectDB() {
  try {
    const isLocal = MONGO_URI.includes("127.0.0.1") || MONGO_URI.includes("localhost");
    console.log(`Connecting to MongoDB (${isLocal ? "local" : "remote"})...`);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    if (!process.env.MONGO_URI) {
      console.error(
        "WARNING: MONGO_URI is not set! Using default local URI which won't work on Render."
      );
      console.error(
        "Set MONGO_URI in your Render Environment variables (e.g., MongoDB Atlas connection string)."
      );
    }
    return false;
  }
}

export default connectDB;
