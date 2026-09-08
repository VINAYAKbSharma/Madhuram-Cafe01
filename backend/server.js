import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import paymentRouter from "./routes/payment.js";
import woocommerceRouter from "./routes/woocommerce.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/woocommerce", woocommerceRouter);
app.use("/api", paymentRouter);




const distPath = path.resolve(__dirname, "../frontend/dist");
const rootDistPath = path.resolve(process.cwd(), "frontend/dist");

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully",
  });
});

// Catch-all for API endpoints that don't match any route, returning JSON 404 instead of HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Serve static files from frontend build (checking both distPath & rootDistPath)
app.use(express.static(distPath));
app.use(express.static(rootDistPath));
app.use("/assets", express.static(path.join(distPath, "assets")));
app.use("/assets", express.static(path.join(rootDistPath, "assets")));

// Never return index.html for missing JS/CSS/image files (prevents browser MIME type errors)
app.get(/\.(js|css|json|map|png|jpg|jpeg|svg|ico|jfif|mpeg)$/i, (req, res) => {
  res.status(404).type("text/plain").send("Asset not found");
});

// Fallback all unknown GET routes to frontend SPA index.html
app.get("*", (req, res) => {
  const indexPath = fs.existsSync(path.join(distPath, "index.html"))
    ? path.join(distPath, "index.html")
    : path.join(rootDistPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: "Frontend not built. Run 'npm run build' in the frontend/ directory.",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Madhuram Cafe running at http://0.0.0.0:${port}`);
  connectDB().then((dbConnected) => {
    if (!dbConnected) {
      console.warn(
        "Warning: MongoDB not connected — auth endpoints will fail until DB is available."
      );
    }
  });
});
