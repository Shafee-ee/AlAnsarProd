import Article from "../models/Article.js";

// Add Article
export const addArticle = async (req, res) => {
    const { title, author, date, category, excerpt, content, isFeatured } = req.body;

    const newArticle = new Article({
        title,
        author,
        date,
        category,
        excerpt,
        content,
        image: req.file ? `/uploads/${req.file.filename}` : "",
        isFeatured: isFeatured === "true" ? true : false,
    });

    try {
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Article
export const updateArticle = async (req, res) => {
    try {
        const { title, author, date, category, excerpt, content, isFeatured } = req.body;

        // Find the article first
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });

        // Update fields
        article.title = title || article.title;
        article.author = author || article.author;
        article.date = date || article.date;
        article.category = category || article.category;
        article.excerpt = excerpt || article.excerpt;
        article.content = content || article.content;
        if (req.file) article.image = `/uploads/${req.file.filename}`;

        // Handle featured toggle
        if (typeof isFeatured !== "undefined") {
            article.isFeatured = isFeatured === "true" ? true : false;
        }

        const updatedArticle = await article.save();
        res.status(200).json(updatedArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all articles
export const getArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ date: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get featured articles
export const getFeaturedArticles = async (req, res) => {
    try {
        const featuredArticles = await Article.find({ isFeatured: true })
            .sort({ date: -1 })
            .limit(10);
        res.json(featuredArticles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
