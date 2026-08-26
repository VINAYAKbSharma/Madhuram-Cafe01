import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const loadOrdersFromDisk = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn("Failed to load orders from disk:", err.message);
  }
  return [];
};

const saveOrdersToDisk = (orders) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save orders to disk:", err.message);
  }
};

// Fallback in-memory store for orders if MongoDB is offline (initialized from disk)
const inMemoryOrders = loadOrdersFromDisk();

// Helper to format order for response
const formatOrder = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj.orderId || obj.id || obj._id,
  };
};

// POST /api/orders - Create a new order
router.post("/", async (req, res) => {
  console.log("POST /api/orders payload:", req.body);
  try {
    const {
      id,
      orderId,
      date,
      items,
      subtotal,
      deliveryCharge,
      packagingFee,
      total,
      payment,
      transactionId,
      address,
      customer,
      userMobile,
      status,
      deliveryMessage,
    } = req.body;

    const targetId = (orderId || id || Math.floor(100000 + Math.random() * 900000)).toString();
    const mobile = userMobile || customer?.mobile || "";

    const newOrderData = {
      orderId: targetId,
      id: targetId,
      date: date || new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      items: items || [],
      subtotal: Number(subtotal) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      packagingFee: Number(packagingFee) || 0,
      total: Number(total) || 0,
      payment: payment || "Cash on Delivery",
      transactionId: transactionId || null,
      address: address || "",
      customer: customer || { fullName: "", mobile: "" },
      userMobile: mobile,
      status: status || "Pending",
      deliveryMessage: deliveryMessage || "Pending Admin Confirmation",
    };

    // Save to in-memory store first
    const existingIndex = inMemoryOrders.findIndex((o) => o.id === targetId);
    if (existingIndex >= 0) {
      inMemoryOrders[existingIndex] = newOrderData;
    } else {
      inMemoryOrders.unshift(newOrderData);
    }
    saveOrdersToDisk(inMemoryOrders);

    // Try saving to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Order.findOneAndUpdate(
          { orderId: targetId },
          newOrderData,
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("MongoDB save order warning (using in-memory fallback):", dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrderData,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// GET /api/orders - Fetch all orders for Admin Panel
router.get("/", async (req, res) => {
  try {
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await Order.find({}).sort({ createdAt: -1 });
        dbOrders = docs.map(formatOrder);
      } catch (dbErr) {
        console.warn("MongoDB fetch orders warning:", dbErr.message);
      }
    }

    // Merge DB orders and inMemoryOrders with deduplication
    const map = new Map();
    [...inMemoryOrders, ...dbOrders].forEach((o) => {
      if (o && (o.id || o.orderId)) {
        const orderKey = o.orderId || o.id;
        if (!map.has(orderKey)) {
          map.set(orderKey, o);
        }
      }
    });

    const allOrders = Array.from(map.values());
    return res.json({ success: true, orders: allOrders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    return res.json({ success: true, orders: inMemoryOrders });
  }
});

// PATCH /api/orders/:id/status - Update order status (Confirm Order / Deliver Order)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryMessage } = req.body;

    // Update in-memory store
    const memOrder = inMemoryOrders.find((o) => o.id === id || o.orderId === id);
    if (memOrder) {
      if (status) memOrder.status = status;
      if (deliveryMessage) memOrder.deliveryMessage = deliveryMessage;
      saveOrdersToDisk(inMemoryOrders);
    }

    // Update MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Order.findOneAndUpdate(
          { orderId: id },
          {
            $set: {
              status,
              deliveryMessage: deliveryMessage || (status === "Confirmed" ? "Deliver in 15 to 20 minute" : status === "Delivered" ? "Order Delivered Successfully!" : "Pending Admin Confirmation"),
            },
          },
          { new: true }
        );
      } catch (dbErr) {
        console.warn("MongoDB update order status warning:", dbErr.message);
      }
    }

    return res.json({ success: true, message: "Order status updated", status });
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

// GET /api/orders/user/:mobile - Fetch orders for a specific user
router.get("/user/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await Order.find({
          $or: [{ userMobile: mobile }, { "customer.mobile": mobile }],
        }).sort({ createdAt: -1 });
        dbOrders = docs.map(formatOrder);
      } catch (dbErr) {
        console.warn("MongoDB fetch user orders warning:", dbErr.message);
      }
    }

    const memUserOrders = inMemoryOrders.filter(
      (o) => o.userMobile === mobile || o.customer?.mobile === mobile
    );

    const map = new Map();
    [...memUserOrders, ...dbOrders].forEach((o) => {
      if (o && (o.id || o.orderId)) {
        map.set(o.orderId || o.id, o);
      }
    });

    return res.json({ success: true, orders: Array.from(map.values()) });
  } catch (err) {
    console.error("Fetch user orders error:", err);
    return res.json({ success: true, orders: [] });
  }
});

export default router;
