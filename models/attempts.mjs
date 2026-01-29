import pool from "./connection.mjs";

// Start a quiz attempt
export const startAttempt = async ({ quizId, userId }) => {
  const result = await pool.query(
    `INSERT INTO attempts (quiz_id, user_id, start_time)
     VALUES ($1,$2,NOW())
     RETURNING *`,
    [quizId, userId]
  );
  return result.rows[0];
};

// Submit answers
export const submitAttempt = async ({ attemptId, answers, autoScore }) => {
  const result = await pool.query(
    `UPDATE attempts
     SET answers=$1, score=$2, submitted_at=NOW()
     WHERE id=$3 RETURNING *`,
    [answers, autoScore, attemptId]
  );
  return result.rows[0];
};

// Get attempts by user
export const getAttemptsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM attempts WHERE user_id=$1 ORDER BY start_time DESC`,
    [userId]
  );
  return result.rows;
};

// Get attempts by quiz
export const getAttemptsByQuiz = async (quizId) => {
  const result = await pool.query(
    `SELECT * FROM attempts WHERE quiz_id=$1 ORDER BY submitted_at DESC`,
    [quizId]
  );
  return result.rows;
};
