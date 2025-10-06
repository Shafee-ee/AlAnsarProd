// ------------------- authController.js start -------------------

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PasswordReset from "../models/PasswordReset.js";
import crypto from "crypto";

// REGISTER
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// VERIFY TOKEN
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Bearer token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// REQUEST PASSWORD RESET
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If that email exists, a reset link was sent." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await PasswordReset.create({ userId: user._id, token, expiresAt });

        // For now, return token in response for testing
        res.json({ message: "Reset token created", token });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// PERFORM PASSWORD RESET
export const performPasswordReset = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const record = await PasswordReset.findOne({ token });
        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(record.userId, { password: hashed });
        await PasswordReset.deleteOne({ _id: record._id });

        res.json({ message: "Password successfully updated" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ------------------- authController.js end -------------------
