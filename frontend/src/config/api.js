// Centralized API configuration supporting VITE_API_URL environment variable with fallback to live Render backend
const rawUrl = import.meta.env.VITE_API_URL || "https://madhuram-cafe01-1.onrender.com";
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
