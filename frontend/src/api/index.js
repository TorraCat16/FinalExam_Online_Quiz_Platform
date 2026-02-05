/**
 * API Service Layer
 * 
 * WHY SEPARATE API CALLS?
 * 1. Single source of truth - all endpoints defined in one place
 * 2. Easy to update - if backend URL changes, update here only
 * 3. Consistent error handling - all requests handled the same way
 * 4. Testable - can mock this module for testing components
 * 5. Clean components - components don't need to know fetch details
 */

const API_BASE = '/api'; // Proxied to http://localhost:5000 by Vite

/**
 * Generic fetch wrapper with error handling
 * - Automatically includes credentials (cookies for session)
 * - Parses JSON response
 * - Throws meaningful errors
 */
async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // IMPORTANT: Send cookies for session auth
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (networkError) {
    // Network error (server not running, CORS, etc.)
    console.error('Network error:', networkError);
    throw new Error('Cannot connect to server. Please check if the backend is running.');
  }
  
  // Parse response body
  const data = await response.json().catch(() => ({}));

  // If response is not OK (4xx, 5xx), throw error with server message
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Register a new user
   * @param {string} username 
   * @param {string} password 
   * @param {string} role - 'student' | 'teacher' | 'admin'
   */
  register: (username, password, role = 'student') =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),

  /**
   * Login existing user
   * Creates session cookie automatically
   */
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Logout current user
   * Destroys session on server
   */
  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  /**
   * Check if user is logged in (session exists)
   * Used on page refresh to restore auth state
   */
  me: () =>
    request('/auth/me'),
};

// ============================================
// QUIZ API
// ============================================

export const quizAPI = {
  /**
   * Get all visible quizzes
   * Used by students to see available quizzes
   */
  getAll: () => request('/quizzes'),

  /**
   * Create a new quiz (Teacher/Admin only)
   */
  create: (quizData) =>
    request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  /**
   * Update a quiz (Teacher/Admin only)
   */
  update: (id, quizData) =>
    request(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    }),

  /**
   * Delete a quiz (Teacher/Admin only)
   */
  delete: (id) =>
    request(`/quizzes/${id}`, { method: 'DELETE' }),
};

// ============================================
// QUESTION API
// ============================================

export const questionAPI = {
  /**
   * Get all questions for a quiz
   */
  getByQuizId: (quizId) => request(`/questions/${quizId}`),

  /**
   * Add a question to a quiz (Teacher/Admin only)
   */
  create: (questionData) =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),

  /**
   * Update a question (Teacher/Admin only)
   */
  update: (id, questionData) =>
    request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    }),

  /**
   * Delete a question (Teacher/Admin only)
   */
  delete: (id) =>
    request(`/questions/${id}`, { method: 'DELETE' }),
};

// ============================================
// ATTEMPT API
// ============================================

export const attemptAPI = {
  /**
   * Start a quiz attempt
   * Creates a new attempt record with start_time
   */
  start: (quizId) =>
    request(`/attempts/start/${quizId}`, { method: 'POST' }),

  /**
   * Submit quiz answers
   * @param {number} attemptId 
   * @param {object} answers - { questionId: answer, ... }
   * @param {number} autoScore - calculated score (NOTE: should be server-side!)
   */
  submit: (attemptId, answers, autoScore) =>
    request(`/attempts/submit/${attemptId}`, {
      method: 'POST',
      body: JSON.stringify({ answers, autoScore }),
    }),

  /**
   * Get current user's attempts
   */
  getMine: () => request('/attempts'),

  /**
   * Get all attempts for a quiz (Teacher only)
   * For grading and reviewing student submissions
   */
  getByQuizId: (quizId) => request(`/attempts/quiz/${quizId}`),

  /**
   * Get single attempt details (Teacher only)
   */
  getById: (attemptId) => request(`/attempts/${attemptId}`),

  /**
   * Update score manually (Teacher only)
   * @param {number} attemptId 
   * @param {number} score - the new score
   */
  grade: (attemptId, score) =>
    request(`/attempts/${attemptId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    }),
};

// ============================================
// REPORT API
// ============================================

export const reportAPI = {
  /**
   * Get leaderboard for a quiz (Teacher/Admin only)
   */
  getLeaderboard: (quizId) => request(`/reports/leaderboard/${quizId}`),

  /**
   * Get analytics for a quiz (Teacher/Admin only)
   */
  getAnalytics: (quizId) => request(`/reports/analytics/${quizId}`),

  /**
   * Get current user's report
   */
  getUserReport: () => request('/reports/user'),
};

// ============================================
// USER API (Admin only)
// ============================================

export const userAPI = {
  /**
   * Get all users
   */
  getAll: () => request('/users'),

  /**
   * Update a user's role
   */
  updateRole: (id, role) =>
    request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  /**
   * Delete a user (Admin only)
   * Used by the ManageUsers page for user deletion.
   */
  delete: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
};
