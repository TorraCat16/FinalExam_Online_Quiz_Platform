import express from "express";
import { quizLeaderboard, quizAnalytics, userReport } from "../controllers/reportController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Leaderboard and analytics for Admin or Staff only
router.get("/leaderboard/:quizId", requireAuth, requireRole("admin", "staff"), quizLeaderboard);

router.get("/analytics/:quizId", requireAuth, requireRole("admin", "staff"), quizAnalytics);

// Viewing reports for logged-in users
router.get("/user", requireAuth, userReport);

export default router;
