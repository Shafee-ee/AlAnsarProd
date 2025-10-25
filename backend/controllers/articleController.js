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
// Update Article
export const updateArticle = async (req, res) => {
    try {
        // 🚀 FIX: Destructure ALL fields expected, including 'language', 'question' (replacing excerpt), and 'isFeatured'.
        const {
            title,
            author,
            date,
            category,
            question, // Replaced 'excerpt' with 'question'
            content,
            isFeatured,
            language  // Added 'language'
        } = req.body;

        // Find the article first
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });

        // --- Update fields if they are present in the request body ---
        // We use 'if (field !== undefined)' because fields from the form are always sent, 
        // but it's good practice.

        if (title !== undefined) article.title = title;
        if (author !== undefined) article.author = author;
        if (date !== undefined) article.date = date;
        if (category !== undefined) article.category = category;
        if (content !== undefined) article.content = content;

        // Handle the 'question' field
        if (question !== undefined) article.question = question;

        // 🚀 FIX: Correctly handle the 'language' string
        if (language !== undefined) article.language = language;

        // 🚀 FIX: Correctly handle the 'isFeatured' boolean
        // The React form sends 'true' or 'false' as a clean boolean, so we assign it directly.
        // Your old logic (isFeatured === "true") was for traditional form data.
        if (isFeatured !== undefined) {
            article.isFeatured = isFeatured;
        }

        // Handle file/image
        if (req.file) article.image = `/uploads/${req.file.filename}`;

        // Save the changes
        const updatedArticle = await article.save();
        res.status(200).json(updatedArticle);

    } catch (err) {
        console.error("Error updating article:", err);
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
