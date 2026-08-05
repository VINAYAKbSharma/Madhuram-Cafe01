import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

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

    const existing = await User.findOne({ mobile });
    if (existing) {
      console.log("Register failed: mobile already registered", mobile);
      return res
        .status(409)
        .json({ success: false, message: "Mobile already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName || null,
      mobile,
      email: email || null,
      password: hash,
      address: address || {},
    });

    console.log("Register successful:", { id: user._id, mobile });
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

    const user = await User.findOne({ mobile });
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
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
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
    const users = await User.find({})
      .select("fullName mobile email createdAt")
      .sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (err) {
    console.error("Fetch users error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
