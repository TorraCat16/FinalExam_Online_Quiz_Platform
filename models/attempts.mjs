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
  // Convert answers object to JSON string for PostgreSQL
  const answersJson = typeof answers === 'object' ? JSON.stringify(answers) : answers;
  
  const result = await pool.query(
    `UPDATE attempts
     SET answers=$1, score=$2, submitted_at=NOW()
     WHERE id=$3 RETURNING *`,
    [answersJson, autoScore, attemptId]
  );
  return result.rows[0];
};

// Get attempts by user with total questions for proper percentage calculation
// Only shows SUBMITTED attempts (not started-but-abandoned ones)
export const getAttemptsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT 
       a.*,
       (SELECT COUNT(*) FROM questions WHERE quiz_id = a.quiz_id) AS total_questions
     FROM attempts a 
     WHERE a.user_id = $1 
       AND a.submitted_at IS NOT NULL
     ORDER BY a.submitted_at DESC`,
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
      a.quiz_id,
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

// Get attempts for a quiz with user details (for teacher grading)
export const getQuizAttemptsWithUsers = async (quizId) => {
  const result = await pool.query(
    `
    SELECT 
      a.id,
      a.quiz_id,
      a.user_id,
      a.start_time,
      a.submitted_at,
      a.answers,
      a.score,
      u.username
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.quiz_id = $1 AND a.submitted_at IS NOT NULL
    ORDER BY a.submitted_at DESC
    `,
    [quizId]
  );
  return result.rows;
};

// Get single attempt with full details (for grading)
export const getAttemptDetails = async (attemptId) => {
  const result = await pool.query(
    `
    SELECT 
      a.*,
      u.username,
      q.title as quiz_title
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE a.id = $1
    `,
    [attemptId]
  );
  return result.rows[0];
};

// Update score manually (for teacher grading)
export const updateAttemptScore = async (attemptId, score) => {
  const result = await pool.query(
    `
    UPDATE attempts 
    SET score = $1
    WHERE id = $2 
    RETURNING *
    `,
    [score, attemptId]
  );
  return result.rows[0];
};