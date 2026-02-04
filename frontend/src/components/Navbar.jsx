import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

/**
 * Navigation Bar Component
 * 
 * ROLE-BASED NAVIGATION:
 * Different roles see different menu items matching their user flow:
 * 
 * Student: View Quizzes → My Results
 * Teacher: Dashboard → Create Quiz → Analytics
 * Admin: Dashboard → Manage Users
 * 
 * WHY ROLE-BASED NAV?
 * - Users only see relevant options (less confusion)
 * - Matches the role-based flow from requirements
 * - Prevents accidental navigation to unauthorized pages
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Don't show navbar on login/register pages
  if (!user) {
    return null;
  }

  // Helper to check if link is active (for styling)
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Quiz Platform</Link>
      </div>

      <div className="navbar-menu">
        {/* Student Navigation */}
        {user.role === 'student' && (
          <>
            <Link 
              to="/student" 
              className={isActive('/student') && location.pathname === '/student' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/student/quizzes" 
              className={isActive('/student/quizzes') ? 'active' : ''}
            >
              Quizzes
            </Link>
            <Link 
              to="/student/results" 
              className={isActive('/student/results') ? 'active' : ''}
            >
              My Results
            </Link>
          </>
        )}

        {/* Teacher Navigation */}
        {(user.role === 'teacher' || user.role === 'staff') && (
          <>
            <Link 
              to="/teacher" 
              className={isActive('/teacher') && location.pathname === '/teacher' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/teacher/quizzes" 
              className={isActive('/teacher/quizzes') ? 'active' : ''}
            >
              My Quizzes
            </Link>
            <Link 
              to="/teacher/create" 
              className={isActive('/teacher/create') ? 'active' : ''}
            >
              Create Quiz
            </Link>
            <Link 
              to="/teacher/analytics" 
              className={isActive('/teacher/analytics') ? 'active' : ''}
            >
              Analytics
            </Link>
          </>
        )}

        {/* Admin Navigation */}
        {user.role === 'admin' && (
          <>
            <Link 
              to="/admin" 
              className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/users" 
              className={isActive('/admin/users') ? 'active' : ''}
            >
              Manage Users
            </Link>
            <Link 
              to="/admin/reports" 
              className={isActive('/admin/reports') ? 'active' : ''}
            >
              System Reports
            </Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          {user.username} 
          <span className="user-role">({user.role})</span>
        </span>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
