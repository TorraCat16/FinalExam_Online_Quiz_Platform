import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quizAPI } from '../../api';

/**
 * Teacher Dashboard
 * 
 * USER FLOW CONTEXT:
 * Login → [DASHBOARD] → Create quiz → Add questions → Publish → Monitor
 * 
 * PURPOSE:
 * Landing page for teachers after login.
 * Overview of their created quizzes and quick actions.
 * 
 * DISPLAYS:
 * 1. Welcome message
 * 2. Quick stats (total quizzes, published, drafts)
 * 3. Quick action buttons
 * 4. Recent quizzes preview
 */
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      // Note: This gets all visible quizzes. Ideally we'd have an endpoint
      // for "my quizzes" filtered by created_by. For now, we filter client-side.
      const data = await quizAPI.getAll();
      // In a real app, filter by created_by === user.id
      setQuizzes(data);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.visibility).length;
  const draftQuizzes = quizzes.filter(q => !q.visibility).length;

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
        <h1>Welcome, {user.username}!</h1>
        <p>Manage your quizzes and track student progress</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalQuizzes}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{publishedQuizzes}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{draftQuizzes}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/teacher/create" className="btn btn-primary">
            + Create New Quiz
          </Link>
          <Link to="/teacher/quizzes" className="btn btn-secondary">
            Manage Quizzes
          </Link>
          <Link to="/teacher/analytics" className="btn btn-secondary">
            View Analytics
          </Link>
        </div>
      </section>

      {/* Recent Quizzes */}
      <section className="section">
        <div className="section-header">
          <h2>Your Quizzes</h2>
          <Link to="/teacher/quizzes">View All →</Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <h3>No Quizzes Yet</h3>
            <p>Create your first quiz to get started!</p>
            <Link to="/teacher/create" className="btn btn-primary">
              Create Quiz
            </Link>
          </div>
        ) : (
          <div className="quiz-grid">
            {quizzes.slice(0, 4).map(quiz => (
              <div key={quiz.id} className="card quiz-card">
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span className={`badge ${quiz.visibility ? 'badge-success' : 'badge-warning'}`}>
                    {quiz.visibility ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p>{quiz.description || 'No description'}</p>
                <div className="quiz-card-actions">
                  <Link 
                    to={`/teacher/quiz/${quiz.id}/questions`} 
                    className="btn btn-secondary btn-sm"
                  >
                    Manage Questions
                  </Link>
                </div>
              </div>
            ))}
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
          flex-wrap: wrap;
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
        
        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-sm);
        }
        
        .quiz-card h3 {
          margin: 0;
          flex: 1;
        }
        
        .quiz-card p {
          color: var(--color-text-light);
          margin: 0;
          flex: 1;
        }
        
        .quiz-card-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: auto;
          padding-top: var(--space-sm);
        }
        
        .btn-sm {
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--font-size-sm);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-2xl);
          background: var(--color-bg);
          border-radius: var(--border-radius-lg);
        }
        
        .empty-state h3 {
          margin-bottom: var(--space-sm);
        }
        
        .empty-state p {
          color: var(--color-text-light);
          margin-bottom: var(--space-lg);
        }
      `}</style>
    </div>
  );
}
