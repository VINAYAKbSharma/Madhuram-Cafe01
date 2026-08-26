import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const loadUsersFromDisk = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn("Failed to load users from disk:", err.message);
  }
  return [];
};

const saveUsersToDisk = (users) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save users to disk:", err.message);
  }
};

const inMemoryUsers = loadUsersFromDisk();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log("POST /api/auth/register", { body: req.body });
  try {
    const { fullName, mobile, email, password, address } = req.body;
    if (!mobile || !password) {
      console.log("Register failed: missing mobile or password");
      return res
        .status(400)
        .json({ success: false, message: "Mobile and password required" });
    }

    let existingInDb = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingInDb = await User.findOne({ mobile });
      } catch (dbErr) {
        console.warn("MongoDB find user warning:", dbErr.message);
      }
    }

    const existingInMem = inMemoryUsers.find((u) => u.mobile === mobile);
    if (existingInDb || existingInMem) {
      console.log("Register failed: mobile already registered", mobile);
      return res
        .status(409)
        .json({ success: false, message: "Mobile already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUserObj = {
      _id: Date.now().toString(),
      fullName: fullName || null,
      mobile,
      email: email || null,
      password: hash,
      address: address || {},
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUserObj);
    saveUsersToDisk(inMemoryUsers);

    if (mongoose.connection.readyState === 1) {
      try {
        await User.create({
          fullName: fullName || null,
          mobile,
          email: email || null,
          password: hash,
          address: address || {},
        });
      } catch (dbErr) {
        console.warn("MongoDB create user warning (saved to local fallback):", dbErr.message);
      }
    }

    console.log("Register successful:", { id: newUserObj._id, mobile });
    return res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res
        .status(400)
        .json({ success: false, message: "Mobile and password required" });

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ mobile });
      } catch (dbErr) {
        console.warn("MongoDB login search warning:", dbErr.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.find((u) => u.mobile === mobile);
    }

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id || user.id, mobile: user.mobile },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        mobile: user.mobile,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/auth/users — list all registered users
router.get("/users", async (req, res) => {
  try {
    let dbUsers = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await User.find({})
          .select("fullName mobile email createdAt")
          .sort({ createdAt: -1 });
        dbUsers = docs.map((doc) => (doc.toObject ? doc.toObject() : doc));
      } catch (dbErr) {
        console.warn("MongoDB fetch users warning:", dbErr.message);
      }
    }

    const map = new Map();
    [...inMemoryUsers, ...dbUsers].forEach((u) => {
      if (u && u.mobile && !map.has(u.mobile)) {
        map.set(u.mobile, {
          fullName: u.fullName,
          mobile: u.mobile,
          email: u.email,
          createdAt: u.createdAt,
        });
      }
    });

    const allUsers = Array.from(map.values());
    return res.json({ success: true, users: allUsers });
  } catch (err) {
    console.error("Fetch users error:", err);
    return res.json({ success: true, users: inMemoryUsers });
  }
});

export default router;
