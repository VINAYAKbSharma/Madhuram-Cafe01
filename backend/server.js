import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConnected = await connectDB();

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

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Frontend not built. Run 'npm run build' in the frontend/ directory.",
    });
  });
}

app.listen(port, () => {
  console.log(`Madhuram Cafe running at http://localhost:${port}`);
  if (!dbConnected)
    console.warn(
      "Warning: MongoDB not connected — auth endpoints will fail until DB is available."
    );
});
