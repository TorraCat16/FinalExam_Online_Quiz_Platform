import { createQuiz, getQuizById, getVisibleQuizzes, updateQuiz, deleteQuiz } from "../models/quizzes.mjs";

export const createNewQuiz = async (req, res) => {
  const { title, description, timeLimit, attemptsAllowed, visibility } = req.body;
  const createdBy = req.session.userId;

  if (!title) return res.status(400).json({ error: "Title required" });

  try {
    const quiz = await createQuiz({ title, description, timeLimit, attemptsAllowed, visibility, createdBy });
    res.status(201).json({ message: "Quiz created", quiz });
  } catch {
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

export const listAllQuizzes = async (req, res) => {
  try {
    const quizzes = await getVisibleQuizzes();
    res.json(quizzes);
  } catch {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

export const updateExistingQuiz = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updated = await updateQuiz(id, data);
    res.json({ message: "Quiz updated", quiz: updated });
  } catch {
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

export const deleteExistingQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteQuiz(id);
    res.json({ message: "Quiz deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};
