import express from "express";
import multer from "multer";
import { verifyToken } from "../controllers/authController.js";
import User from "../models/User.js";
import Article from "../models/Article.js";
import { getArticles, addArticle, updateArticle, getFeaturedArticles } from "../controllers/articleController.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Admin middleware
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user?.isAdmin) return res.status(403).json({ message: "Access Denied" });
        next();
    } catch {
        res.status(500).json({ message: "Server Error" });
    }
};

// Public routes
router.get("/", getArticles);
router.get("/featured", async (req, res) => {
    try {
        if (typeof getFeaturedArticles === "function") {
            return getFeaturedArticles(req, res);
        }

        const featuredArticles = await Article.find({ isFeatured: true })
            .sort({ date: -1 })
            .limit(10);
        res.json(featuredArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });
        res.json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Protected routes → admin only
router.post("/", verifyToken, adminOnly, upload.single("image"), addArticle);
router.put("/:id", verifyToken, adminOnly, upload.single("image"), updateArticle);
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
