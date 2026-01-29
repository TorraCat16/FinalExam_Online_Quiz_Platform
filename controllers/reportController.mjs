import { getQuizLeaderboard, getQuizAnalytics, getUserReport } from "../models/reports.mjs";

export const quizLeaderboard = async (req, res) => {
  const { quizId } = req.params;
  try {
    const leaderboard = await getQuizLeaderboard(quizId);
    res.json(leaderboard);
  } catch {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const quizAnalytics = async (req, res) => {
  const { quizId } = req.params;
  try {
    const analytics = await getQuizAnalytics(quizId);
    res.json(analytics);
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export const userReport = async (req, res) => {
  const userId = req.session.userId;
  try {
    const report = await getUserReport(userId);
    res.json(report);
  } catch {
    res.status(500).json({ error: "Failed to fetch user report" });
  }
};
