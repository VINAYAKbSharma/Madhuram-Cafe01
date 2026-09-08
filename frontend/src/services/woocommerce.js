import { API_BASE_URL } from "../config/api";

/**
  * WooCommerce API Integration Service
  */

// Check WooCommerce connection status
export const checkWooCommerceStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/woocommerce/status`);
    if (!res.ok) return { connected: false, message: "WooCommerce API offline" };
    return await res.json();
  } catch (err) {
    return { connected: false, message: err.message };
  }
};

// Fetch products list from WooCommerce REST API
export const fetchWooCommerceProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/woocommerce/products?${query}`);
    if (!res.ok) return { success: false, products: [] };
    return await res.json();
  } catch (err) {
    console.error("WooCommerce products fetch error:", err);
    return { success: false, products: [] };
  }
};

// Fetch product categories from WooCommerce
export const fetchWooCommerceCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/woocommerce/categories`);
    if (!res.ok) return { success: false, categories: [] };
    return await res.json();
  } catch (err) {
    console.error("WooCommerce categories fetch error:", err);
    return { success: false, categories: [] };
  }
};

// Sync order to WooCommerce store
export const syncOrderToWooCommerce = async (orderData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/woocommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) return { success: false, message: "Order sync failed" };
    return await res.json();
  } catch (err) {
    console.error("WooCommerce order sync error:", err);
    return { success: false, message: err.message };
  }
};
