import express from "express";
import multer from "multer";
import { verifyToken } from "../controllers/authController.js";
import User from "../models/User.js";
import Article from "../models/Article.js";
import { getArticles, addArticle, updateArticle, getFeaturedArticles } from "../controllers/articleController.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Public route → anyone can see articles
router.get("/", getArticles);

// Protected route → only admin can add
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user?.isAdmin) {
            return res.status(403).json({ message: "Access Denied" });
        }

        await addArticle(req, res);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Protected route → only admin can update
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user?.isAdmin) {
            return res.status(403).json({ message: "Access Denied" });
        }

        await updateArticle(req, res);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// get featured Articles

router.get("/featured", async (req, res) => {
    try {
        const featuredArticles = await Article.find({ isFeatured: true })
            .sort({ date: -1 })//latest first
            .limit(10);// limits how many featured articles it pulls

        res.json(featuredArticles);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error: route" })
    }
})

router.delete("/:id", verifyToken, async (req, res) => {
    console.log("Delete /api/articles/:id hit");
    console.log("req.user:", req.user);
    console.log("req.params.id:", req.params.id);
    try {
        const article = await Article.findByIdAndDelete({ _id: req.params.id });

        if (!article) {
            return res.status(404).json({ message: "Articel not found" });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router;
