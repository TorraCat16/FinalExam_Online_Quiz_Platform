import express from "express";
import { addQuestion, listQuestions, editQuestion, removeQuestion } from "../controllers/questionController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// Add a question for admin or staff only
router.post("/", requireAuth, requireRole("admin", "staff"), addQuestion);

// Get all questions for a quiz for everyone
router.get("/:quizId", listQuestions);

// Update a question for admin or staff only
router.put("/:id", requireAuth, requireRole("admin", "staff"), editQuestion);

// Delete a question for admin or staff only
router.delete("/:id", requireAuth, requireRole("admin", "staff"), removeQuestion);

export default router;
