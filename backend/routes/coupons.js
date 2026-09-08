import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data/coupons.json");

// Helper: Ensure data dir & JSON file exist
const getCouponsFromFile = () => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading coupons file:", err);
    return [];
  }
};

const saveCouponsToFile = (coupons) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(coupons, null, 2));
  } catch (err) {
    console.error("Error saving coupons file:", err);
  }
};

// 1. GET ALL COUPONS
router.get("/", (req, res) => {
  const coupons = getCouponsFromFile();
  const mobile = req.query.mobile;

  if (mobile) {
    // Filter for specific user or ALL
    const userCoupons = coupons.filter(
      (c) => c.active !== false && (c.targetUser === "ALL" || c.targetUser === mobile)
    );
    return res.json({ success: true, coupons: userCoupons });
  }

  res.json({ success: true, coupons });
});

// 2. CREATE NEW COUPON (Admin)
router.post("/", (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, targetUser, description } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: "Code and discount value are required." });
  }

  const coupons = getCouponsFromFile();
  const normalizedCode = code.trim().toUpperCase();

  // Check if duplicate code exists
  const existing = coupons.find((c) => c.code.toUpperCase() === normalizedCode);
  if (existing) {
    return res.status(400).json({ success: false, message: `Coupon '${normalizedCode}' already exists.` });
  }

  const newCoupon = {
    id: `coup_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: normalizedCode,
    discountType: discountType || "percentage", // "percentage" | "fixed"
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount || 0),
    targetUser: targetUser ? targetUser.trim() : "ALL", // "ALL" or user mobile
    description: description || `${discountType === "fixed" ? "₹" + discountValue : discountValue + "%"} Off Discount Coupon`,
    active: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newCoupon, ...coupons];
  saveCouponsToFile(updated);

  res.json({ success: true, message: "Coupon created successfully!", coupon: newCoupon, coupons: updated });
});

// 3. DELETE COUPON (Admin)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const coupons = getCouponsFromFile();

  const updated = coupons.filter((c) => String(c.id) !== String(id) && c.code.toUpperCase() !== String(id).toUpperCase());
  saveCouponsToFile(updated);

  res.json({ success: true, message: "Coupon deleted successfully!", coupons: updated });
});

// 4. VALIDATE COUPON AT CHECKOUT
router.post("/validate", (req, res) => {
  const { code, mobile, amount } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Please enter a coupon code." });
  }

  const coupons = getCouponsFromFile();
  const normalizedCode = code.trim().toUpperCase();

  const found = coupons.find((c) => c.code.toUpperCase() === normalizedCode && c.active !== false);

  if (!found) {
    return res.status(404).json({ success: false, message: "❌ Invalid or expired coupon code." });
  }

  if (found.targetUser !== "ALL" && found.targetUser !== mobile) {
    return res.status(403).json({ success: false, message: "❌ This coupon is not valid for your account." });
  }

  const subtotal = Number(amount || 0);
  if (subtotal < (found.minOrderAmount || 0)) {
    return res.status(400).json({
      success: false,
      message: `❌ Minimum order value of ₹${found.minOrderAmount} required for coupon '${found.code}'.`,
    });
  }

  let discountAmount = 0;
  if (found.discountType === "fixed") {
    discountAmount = Math.min(found.discountValue, subtotal);
  } else {
    discountAmount = Math.round((subtotal * found.discountValue) / 100);
  }

  res.json({
    success: true,
    message: `🎉 Coupon '${found.code}' Applied! ${found.discountType === "fixed" ? "₹" + discountAmount : found.discountValue + "%"} Discount Unlocked.`,
    discountAmount,
    coupon: found,
  });
});

export default router;
