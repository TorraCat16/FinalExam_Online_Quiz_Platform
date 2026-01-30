import express from "express";
import { createNewQuiz, listAllQuizzes, updateExistingQuiz, deleteExistingQuiz } from "../controllers/quizController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Create, update, or delete quizzes for admins or staff only
router.post("/", requireAuth, requireRole("admin", "staff"), createNewQuiz);

router.put("/:id", requireAuth, requireRole("admin", "staff"), updateExistingQuiz);

router.delete("/:id", requireAuth, requireRole("admin", "staff"), deleteExistingQuiz);

// List all visible quizzes for everyone
router.get("/", listAllQuizzes);

export default router;
