import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

/**
 * Authentication Context
 * 
 * WHY USE CONTEXT FOR AUTH?
 * 1. User state needed everywhere - Navbar, protected routes, API calls
 * 2. Avoids "prop drilling" - no need to pass user through every component
 * 3. Single source of truth - one place manages login/logout
 * 4. Persistent across navigation - user stays logged in when changing pages
 * 
 * WHAT THIS PROVIDES:
 * - user: current logged-in user object or null
 * - loading: true while checking auth status
 * - login(username, password): logs in and stores user
 * - register(username, password, role): creates account and logs in
 * - logout(): clears user and redirects to login
 */

// Create the context with default values (used if no provider found)
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * Custom hook for easy access to auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provider component that wraps the app
 * Manages authentication state and provides it to all children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in (session exists)
  // Runs once on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if there's an existing session
   * This handles page refresh - user stays logged in
   */
  async function checkAuthStatus() {
    try {
      const data = await authAPI.me();
      setUser(data.user);
    } catch {
      // Not logged in or session expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Register a new user
   * On success: stores user in state and redirects based on role
   */
  async function register(username, password, role = 'student') {
    const data = await authAPI.register(username, password, role);
    setUser(data.user);
    redirectByRole(data.user.role);
    return data;
  }

  /**
   * Log in an existing user
   * On success: stores user in state and redirects based on role
   */
  async function login(username, password) {
    const data = await authAPI.login(username, password);
    setUser(data.user);
    redirectByRole(data.user.role);
    return data;
  }

  /**
   * Log out the current user
   * Clears state and redirects to login page
   */
  async function logout() {
    try {
      await authAPI.logout();
    } catch {
      // Even if server logout fails, clear local state
    }
    setUser(null);
    navigate('/login');
  }

  /**
   * Redirect user to their role-specific dashboard
   * This implements the role-based flow from requirements
   */
  function redirectByRole(role) {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'teacher':
      case 'staff': // Backend uses 'staff', requirements say 'teacher'
        navigate('/teacher');
        break;
      case 'student':
      default:
        navigate('/student');
        break;
    }
  }

  // Value object passed to all consumers
  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
