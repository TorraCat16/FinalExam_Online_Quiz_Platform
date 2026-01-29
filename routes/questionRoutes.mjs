import express from "express";
import { addQuestion, listQuestions, editQuestion, removeQuestion } from "../controllers/questionController.mjs";

const router = express.Router();

// Add a question
router.post("/", addQuestion);

// Get all questions for a quiz
router.get("/:quizId", listQuestions);

// Update a question
router.put("/:id", editQuestion);

// Delete a question
router.delete("/:id", removeQuestion);

export default router;
