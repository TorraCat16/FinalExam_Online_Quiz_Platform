import express from "express";
import { quizLeaderboard, quizAnalytics, userReport, userReportCSV, userReportPDF } from "../controllers/reportController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Leaderboard and analytics for Admin, Teacher, or Staff only
router.get("/leaderboard/:quizId", requireAuth, requireRole("admin", "teacher", "staff"), quizLeaderboard);

router.get("/analytics/:quizId", requireAuth, requireRole("admin", "teacher", "staff"), quizAnalytics);

// Viewing reports for logged-in users
router.get("/user", requireAuth, userReport);

// Exporting quiz results for logged-in users
router.get("/user/export/csv", requireAuth, userReportCSV);
router.get("/user/export/pdf", requireAuth, userReportPDF);

export default router;
