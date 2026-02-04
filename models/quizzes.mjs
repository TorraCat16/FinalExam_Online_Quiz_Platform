import pool from "./connection.mjs";

// Create a quiz
export const createQuiz = async ({ title, description, timeLimit, attemptsAllowed, visibility, createdBy }) => {
  const result = await pool.query(
    `INSERT INTO quizzes (title, description, time_limit, attempts_allowed, visibility, created_by)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [title, description, timeLimit, attemptsAllowed, visibility, createdBy]
  );
  return result.rows[0];
};

// Get quiz by ID
export const getQuizById = async (id) => {
  const result = await pool.query(`SELECT * FROM quizzes WHERE id = $1`, [id]);
  return result.rows[0];
};

// List all visible quizzes
export const getVisibleQuizzes = async () => {
  const result = await pool.query(`SELECT * FROM quizzes WHERE visibility = true`);
  return result.rows;
};

// Update quiz
export const updateQuiz = async (id, data) => {
  const { title, description, timeLimit, attemptsAllowed, visibility } = data;
  const result = await pool.query(
    `UPDATE quizzes
     SET title=$1, description=$2, time_limit=$3, attempts_allowed=$4, visibility=$5
     WHERE id=$6 RETURNING *`,
    [title, description, timeLimit, attemptsAllowed, visibility, id]
  );
  return result.rows[0];
};

// Delete quiz
export const deleteQuiz = async (id) => {
  await pool.query(`DELETE FROM quizzes WHERE id = $1`, [id]);
};
