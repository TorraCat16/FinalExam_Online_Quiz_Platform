import express from "express";
import { register, login, logout, me } from "../controllers/authController.mjs";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login an existing user
router.post("/login", login);

// Logout the currently logged-in user
router.post("/logout", logout);

// Check current session (for page refresh)
router.get("/me", me);

export default router;
