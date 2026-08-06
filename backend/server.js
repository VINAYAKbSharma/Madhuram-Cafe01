import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
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

const distPath = path.join(__dirname, "../frontend/dist");

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully",
  });
});

// Serve static files from frontend build
app.use(express.static(distPath));

// Fallback all unknown GET routes to frontend SPA index.html
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: "Frontend not built. Run 'npm run build' in the frontend/ directory.",
    });
  }
});

app.listen(port, () => {
  console.log(`Madhuram Cafe running at http://localhost:${port}`);
  connectDB().then((dbConnected) => {
    if (!dbConnected) {
      console.warn(
        "Warning: MongoDB not connected — auth endpoints will fail until DB is available."
      );
    }
  });
});
