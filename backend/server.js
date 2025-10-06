// server.js
import path from "path";
import { verifyToken } from "./controllers/authController.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import articleRoutes from "./routes/articleRoutes.js"


dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


//auth
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes)

// Test route
app.get("/", (req, res) => {
    res.send("AlAnsarWeekly backend is running ✅");
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("PORT:", PORT);
console.log("MONGO_URI:", MONGO_URI ? "Loaded ✅" : "Missing ❌");


mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.on("connecting", () => console.log("⏳ MongoDB connecting..."));
mongoose.connection.on("connected", () => console.log("🔗 MongoDB connected event"));
mongoose.connection.on("error", (err) => console.log("⚠️ MongoDB error:", err.message));
mongoose.connection.on("disconnected", () => console.log("❌ MongoDB disconnected"));
