import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../api';

/**
 * Teacher Quiz List Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → [MANAGE QUIZZES] → Edit/Delete/View Questions
 * 
 * PURPOSE:
 * View and manage all quizzes created by the teacher.
 * Allows editing, deleting, and publishing quizzes.
 * 
 * FEATURES:
 * - List all quizzes
 * - Edit quiz details
 * - Delete quiz
 * - Toggle visibility (publish/unpublish)
 * - Link to manage questions
 */
export default function TeacherQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  async function toggleVisibility(quiz) {
    try {
      await quizAPI.update(quiz.id, {
        ...quiz,
        visibility: !quiz.visibility
      });
      // Refresh list
      fetchQuizzes();
    } catch (err) {
      setError('Failed to update quiz visibility');
    }
  }

  async function deleteQuiz(id) {
    try {
      await quizAPI.delete(id);
      setDeleteConfirm(null);
      fetchQuizzes();
    } catch (err) {
      setError('Failed to delete quiz');
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
        <div>
          <h1>My Quizzes</h1>
          <p>Manage your created quizzes</p>
        </div>
        <Link to="/teacher/create" className="btn btn-primary">
          + Create New Quiz
        </Link>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No Quizzes Yet</h3>
          <p>Create your first quiz to get started!</p>
          <Link to="/teacher/create" className="btn btn-primary">
            Create Quiz
          </Link>
        </div>
      ) : (
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Time Limit</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz.id}>
                  <td>
                    <div className="quiz-title-cell">
                      <strong>{quiz.title}</strong>
                      {quiz.description && (
                        <span className="quiz-desc">{quiz.description}</span>
                      )}
                    </div>
                  </td>
                  <td>{quiz.time_limit ? `${quiz.time_limit} min` : 'Unlimited'}</td>
                  <td>{quiz.attempts_allowed || 'Unlimited'}</td>
                  <td>
                    <button
                      className={`status-toggle ${quiz.visibility ? 'published' : 'draft'}`}
                      onClick={() => toggleVisibility(quiz)}
                    >
                      {quiz.visibility ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/teacher/quiz/${quiz.id}/questions`}
                        className="btn btn-secondary btn-sm"
                      >
                        Questions
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(quiz)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal card">
            <h3>Delete Quiz?</h3>
            <p>
              Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteQuiz(deleteConfirm.id)} 
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }
        
        .page-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }
        
        .quiz-title-cell {
          display: flex;
          flex-direction: column;
        }
        
        .quiz-desc {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .status-toggle {
          padding: var(--space-xs) var(--space-sm);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        
        .status-toggle.published {
          background: #dcfce7;
          color: var(--color-success);
        }
        
        .status-toggle.published:hover {
          background: #bbf7d0;
        }
        
        .status-toggle.draft {
          background: #fef3c7;
          color: var(--color-warning);
        }
        
        .status-toggle.draft:hover {
          background: #fde68a;
        }
        
        .action-buttons {
          display: flex;
          gap: var(--space-xs);
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
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          max-width: 400px;
          width: 90%;
        }
        
        .modal h3 {
          margin-bottom: var(--space-md);
        }
        
        .modal p {
          margin-bottom: var(--space-lg);
        }
        
        .modal-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
