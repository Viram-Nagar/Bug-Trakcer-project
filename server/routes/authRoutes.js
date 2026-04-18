import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes — no token needed
router.post("/register", register);
router.post("/login", login);

// Private route — token required
router.get("/me", authMiddleware, getMe);

export default router;
