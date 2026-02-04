import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../api';

/**
 * Student Quiz List Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → [VIEW QUIZZES] → Start quiz → Submit → View score
 * 
 * PURPOSE:
 * Browse all available quizzes and select one to take.
 * 
 * DISPLAYS:
 * - All visible quizzes (visibility = true from backend)
 * - Quiz details: title, description, time limit, attempts allowed
 * - "Start Quiz" button for each
 * 
 * WHY SEPARATE FROM DASHBOARD?
 * - Dashboard shows preview (3 quizzes)
 * - This page shows ALL quizzes
 * - Can add filtering/search here later
 */
export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const data = await quizAPI.getAll();
      setQuizzes(data);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quiz-list-page">
      <header className="page-header">
        <h1>Available Quizzes</h1>
        <p>Select a quiz to test your knowledge</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No Quizzes Available</h3>
          <p>There are no quizzes available right now. Check back later!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card quiz-card">
              <div className="quiz-card-content">
                <h3>{quiz.title}</h3>
                <p className="quiz-description">
                  {quiz.description || 'No description available'}
                </p>
                
                <div className="quiz-details">
                  {quiz.time_limit ? (
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <span>{quiz.time_limit} minutes</span>
                    </div>
                  ) : (
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <span>No time limit</span>
                    </div>
                  )}
                  
                  {quiz.attempts_allowed ? (
                    <div className="detail-item">
                      <span className="detail-icon">🔄</span>
                      <span>{quiz.attempts_allowed} attempt(s) allowed</span>
                    </div>
                  ) : (
                    <div className="detail-item">
                      <span className="detail-icon">🔄</span>
                      <span>Unlimited attempts</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="quiz-card-footer">
                <Link 
                  to={`/student/quiz/${quiz.id}`} 
                  className="btn btn-primary"
                >
                  Start Quiz
                </Link>
              </div>
            </div>
          ))}
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
        
        .quiz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }
        
        .quiz-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .quiz-card-content {
          flex: 1;
        }
        
        .quiz-card h3 {
          margin: 0 0 var(--space-sm) 0;
          font-size: var(--font-size-xl);
        }
        
        .quiz-description {
          color: var(--color-text-light);
          margin-bottom: var(--space-md);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .quiz-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          margin-bottom: var(--space-md);
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .detail-icon {
          font-size: 1rem;
        }
        
        .quiz-card-footer {
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-border);
        }
        
        .quiz-card-footer .btn {
          width: 100%;
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
          margin: 0;
        }
      `}</style>
    </div>
  );
}
