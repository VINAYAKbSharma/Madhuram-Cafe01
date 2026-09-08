// Centralized API configuration supporting VITE_API_URL environment variable
// Auto-detects local backend (http://localhost:3001) when running locally,
// relative origin on Vercel deployment, and fallback to Render
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3001";
    }
    // On Vercel or production origin
    if (hostname.includes("vercel.app") || hostname.includes("madhuram")) {
      return origin;
    }
  }
  return "https://madhuram-cafe01-1.onrender.com";
};

const rawUrl = getApiBaseUrl();
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
