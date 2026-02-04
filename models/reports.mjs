import pool from "./connection.mjs";

// Get leaderboard for a quiz
export const getQuizLeaderboard = async (quizId) => {
  const result = await pool.query(
    `SELECT u.username, a.score
     FROM attempts a
     JOIN users u ON u.id = a.user_id
     WHERE a.quiz_id=$1
     ORDER BY a.score DESC`,
    [quizId]
  );
  return result.rows;
};

// Get quiz analytics
export const getQuizAnalytics = async (quizId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total_attempts, AVG(score) AS avg_score
     FROM attempts WHERE quiz_id=$1`,
    [quizId]
  );
  return result.rows[0];
};

// Get user report
export const getUserReport = async (userId) => {
  const result = await pool.query(
    `SELECT q.title AS quiz, a.score, a.submitted_at
     FROM attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id=$1`,
    [userId]
  );
  return result.rows;
};
