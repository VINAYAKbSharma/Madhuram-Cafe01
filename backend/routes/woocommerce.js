import express from "express";
import dotenv from "dotenv";
import pkg from "@woocommerce/woocommerce-rest-api";

dotenv.config();

const WooCommerceRestApi = pkg.default || pkg;
const router = express.Router();

const getWooCommerceClient = () => {
  const url = process.env.WOOCOMMERCE_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (
    !url ||
    !consumerKey ||
    !consumerSecret ||
    url.includes("your-wordpress-site") ||
    consumerKey.includes("xxxxxx")
  ) {
    return null;
  }

  try {
    return new WooCommerceRestApi({
      url: url.endsWith("/") ? url.slice(0, -1) : url,
      consumerKey,
      consumerSecret,
      version: "wc/v3",
    });
  } catch (err) {
    console.error("WooCommerce client initialization error:", err.message);
    return null;
  }
};

// GET /api/woocommerce/status - Check connection status
router.get("/status", (req, res) => {
  const client = getWooCommerceClient();
  const url = process.env.WOOCOMMERCE_URL || "";
  const isConfigured = !!client;

  return res.json({
    success: true,
    connected: isConfigured,
    message: isConfigured
      ? `Connected to WooCommerce store: ${url}`
      : "WooCommerce credentials not configured in backend .env file",
    url: isConfigured ? url : null,
  });
});

// GET /api/woocommerce/products - Fetch products list from WooCommerce
router.get("/products", async (req, res) => {
  try {
    const client = getWooCommerceClient();
    if (!client) {
      return res.json({
        success: false,
        connected: false,
        message: "WooCommerce credentials not configured in backend .env file",
        products: [],
      });
    }

    const { per_page = 20, page = 1, category, search } = req.query;

    const params = {
      per_page: Number(per_page),
      page: Number(page),
    };
    if (category) params.category = category;
    if (search) params.search = search;

    const response = await client.get("products", params);

    return res.json({
      success: true,
      connected: true,
      products: response.data,
      total: response.headers["x-wp-total"] ? Number(response.headers["x-wp-total"]) : response.data.length,
      totalPages: response.headers["x-wp-totalpages"] ? Number(response.headers["x-wp-totalpages"]) : 1,
    });
  } catch (error) {
    console.error("WooCommerce fetch products error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products from WooCommerce",
      products: [],
    });
  }
});

// GET /api/woocommerce/categories - Fetch product categories from WooCommerce
router.get("/categories", async (req, res) => {
  try {
    const client = getWooCommerceClient();
    if (!client) {
      return res.json({
        success: false,
        connected: false,
        message: "WooCommerce credentials not configured",
        categories: [],
      });
    }

    const response = await client.get("products/categories", { per_page: 50 });

    return res.json({
      success: true,
      connected: true,
      categories: response.data,
    });
  } catch (error) {
    console.error("WooCommerce fetch categories error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories from WooCommerce",
      categories: [],
    });
  }
});

// POST /api/woocommerce/orders - Sync order to WooCommerce
router.post("/orders", async (req, res) => {
  try {
    const client = getWooCommerceClient();
    if (!client) {
      return res.json({
        success: false,
        connected: false,
        message: "WooCommerce credentials not configured in backend",
      });
    }

    const { customer, items, total, address, payment, transactionId } = req.body;

    const line_items = (items || []).map((item) => ({
      name: item.name,
      price: String(item.price),
      quantity: item.qty,
    }));

    const orderPayload = {
      payment_method: "online",
      payment_method_title: payment || "Madhuram Cafe Online Payment",
      set_paid: true,
      transaction_id: transactionId || "",
      billing: {
        first_name: customer?.fullName || "Valued Customer",
        phone: customer?.mobile || "",
        address_1: address || "",
      },
      shipping: {
        first_name: customer?.fullName || "Valued Customer",
        phone: customer?.mobile || "",
        address_1: address || "",
      },
      line_items,
    };

    const response = await client.post("orders", orderPayload);

    return res.json({
      success: true,
      connected: true,
      wooCommerceOrderId: response.data.id,
      order: response.data,
    });
  } catch (error) {
    console.error("WooCommerce create order error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to sync order to WooCommerce",
    });
  }
});

export default router;
