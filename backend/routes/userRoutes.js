import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { changePassword } from "../controllers/userController.js";

const router = express.Router();

router.put("/change-password", verifyToken, changePassword);

export default router;