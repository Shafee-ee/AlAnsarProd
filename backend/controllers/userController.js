import User from "../models/User.js";
import Article from "../models/Article.js";
import bcrypt from "bcrypt";

export const toggleSaveArticle = async (req, res) => {
    try {
        const userId = req.user.id;
        const articleId = req.params.id;

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const alreadySaved = user.savedArticles.includes(articleId);

        if (alreadySaved) {
            user.savedArticles = user.savedArticles.filter(
                (id) => id.toString() !== articleId
            );
        } else {
            user.savedArticles.push(articleId);
        }
        await user.save();
        res.json({
            message: alreadySaved
                ? "Article removed from saved list"
                : "Article saved successfully",
            savedArticles: user.savedArticles,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};


export const getSavedArticles = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("savedArticles");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.savedArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error:controller" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;//verify token
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new password are required fields" })
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // password check 

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" })
        }

        // password validaion
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            })
        }

        //hashing new password

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;

        await user.save();

        res.json({ message: "Password updated successfull" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" })
    }
};

