import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TZV0qidx0ebyke";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "W13hrfhOO7IGRcmLj0YnaFLd";

  return new Razorpay({
    key_id,
    key_secret,
  });
};

// GET /api/payment/key - Expose public key ID for frontend integration
router.get("/key", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TZV0qidx0ebyke";
  return res.json({ success: true, key: keyId });
});

// POST /api/payment/create-order - Create a Razorpay payment order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, receipt, currency = "INR" } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const razorpay = getRazorpayInstance();

    // Razorpay accepts amount in smallest currency unit (paise for INR, 1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_TZV0qidx0ebyke",
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
});

// POST /api/payment/verify - Verify Razorpay payment signature
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "W13hrfhOO7IGRcmLj0YnaFLd";

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed",
      });
    }
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
});

export default router;
