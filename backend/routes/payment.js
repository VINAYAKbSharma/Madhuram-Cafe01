import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const getActiveKeys = () => {
  let key_id = process.env.RAZORPAY_KEY_ID;
  let key_secret = process.env.RAZORPAY_KEY_SECRET;

  // Ignore missing or any test keys from Render / Vercel env vars
  if (
    !key_id ||
    key_id.startsWith("rzp_test_") ||
    key_id.includes("xxxx")
  ) {
    key_id = "rzp_live_TZZBu3G1koYPd6";
  }

  if (
    !key_secret ||
    key_secret.length < 15 ||
    key_secret.includes("xxxx") ||
    key_secret === "Owdg6nm8pGPsTJfLwwXDbCx5" ||
    key_secret === "W13hrfhOO7IGRcmLj0YnaFLd"
  ) {
    key_secret = "i7PZ1ucMYisVOPpj2jP805xX";
  }

  return { key_id, key_secret };
};

const getRazorpayInstance = () => {
  const { key_id, key_secret } = getActiveKeys();
  return new Razorpay({
    key_id,
    key_secret,
  });
};

// GET /api/payment/key - Expose public key ID for frontend integration
router.get("/key", (req, res) => {
  const { key_id } = getActiveKeys();
  return res.json({ success: true, key: key_id });
});

// Helper function to handle order creation
const handleCreateOrder = async (req, res) => {
  try {
    const { amount, receipt, currency = "INR" } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // Determine amount in paise (if passed in INR <= 100000, convert; if already in paise > 100000, use directly)
    let amountInPaise = Number(amount);
    if (amountInPaise < 1000) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum order amount is 100 paise (₹1)",
      });
    }

    const razorpay = getRazorpayInstance();
    const { key_id } = getActiveKeys();

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order_id: order.id,
      order,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    const rzpDescription =
      error?.error?.description ||
      error?.message ||
      "Failed to create Razorpay order";
    const statusCode = error?.statusCode || error?.status || 400;

    return res.status(statusCode).json({
      success: false,
      message: rzpDescription,
      errorDetails: error?.error || null,
    });
  }
};

// Helper function to handle payment verification
const handleVerifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters (order_id, payment_id, signature)",
      });
    }

    const { key_secret } = getActiveKeys();

    const hmac = crypto.createHmac("sha256", key_secret);
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
        message: "Signature mismatch. Invalid payment signature.",
      });
    }
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

// Routes
router.post("/create-order", handleCreateOrder);
router.post("/verify", handleVerifyPayment);
router.post("/verify-payment", handleVerifyPayment);

export default router;
