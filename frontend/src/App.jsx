import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages (public)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import QuizList from './pages/student/QuizList';
import TakeQuiz from './pages/student/TakeQuiz';
import StudentResults from './pages/student/Results';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherQuizzes from './pages/teacher/QuizList';
import CreateQuiz from './pages/teacher/CreateQuiz';
import ManageQuestions from './pages/teacher/ManageQuestions';
import TeacherAnalytics from './pages/teacher/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemReports from './pages/admin/SystemReports';

/**
 * App Component - Application Root
 * 
 * ROUTING STRUCTURE:
 * Routes are organized by user role to match the required user flows:
 * 
 * PUBLIC ROUTES (no auth required):
 * - /login          → Login page
 * - /register       → Registration page
 * 
 * STUDENT ROUTES (role: student):
 * - /student        → Dashboard (overview)
 * - /student/quizzes → Browse available quizzes
 * - /student/quiz/:id → Take a specific quiz
 * - /student/results → View scores and history
 * 
 * TEACHER ROUTES (role: teacher/staff):
 * - /teacher        → Dashboard (overview)
 * - /teacher/quizzes → Manage created quizzes
 * - /teacher/create → Create new quiz
 * - /teacher/quiz/:id/questions → Manage quiz questions
 * - /teacher/analytics → View quiz analytics
 * 
 * ADMIN ROUTES (role: admin):
 * - /admin          → Dashboard (system overview)
 * - /admin/users    → Manage users and roles
 * - /admin/reports  → System-wide reports
 * 
 * WHY THIS STRUCTURE?
 * 1. Clear URL hierarchy - /role/feature pattern
 * 2. Role isolation - student can't accidentally reach /teacher
 * 3. RESTful feel - /student/quiz/:id is intuitive
 * 4. Matches user flows from requirements exactly
 */
export default function App() {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Quiz Platform...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================================
          PUBLIC ROUTES - No authentication required
          ============================================ */}
      
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />

      {/* ============================================
          ROOT REDIRECT - Send to appropriate dashboard
          ============================================ */}
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        } 
      />

      {/* ============================================
          STUDENT ROUTES
          Flow: View quizzes → Start quiz → Submit → View score
          ============================================ */}
      
      <Route 
        path="/student" 
        element={
          <ProtectedRoute roles={['student']}>
            <Layout><StudentDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/quizzes" 
        element={
          <ProtectedRoute roles={['student']}>
            <Layout><QuizList /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/quiz/:quizId" 
        element={
          <ProtectedRoute roles={['student']}>
            <Layout><TakeQuiz /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/results" 
        element={
          <ProtectedRoute roles={['student']}>
            <Layout><StudentResults /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* ============================================
          TEACHER ROUTES
          Flow: Create quiz → Add questions → Publish → Monitor
          ============================================ */}
      
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute roles={['teacher', 'staff']}>
            <Layout><TeacherDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/quizzes" 
        element={
          <ProtectedRoute roles={['teacher', 'staff']}>
            <Layout><TeacherQuizzes /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/create" 
        element={
          <ProtectedRoute roles={['teacher', 'staff']}>
            <Layout><CreateQuiz /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/quiz/:quizId/questions" 
        element={
          <ProtectedRoute roles={['teacher', 'staff']}>
            <Layout><ManageQuestions /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/analytics" 
        element={
          <ProtectedRoute roles={['teacher', 'staff']}>
            <Layout><TeacherAnalytics /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* ============================================
          ADMIN ROUTES
          Flow: Manage users → Assign roles → View reports
          ============================================ */}
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout><ManageUsers /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout><SystemReports /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* ============================================
          404 - Page not found
          ============================================ */}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Redirects root path to appropriate dashboard based on role
 */
function RootRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
    case 'staff':
      return <Navigate to="/teacher" replace />;
    case 'student':
    default:
      return <Navigate to="/student" replace />;
  }
}

/**
 * 404 Page component
 */
function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/">Go to Home</a>
    </div>
  );
}
