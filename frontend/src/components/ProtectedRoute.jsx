import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * 
 * PURPOSE:
 * Guards routes that require authentication and/or specific roles.
 * Redirects unauthorized users appropriately.
 * 
 * HOW IT WORKS:
 * 1. Checks if user is logged in
 * 2. If roles specified, checks if user's role is allowed
 * 3. Renders children if authorized, redirects if not
 * 
 * USAGE:
 * <ProtectedRoute>                     // Just requires login
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute roles={['admin']}>   // Requires admin role
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute roles={['teacher', 'staff']}>  // Multiple roles allowed
 *   <QuizManager />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth status
  // Prevents flash of login page for authenticated users
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in - redirect to login
  // Save current location so we can redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role - redirect to their dashboard
  // This prevents students from accessing teacher routes, etc.
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on their actual role
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  // Authorized - render the protected content
  return children;
}

/**
 * Get the dashboard path for a given role
 * Centralized to avoid duplication
 */
function getDashboardPath(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
    case 'staff':
      return '/teacher';
    case 'student':
    default:
      return '/student';
  }
}
