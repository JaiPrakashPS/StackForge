import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Send token response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:       user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      createdAt: user.createdAt,
    },
  });
};

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: "First name, email and password are required." });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({ firstName, lastName: lastName || "", email, password });
    sendToken(user, 201, res);
  } catch (err) {
    console.error("Signup error:", err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(". ");
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Find user and explicitly include password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        _id:       user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};