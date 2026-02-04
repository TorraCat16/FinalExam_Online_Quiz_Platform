import { useState, useEffect } from 'react';
import { userAPI, quizAPI, reportAPI } from '../../api';

/**
 * System Reports Page (Admin)
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → Manage users → Assign roles → [VIEW SYSTEM REPORTS]
 * 
 * PURPOSE:
 * View platform-wide statistics and reports.
 * Provides oversight of the entire system.
 * 
 * DISPLAYS:
 * - Total users by role
 * - Total quizzes (published vs draft)
 * - Quiz analytics overview
 * - Top performing quizzes
 * 
 * NOTE:
 * Backend doesn't have a dedicated system reports endpoint,
 * so we aggregate data from existing endpoints.
 */
export default function SystemReports() {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const [usersData, quizzesData] = await Promise.all([
        userAPI.getAll(),
        quizAPI.getAll()
      ]);

      setUsers(usersData);
      setQuizzes(quizzesData);

      // Fetch analytics for each quiz
      const analyticsPromises = quizzesData.map(async (quiz) => {
        try {
          const analytics = await reportAPI.getAnalytics(quiz.id);
          return { ...quiz, analytics };
        } catch {
          return { ...quiz, analytics: null };
        }
      });

      const quizzesWithAnalytics = await Promise.all(analyticsPromises);
      setQuizAnalytics(quizzesWithAnalytics);

    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate user stats
  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher' || u.role === 'staff').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  // Calculate quiz stats
  const quizStats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.visibility).length,
    draft: quizzes.filter(q => !q.visibility).length,
  };

  // Calculate overall attempt stats
  const totalAttempts = quizAnalytics.reduce((sum, q) => 
    sum + (parseInt(q.analytics?.total_attempts) || 0), 0
  );

  // Sort quizzes by attempts for "most popular"
  const popularQuizzes = [...quizAnalytics]
    .filter(q => q.analytics?.total_attempts > 0)
    .sort((a, b) => (b.analytics?.total_attempts || 0) - (a.analytics?.total_attempts || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="system-reports-page">
      <header className="page-header">
        <h1>System Reports</h1>
        <p>Platform-wide statistics and analytics</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Key Metrics */}
      <section className="metrics-section">
        <h2>Key Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <div className="metric-value">{userStats.total}</div>
              <div className="metric-label">Total Users</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">{quizStats.total}</div>
              <div className="metric-label">Total Quizzes</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-value">{totalAttempts}</div>
              <div className="metric-label">Total Attempts</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-value">{quizStats.published}</div>
              <div className="metric-label">Published Quizzes</div>
            </div>
          </div>
        </div>
      </section>

      {/* User Breakdown */}
      <section className="card report-section">
        <h2>User Breakdown</h2>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill students" 
                style={{ width: userStats.total ? `${(userStats.students / userStats.total) * 100}%` : '0%' }}
              />
            </div>
            <div className="breakdown-info">
              <span className="breakdown-label">Students</span>
              <span className="breakdown-value">{userStats.students}</span>
              <span className="breakdown-percent">
                ({userStats.total ? Math.round((userStats.students / userStats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill teachers" 
                style={{ width: userStats.total ? `${(userStats.teachers / userStats.total) * 100}%` : '0%' }}
              />
            </div>
            <div className="breakdown-info">
              <span className="breakdown-label">Teachers</span>
              <span className="breakdown-value">{userStats.teachers}</span>
              <span className="breakdown-percent">
                ({userStats.total ? Math.round((userStats.teachers / userStats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill admins" 
                style={{ width: userStats.total ? `${(userStats.admins / userStats.total) * 100}%` : '0%' }}
              />
            </div>
            <div className="breakdown-info">
              <span className="breakdown-label">Admins</span>
              <span className="breakdown-value">{userStats.admins}</span>
              <span className="breakdown-percent">
                ({userStats.total ? Math.round((userStats.admins / userStats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Stats */}
      <section className="card report-section">
        <h2>Quiz Statistics</h2>
        <div className="quiz-stats-grid">
          <div className="quiz-stat">
            <span className="quiz-stat-value published">{quizStats.published}</span>
            <span className="quiz-stat-label">Published</span>
          </div>
          <div className="quiz-stat">
            <span className="quiz-stat-value draft">{quizStats.draft}</span>
            <span className="quiz-stat-label">Draft</span>
          </div>
        </div>
      </section>

      {/* Popular Quizzes */}
      <section className="card report-section">
        <h2>Most Popular Quizzes</h2>
        {popularQuizzes.length === 0 ? (
          <p className="no-data">No quiz attempts recorded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {popularQuizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td className="quiz-name">{quiz.title}</td>
                    <td>{quiz.analytics?.total_attempts || 0}</td>
                    <td>
                      {quiz.analytics?.avg_score 
                        ? `${Math.round(quiz.analytics.avg_score)}%`
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <span className={`badge ${quiz.visibility ? 'badge-success' : 'badge-warning'}`}>
                        {quiz.visibility ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .page-header {
          margin-bottom: var(--space-xl);
        }
        
        .page-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }
        
        .metrics-section {
          margin-bottom: var(--space-xl);
        }
        
        .metrics-section h2 {
          margin-bottom: var(--space-md);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }
        
        .metric-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: white;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--color-border);
        }
        
        .metric-icon {
          font-size: 2rem;
        }
        
        .metric-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .metric-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .report-section {
          margin-bottom: var(--space-xl);
        }
        
        .report-section h2 {
          margin-bottom: var(--space-lg);
        }
        
        .breakdown-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        
        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .breakdown-bar {
          height: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .breakdown-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .breakdown-fill.students { background: var(--color-success); }
        .breakdown-fill.teachers { background: var(--color-primary); }
        .breakdown-fill.admins { background: var(--color-error); }
        
        .breakdown-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--font-size-sm);
        }
        
        .breakdown-label {
          font-weight: 500;
        }
        
        .breakdown-value {
          color: var(--color-text);
          font-weight: 600;
        }
        
        .breakdown-percent {
          color: var(--color-text-light);
        }
        
        .quiz-stats-grid {
          display: flex;
          gap: var(--space-xl);
        }
        
        .quiz-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .quiz-stat-value {
          font-size: var(--font-size-3xl);
          font-weight: 700;
        }
        
        .quiz-stat-value.published { color: var(--color-success); }
        .quiz-stat-value.draft { color: var(--color-warning); }
        
        .quiz-stat-label {
          color: var(--color-text-light);
        }
        
        .quiz-name {
          font-weight: 500;
        }
        
        .no-data {
          color: var(--color-text-light);
          text-align: center;
          padding: var(--space-xl);
        }
      `}</style>
    </div>
  );
}
