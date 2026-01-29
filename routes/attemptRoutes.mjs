import express from "express";
import { startQuizAttempt, submitQuizAttempt, getUserAttempts } from "../controllers/attemptController.mjs";

const router = express.Router();

// Start a quiz attempt
router.post("/start/:quizId", startQuizAttempt);

// Submit answers
router.post("/submit/:attemptId", submitQuizAttempt);

// Get attempts by logged-in user
router.get("/", getUserAttempts);

export default router;
