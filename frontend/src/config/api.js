// Centralized API configuration supporting VITE_API_URL environment variable
const rawUrl = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
