import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quizAPI, attemptAPI } from '../../api';

/**
 * Student Dashboard
 * 
 * PURPOSE:
 * Landing page for students after login.
 * Provides overview of available quizzes and recent activity.
 * 
 * USER FLOW CONTEXT:
 * Login → [DASHBOARD] → View quizzes → Start quiz → Submit → View score
 * 
 * DISPLAYS:
 * 1. Welcome message with student name
 * 2. Quick stats (quizzes taken, average score)
 * 3. Available quizzes preview (links to full list)
 * 4. Recent attempts with scores
 * 
 * WHY A DASHBOARD?
 * - Single entry point after login
 * - Quick overview without clicking through menus
 * - Most common actions one click away
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Data state
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch both in parallel for faster loading
      const [quizzesData, attemptsData] = await Promise.all([
        quizAPI.getAll(),
        attemptAPI.getMine()
      ]);
      
      setQuizzes(quizzesData);
      setAttempts(attemptsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.submitted_at);
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <header className="dashboard-header">
        <h1>Welcome back, {user.username}!</h1>
        <p>Ready to test your knowledge?</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{quizzes.length}</div>
          <div className="stat-label">Available Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalAttempts}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/student/quizzes" className="btn btn-primary">
            Browse Quizzes
          </Link>
          <Link to="/student/results" className="btn btn-secondary">
            View All Results
          </Link>
        </div>
      </section>

      {/* Available Quizzes Preview */}
      <section className="section">
        <div className="section-header">
          <h2>Available Quizzes</h2>
          <Link to="/student/quizzes">View All →</Link>
        </div>
        
        {quizzes.length === 0 ? (
          <p className="empty-state">No quizzes available yet. Check back later!</p>
        ) : (
          <div className="quiz-grid">
            {quizzes.slice(0, 3).map(quiz => (
              <div key={quiz.id} className="card quiz-card">
                <h3>{quiz.title}</h3>
                <p>{quiz.description || 'No description'}</p>
                <div className="quiz-meta">
                  {quiz.time_limit && (
                    <span className="badge badge-primary">
                      {quiz.time_limit} min
                    </span>
                  )}
                  {quiz.attempts_allowed && (
                    <span className="badge badge-warning">
                      {quiz.attempts_allowed} attempts
                    </span>
                  )}
                </div>
                <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary">
                  Start Quiz
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Attempts */}
      <section className="section">
        <div className="section-header">
          <h2>Recent Results</h2>
          <Link to="/student/results">View All →</Link>
        </div>
        
        {completedAttempts.length === 0 ? (
          <p className="empty-state">No completed quizzes yet. Start one now!</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {completedAttempts.slice(0, 5).map(attempt => (
                  <tr key={attempt.id}>
                    <td>Quiz #{attempt.quiz_id}</td>
                    <td>
                      <span className={`badge ${attempt.score >= 70 ? 'badge-success' : 'badge-error'}`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td>{new Date(attempt.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .dashboard-header {
          margin-bottom: var(--space-xl);
        }
        
        .dashboard-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .dashboard-header p {
          color: var(--color-text-light);
          margin-bottom: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }
        
        .stat-card {
          background: white;
          padding: var(--space-lg);
          border-radius: var(--border-radius-lg);
          text-align: center;
          border: 1px solid var(--color-border);
        }
        
        .stat-value {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .stat-label {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        .quick-actions {
          margin-bottom: var(--space-xl);
        }
        
        .quick-actions h2 {
          margin-bottom: var(--space-md);
        }
        
        .action-buttons {
          display: flex;
          gap: var(--space-md);
        }
        
        .section {
          margin-bottom: var(--space-xl);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }
        
        .section-header h2 {
          margin: 0;
        }
        
        .quiz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-md);
        }
        
        .quiz-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .quiz-card h3 {
          margin: 0;
        }
        
        .quiz-card p {
          color: var(--color-text-light);
          margin: 0;
          flex: 1;
        }
        
        .quiz-meta {
          display: flex;
          gap: var(--space-sm);
        }
        
        .empty-state {
          color: var(--color-text-light);
          text-align: center;
          padding: var(--space-xl);
          background: var(--color-bg);
          border-radius: var(--border-radius);
        }
      `}</style>
    </div>
  );
}
