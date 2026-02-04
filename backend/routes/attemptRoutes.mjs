import express from "express";
import { startQuizAttempt, submitQuizAttempt, getUserAttempts, 
  getQuizAttempts, getAttemptById, gradeAttempt } from "../controllers/attemptController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Start a quiz attempt for logged-in users only
router.post("/start/:quizId", requireAuth, startQuizAttempt);

// Submit answers for logged-in users only
router.post("/submit/:attemptId", requireAuth, submitQuizAttempt);

// Get attempts by logged-in user
router.get("/", requireAuth, getUserAttempts);

// Teacher routes for grading
// Get all attempts for a specific quiz (teacher only)
router.get("/quiz/:quizId", requireAuth, requireRole("admin", "teacher", "staff"), getQuizAttempts);

// Get single attempt details (teacher only)
router.get("/:attemptId", requireAuth, requireRole("admin", "teacher", "staff"), getAttemptById);

// Manual grading - update score (teacher only)
router.put("/:attemptId/grade", requireAuth, requireRole("admin", "teacher", "staff"), gradeAttempt);

export default router;
