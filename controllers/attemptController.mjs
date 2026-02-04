import { startAttempt, submitAttempt, getAttemptsByUser, getAttemptWithQuizLimit, 
  countAttemptsByUser, getQuizAttemptsAllowed, getQuizAttemptsWithUsers, 
  getAttemptDetails, updateAttemptScore } from "../models/attempts.mjs";
import { getQuestionsByQuizId } from "../models/questions.mjs";

export const startQuizAttempt = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.session.user.id;

  try {
    const quiz = await getQuizAttemptsAllowed(quizId); // Limit the attempts of user
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const attemptsAllowed = quiz.attempts_allowed;

    // Fixed: use correct function name (was countAttemptsByUserForQuiz)
    const attemptCount = await countAttemptsByUser(userId, quizId);

    if (attemptsAllowed && attemptCount >= attemptsAllowed) {
      return res.status(403).json({
        error: "Maximum number of attempts reached for this quiz"
      });
    }

    const attempt = await startAttempt({ quizId, userId });
    res.status(201).json({ message: "Attempt started", attempt });
  } catch (err) {
    console.error("Start attempt error:", err);
    res.status(500).json({ error: "Failed to start attempt" });
  }
};

export const submitQuizAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body;
  const userId = req.session.user.id;

  try {
    const attemptInfo = await getAttemptWithQuizLimit(attemptId); // Enforce time limit before grading

    if (!attemptInfo) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    const { start_time, time_limit, quiz_id } = attemptInfo;

    // Only check time limit if one is set
    if (time_limit) {
      const now = new Date();
      const startTime = new Date(start_time);
      const elapsedMinutes = (now - startTime) / (1000 * 60);

      if (elapsedMinutes > time_limit) {
        return res.status(403).json({
          error: "Time limit exceeded. Quiz submission not allowed."
        });
      }
    }

    const questions = await getQuestionsByQuizId(quiz_id); // Auto-grade the attempt based on correct answers

    let score = 0;
    for (let q of questions) {
    const userAnswer = answers[q.id];

    if (Array.isArray(userAnswer) && Array.isArray(q.correct_answer)) {
      const sortedUser = [...userAnswer].sort();
      const sortedCorrect = [...q.correct_answer].sort();
      if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
        score += q.points || 1;
      }
    } else {
      if (JSON.stringify(userAnswer) === JSON.stringify(q.correct_answer)) {
        score += q.points || 1;
      }
    }
  }

    const attempt = await submitAttempt({ attemptId, answers, autoScore: score });
    res.json({ message: "Quiz submitted", attempt });
  } catch (err) {
    console.error("Submit attempt error:", err);
    res.status(500).json({ error: "Failed to submit attempt" });
  }
};

export const getUserAttempts = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const attempts = await getAttemptsByUser(userId);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
};

// Get all attempts for a quiz (for teacher grading)
export const getQuizAttempts = async (req, res) => {
  const { quizId } = req.params;

  try {
    const attempts = await getQuizAttemptsWithUsers(quizId);
    res.json(attempts);
  } catch (err) {
    console.error("Get quiz attempts error:", err);
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
};

// Get single attempt details (for teacher grading view)
export const getAttemptById = async (req, res) => {
  const { attemptId } = req.params;

  try {
    const attempt = await getAttemptDetails(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }
    res.json(attempt);
  } catch (err) {
    console.error("Get attempt details error:", err);
    res.status(500).json({ error: "Failed to fetch attempt" });
  }
};

// Manual grading - update score
export const gradeAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { score } = req.body;

  try {
    if (score === undefined || score === null) {
      return res.status(400).json({ error: "Score is required" });
    }

    const attempt = await updateAttemptScore(attemptId, score, true);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }
    res.json({ message: "Grade updated successfully", attempt });
  } catch (err) {
    console.error("Grade attempt error:", err);
    res.status(500).json({ error: "Failed to update grade" });
  }
};
