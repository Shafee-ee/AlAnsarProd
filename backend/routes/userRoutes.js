import express from "express";
import { verifyToken } from "../controllers/authController.js";

//old import
import { changePassword, toggleSaveArticle, getSavedArticles } from "../controllers/userController.js";

const router = express.Router();

// to change password
router.put("/change-password", verifyToken, changePassword);

//to save article
router.put("/saveArticle/:id", verifyToken, toggleSaveArticle);

//get all saved article
router.get("/savedArticles", verifyToken, getSavedArticles)

export default router;


