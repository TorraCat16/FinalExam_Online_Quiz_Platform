import { createQuestion, getQuestionsByQuizId, updateQuestion, deleteQuestion } from "../models/questions.mjs";

export const addQuestion = async (req, res) => {
  const { quizId, text, type, options, correctAnswer } = req.body;
  if (!quizId || !text || !type) return res.status(400).json({ error: "Required fields missing" });

  try {
    const question = await createQuestion({ quizId, text, type, options, correctAnswer });
    res.status(201).json({ message: "Question added", question });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "Failed to add question" });
  }
};

export const listQuestions = async (req, res) => {
  const { quizId } = req.params;
  try {
    const questions = await getQuestionsByQuizId(quizId);
    res.json(questions);
  } catch {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

export const editQuestion = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updated = await updateQuestion(id, data);
    res.json({ message: "Question updated", question: updated });
  } catch {
    res.status(500).json({ error: "Failed to update question" });
  }
};

export const removeQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteQuestion(id);
    res.json({ message: "Question deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete question" });
  }
};
