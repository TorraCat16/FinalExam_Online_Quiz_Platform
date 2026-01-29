import { startAttempt, submitAttempt, getAttemptsByUser } from "../models/attempts.mjs";

export const startQuizAttempt = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.session.userId;

  try {
    const attempt = await startAttempt({ quizId, userId });
    res.status(201).json({ message: "Attempt started", attempt });
  } catch {
    res.status(500).json({ error: "Failed to start attempt" });
  }
};

export const submitQuizAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { answers, autoScore } = req.body;

  try {
    const attempt = await submitAttempt({ attemptId, answers, autoScore });
    res.json({ message: "Quiz submitted", attempt });
  } catch {
    res.status(500).json({ error: "Failed to submit attempt" });
  }
};

export const getUserAttempts = async (req, res) => {
  const userId = req.session.userId;

  try {
    const attempts = await getAttemptsByUser(userId);
    res.json(attempts);
  } catch {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
};
