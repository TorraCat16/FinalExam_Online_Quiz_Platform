import express from "express";
import { startQuizAttempt, submitQuizAttempt, getUserAttempts } from "../controllers/attemptController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Start a quiz attempt for logged-in users only
router.post("/start/:quizId", requireAuth, startQuizAttempt);

// Submit answers for logged-in users only
router.post("/submit/:attemptId", requireAuth, submitQuizAttempt);

// Get attempts by logged-in user
router.get("/", requireAuth, getUserAttempts);

export default router;
