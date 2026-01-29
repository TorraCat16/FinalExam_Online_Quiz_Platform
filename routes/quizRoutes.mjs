import express from "express";
import { createNewQuiz, listAllQuizzes, updateExistingQuiz, deleteExistingQuiz } from "../controllers/quizController.mjs";

const router = express.Router();

// Create a new quiz
router.post("/", createNewQuiz);

// List all visible quizzes
router.get("/", listAllQuizzes);

// Update a quiz
router.put("/:id", updateExistingQuiz);

// Delete a quiz
router.delete("/:id", deleteExistingQuiz);

export default router;
