import pool from "./connection.mjs";

// Create a new user
export const createUser = async (username, passwordHash, role = "student") => {
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, username, role`,
    [username, passwordHash, role]
  );
  return result.rows[0];
};

// Get user by username for login
export const getUserByUsername = async (username) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0];
};

// Get user by ID
export const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, username, role FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// List all users for Admin
export const getAllUsers = async () => {
  const result = await pool.query(`SELECT id, username, role FROM users`);
  return result.rows;
};

// Update user role
export const updateUserRole = async (id, role) => {
  const result = await pool.query(
    `UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role`,
    [role, id]
  );
  return result.rows[0];
};

// Delete user by ID with dependent cleanup to avoid FK violations
export const deleteUser = async (id) => {
  const userId = Number(id);

  // Remove attempts for this user
  await pool.query(`DELETE FROM attempts WHERE user_id = $1`, [userId]);

  // Remove attempts tied to quizzes created by this user
  await pool.query(
    `DELETE FROM attempts 
     WHERE quiz_id IN (SELECT id FROM quizzes WHERE created_by = $1)`,
    [userId]
  );

  // Remove questions for quizzes created by this user
  await pool.query(
    `DELETE FROM questions 
     WHERE quiz_id IN (SELECT id FROM quizzes WHERE created_by = $1)`,
    [userId]
  );

  // Remove quizzes created by this user
  await pool.query(`DELETE FROM quizzes WHERE created_by = $1`, [userId]);

  // Remove existing sessions for this user (stored as JSON in session table)
  await pool.query(
    `DELETE FROM session 
     WHERE sess::json -> 'user' ->> 'id' = $1`,
    [String(userId)]
  );

  // Delete the user
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  return result.rowCount;
};
