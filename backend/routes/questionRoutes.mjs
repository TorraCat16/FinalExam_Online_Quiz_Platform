import express from "express";
import { addQuestion, listQuestions, editQuestion, removeQuestion } from "../controllers/questionController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Add a question for admin, teacher, or staff only
router.post("/", requireAuth, requireRole("admin", "teacher", "staff"), addQuestion);

// Get all questions for a quiz for everyone
router.get("/:quizId", listQuestions);

// Update a question for admin, teacher, or staff only
router.put("/:id", requireAuth, requireRole("admin", "teacher", "staff"), editQuestion);

// Delete a question for admin, teacher, or staff only
router.delete("/:id", requireAuth, requireRole("admin", "teacher", "staff"), removeQuestion);

export default router;
