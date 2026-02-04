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

// Get attempt details with quiz time limit
export const getAttemptWithQuizLimit = async (attemptId) => {
  const result = await pool.query(
    `
    SELECT 
      a.start_time,
      q.time_limit
    FROM attempts a
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE a.id = $1
    `,
    [attemptId]
  );

  return result.rows[0];
};

// Count attempts a user made on quiz
export const countAttemptsByUser = async (userId, quizId) => {
  const result = await pool.query(
    `
    SELECT COUNT(*) 
    FROM attempts
    WHERE user_id = $1 AND quiz_id = $2
    `,
    [userId, quizId]
  );

  return Number(result.rows[0].count);
};

// Get allowed attempts for a quiz
export const getQuizAttemptsAllowed = async (quizId) => {
  const result = await pool.query(
    `
    SELECT attempts_allowed
    FROM quizzes
    WHERE id = $1
    `,
    [quizId]
  );

  return result.rows[0];
};