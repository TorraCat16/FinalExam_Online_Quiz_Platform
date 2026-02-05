import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { reportAPI } from '../../api';

/**
 * Student Results Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → View quizzes → Start quiz → Submit → [VIEW SCORE]
 * 
 * PURPOSE:
 * Display all quiz results and scores for the student.
 * Shows history of all attempts with scores.
 * 
 * FEATURES:
 * - Success message when redirected from quiz submission
 * - List of all attempts with scores and dates
 * - Score visual indicator (pass/fail colors)
 * - Export results (CSV / PDF)
 * 
 * DATA SOURCE:
 * Uses reportAPI.getUserReport() which calls GET /api/reports/user
 */
export default function StudentResults() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user just completed a quiz (passed via navigation state)
  const justCompleted = location.state?.justCompleted;
  const recentScore = location.state?.score;
  const recentTotalQuestions = location.state?.totalQuestions;
  const recentQuizTitle = location.state?.quizTitle;

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const data = await reportAPI.getUserReport();
      setResults(data);
    } catch (err) {
      setError('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const totalAttempts = results.length;
  const totalScored = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const totalPossible = results.reduce(
    (sum, r) => sum + (parseInt(r.total_questions) || 0),
    0
  );
  const averageScore =
    totalPossible > 0
      ? Math.round((totalScored / totalPossible) * 100)
      : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="results-page">
      <header className="page-header">
        <h1>My Results</h1>
        <p>View your quiz scores and history</p>
      </header>

      {/* Success Message */}
      {justCompleted && (
        <div className="alert alert-success completion-alert">
          <h3>Quiz Completed!</h3>
          <p>
            You scored{' '}
            <strong>
              {recentScore}
              {recentTotalQuestions ? ` / ${recentTotalQuestions}` : ''}
            </strong>{' '}
            on "{recentQuizTitle}"
          </p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{totalAttempts}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalScored} / {totalPossible}
          </div>
          <div className="stat-label">Total Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{averageScore}%</div>
          <div className="stat-label">Average</div>
        </div>
      </section>

      {/* Export Buttons */}
      {results.length > 0 && (
        <div className="export-actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              (window.location.href = '/api/reports/user/export/csv')
            }
          >
            Export CSV
          </button>

          <button
            className="btn btn-secondary"
            onClick={() =>
              (window.location.href = '/api/reports/user/export/pdf')
            }
          >
            Export PDF
          </button>
        </div>
      )}

      {/* Results Table */}
      <section className="results-section">
        <h2>Quiz History</h2>

        {results.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Yet</h3>
            <p>You haven't completed any quizzes yet.</p>
            <Link to="/student/quizzes" className="btn btn-primary">
              Take a Quiz
            </Link>
          </div>
        ) : (
          <div className="table-container card">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td className="quiz-name">
                      {result.quiz || `Quiz #${index + 1}`}
                    </td>
                    <td>
                      <span className="score-display">
                        {result.score !== null
                          ? `${result.score} / ${
                              result.total_questions || '?'
                            }`
                          : 'N/A'}
                      </span>
                    </td>
                    <td>
                      {result.score !== null ? (
                        <span className="badge badge-success">
                          Completed
                        </span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td className="date-cell">
                      {result.submitted_at
                        ? new Date(
                            result.submitted_at
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Not submitted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CTA */}
      {results.length > 0 && (
        <div className="cta-section">
          <Link to="/student/quizzes" className="btn btn-primary">
            Take Another Quiz
          </Link>
        </div>
      )}

      <style>{`
        .page-header {
          margin-bottom: var(--space-xl);
        }

        .completion-alert {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
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

        .export-actions {
          display: flex;
          gap: var(--space-sm);
          justify-content: flex-end;
          margin-bottom: var(--space-lg);
        }

        .export-actions .btn {
          font-size: var(--font-size-sm);
        }

        .quiz-name {
          font-weight: 500;
        }

        .score-display {
          font-weight: 600;
        }

        .date-cell {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }

        .cta-section {
          text-align: center;
          margin-top: var(--space-xl);
        }
      `}</style>
    </div>
  );
}
