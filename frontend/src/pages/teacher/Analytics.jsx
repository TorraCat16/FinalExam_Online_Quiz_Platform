import { useState, useEffect } from 'react';
import { quizAPI, reportAPI } from '../../api';

/**
 * Teacher Analytics Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → Create quiz → Add questions → Publish → [MONITOR/ANALYTICS]
 * 
 * PURPOSE:
 * View quiz performance analytics and leaderboards.
 * Helps teachers understand how students are performing.
 * 
 * FEATURES:
 * - Select a quiz to view analytics
 * - See total attempts, average score
 * - View leaderboard (rankings)
 * 
 * DATA SOURCES:
 * - reportAPI.getAnalytics(quizId) - GET /api/reports/analytics/:quizId
 * - reportAPI.getLeaderboard(quizId) - GET /api/reports/leaderboard/:quizId
 */
export default function TeacherAnalytics() {
  // Quiz selection
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const data = await quizAPI.getAll();
      setQuizzes(data);
      
      // Auto-select first quiz if available
      if (data.length > 0) {
        selectQuiz(data[0]);
      }
    } catch (err) {
      setError('Failed to load quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function selectQuiz(quiz) {
    setSelectedQuiz(quiz);
    setLoadingAnalytics(true);
    setError('');

    try {
      const [analyticsData, leaderboardData] = await Promise.all([
        reportAPI.getAnalytics(quiz.id),
        reportAPI.getLeaderboard(quiz.id)
      ]);
      
      setAnalytics(analyticsData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="page-header">
        <h1>Quiz Analytics</h1>
        <p>View performance data and student rankings</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No Quizzes Available</h3>
          <p>Create a quiz first to see analytics.</p>
        </div>
      ) : (
        <div className="analytics-layout">
          {/* Quiz Selector */}
          <aside className="quiz-selector card">
            <h2>Select Quiz</h2>
            <div className="quiz-list">
              {quizzes.map(quiz => (
                <button
                  key={quiz.id}
                  className={`quiz-item ${selectedQuiz?.id === quiz.id ? 'active' : ''}`}
                  onClick={() => selectQuiz(quiz)}
                >
                  <span className="quiz-name">{quiz.title}</span>
                  <span className={`badge ${quiz.visibility ? 'badge-success' : 'badge-warning'}`}>
                    {quiz.visibility ? 'Published' : 'Draft'}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Analytics Content */}
          <main className="analytics-content">
            {loadingAnalytics ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
              </div>
            ) : selectedQuiz ? (
              <>
                <h2>{selectedQuiz.title}</h2>
                
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">
                      {analytics?.total_attempts || 0}
                    </div>
                    <div className="stat-label">Total Attempts</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {analytics?.avg_score 
                        ? `${Math.round(analytics.avg_score)}%` 
                        : 'N/A'}
                    </div>
                    <div className="stat-label">Average Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {leaderboard.length}
                    </div>
                    <div className="stat-label">Students Attempted</div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="card leaderboard-section">
                  <h3>Leaderboard</h3>
                  
                  {leaderboard.length === 0 ? (
                    <p className="no-data">No attempts yet for this quiz.</p>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Student</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((entry, index) => (
                            <tr key={index} className={index < 3 ? 'top-three' : ''}>
                              <td>
                                <span className={`rank rank-${index + 1}`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </span>
                              </td>
                              <td className="student-name">{entry.username}</td>
                              <td>
                                <span className={`score ${entry.score >= 70 ? 'passing' : 'failing'}`}>
                                  {entry.score}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p>Select a quiz to view analytics</p>
            )}
          </main>
        </div>
      )}

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
        
        .analytics-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-lg);
        }
        
        .quiz-selector h2 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-md);
        }
        
        .quiz-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .quiz-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }
        
        .quiz-item:hover {
          border-color: var(--color-primary-light);
        }
        
        .quiz-item.active {
          border-color: var(--color-primary);
          background: #eff6ff;
        }
        
        .quiz-name {
          font-weight: 500;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .analytics-content {
          min-height: 400px;
        }
        
        .analytics-content h2 {
          margin-bottom: var(--space-lg);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
        
        .leaderboard-section h3 {
          margin-bottom: var(--space-md);
        }
        
        .no-data {
          color: var(--color-text-light);
          text-align: center;
          padding: var(--space-xl);
        }
        
        .rank {
          font-weight: 700;
          font-size: var(--font-size-lg);
        }
        
        .student-name {
          font-weight: 500;
        }
        
        .score {
          font-weight: 600;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--border-radius);
        }
        
        .score.passing {
          background: #dcfce7;
          color: var(--color-success);
        }
        
        .score.failing {
          background: #fee2e2;
          color: var(--color-error);
        }
        
        .top-three {
          background: #fefce8;
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-2xl);
          background: var(--color-bg);
          border-radius: var(--border-radius-lg);
        }
        
        @media (max-width: 768px) {
          .analytics-layout {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
