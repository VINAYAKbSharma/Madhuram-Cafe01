import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../backend/config/db.js";
import authRouter from "../backend/routes/auth.js";
import ordersRouter from "../backend/routes/orders.js";
import paymentRouter from "../backend/routes/payment.js";
import woocommerceRouter from "../backend/routes/woocommerce.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/woocommerce", woocommerceRouter);
app.use("/api", paymentRouter);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Madhuram Cafe Vercel Serverless Backend is running",
  });
});

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB connection warning in serverless:", err);
  }
  return app(req, res);
}
