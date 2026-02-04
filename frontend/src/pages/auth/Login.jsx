import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

/**
 * Login Page
 * 
 * USER FLOW (from requirements):
 * Student: Register → LOGIN → View quizzes → ...
 * Teacher: LOGIN → Create quiz → ...
 * Admin: (created by system) → LOGIN → Manage users → ...
 * 
 * FUNCTIONALITY:
 * 1. User enters username and password
 * 2. On submit, calls authAPI.login via AuthContext
 * 3. On success, AuthContext redirects to role-specific dashboard
 * 4. On error, displays error message
 * 
 * WHY CONTROLLED INPUTS?
 * - React "owns" the form state
 * - Easy validation before submit
 * - Can show real-time feedback
 * - Prevents uncontrolled input warnings
 */
export default function Login() {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth context for login function
  const { login } = useAuth();

  /**
   * Handle form submission
   * Validates inputs, calls login, handles errors
   */
  async function handleSubmit(e) {
    // Prevent default form submission (page reload)
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call login from AuthContext
      // On success, AuthContext handles redirect
      await login(username, password);
    } catch (err) {
      // Display error message from server or generic message
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your quiz platform account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer with register link */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
