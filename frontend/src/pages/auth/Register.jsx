import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

/**
 * Register Page
 * 
 * USER FLOW (from requirements):
 * Student: REGISTER → Login → View quizzes → Start quiz → Submit → View score
 * 
 * FUNCTIONALITY:
 * 1. User enters username, password, and selects role
 * 2. On submit, calls authAPI.register via AuthContext
 * 3. On success, automatically logs in and redirects to dashboard
 * 4. On error, displays error message
 * 
 * ROLE SELECTION:
 * - Student (default): Can take quizzes and view scores
 * - Teacher: Can create quizzes, add questions, view analytics
 * - Admin option hidden - admins are created by system/existing admin
 * 
 * WHY HIDE ADMIN ROLE?
 * - Security: Anyone registering as admin would be a security hole
 * - Real-world: Admins are appointed, not self-registered
 */
export default function Register() {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth context
  const { register } = useAuth();

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Register and auto-login
      // AuthContext handles redirect based on role
      await register(username, password, role);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the quiz platform today</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">
              I am a...
            </label>
            <div className="role-selector">
              <label className={`role-option ${role === 'student' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                />
                Student
              </label>
              <label className={`role-option ${role === 'teacher' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                />
                Teacher
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
