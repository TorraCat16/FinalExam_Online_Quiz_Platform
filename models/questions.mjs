import pool from "./connection.mjs";

// Add a question to a quiz
export const createQuestion = async ({ quizId, text, type, options, correctAnswer }) => {
  const result = await pool.query(
    `INSERT INTO questions (quiz_id, text, type, options, correct_answer)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [quizId, text, type, options, correctAnswer]
  );
  return result.rows[0];
};

// Get all questions for a quiz
export const getQuestionsByQuizId = async (quizId) => {
  const result = await pool.query(
    `SELECT * FROM questions WHERE quiz_id = $1`,
    [quizId]
  );
  return result.rows;
};

// Update a question
export const updateQuestion = async (id, data) => {
  const { text, type, options, correctAnswer } = data;
  const result = await pool.query(
    `UPDATE questions SET text=$1, type=$2, options=$3, correct_answer=$4
     WHERE id=$5 RETURNING *`,
    [text, type, options, correctAnswer, id]
  );
  return result.rows[0];
};

// Delete a question
export const deleteQuestion = async (id) => {
  await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
};
