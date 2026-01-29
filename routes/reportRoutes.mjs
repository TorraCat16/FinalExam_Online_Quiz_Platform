import express from "express";
import { quizLeaderboard, quizAnalytics, userReport } from "../controllers/reportController.mjs";

const router = express.Router();

// Leaderboard for a quiz
router.get("/leaderboard/:quizId", quizLeaderboard);

// Analytics for a quiz
router.get("/analytics/:quizId", quizAnalytics);

// Report for logged-in user
router.get("/user", userReport);

export default router;
