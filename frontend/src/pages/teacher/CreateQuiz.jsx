import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../api';

/**
 * Create Quiz Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → [CREATE QUIZ] → Add questions → Publish
 * 
 * PURPOSE:
 * Create a new quiz with all its settings.
 * After creation, redirects to question management.
 * 
 * QUIZ SETTINGS (from requirements):
 * - Title: Quiz name
 * - Description: What the quiz is about
 * - Time Limit: Minutes allowed (optional)
 * - Attempts Allowed: How many times student can try (optional)
 * - Visibility: Published (visible to students) or Draft
 * 
 * WHY REDIRECT TO QUESTIONS AFTER CREATE?
 * - Matches natural flow: create quiz → add questions
 * - Quiz without questions is useless
 * - Keeps user in "creation" mindset
 */
export default function CreateQuiz() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: '',
    attemptsAllowed: '',
    visibility: false  // Start as draft
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle input changes
   */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  /**
   * Prevent non-integer characters in number inputs
   * Blocks: e, E, +, -, . (only allows digits)
   */
  function handleNumberKeyDown(e) {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    setLoading(true);

    try {
      // Prepare data - convert empty strings to null for optional fields
      const quizData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        attemptsAllowed: formData.attemptsAllowed ? parseInt(formData.attemptsAllowed) : null,
        visibility: formData.visibility
      };

      const result = await quizAPI.create(quizData);
      
      // Redirect to add questions
      navigate(`/teacher/quiz/${result.quiz.id}/questions`, {
        state: { newQuiz: true, quizTitle: formData.title }
      });
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-quiz-page">
      <header className="page-header">
        <h1>Create New Quiz</h1>
        <p>Set up your quiz details, then add questions</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card quiz-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Quiz Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g., Introduction to JavaScript"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Briefly describe what this quiz covers..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
          </div>
        </section>

        {/* Quiz Settings */}
        <section className="form-section">
          <h2>Quiz Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="timeLimit">
                Time Limit (minutes)
              </label>
              <input
                id="timeLimit"
                name="timeLimit"
                type="number"
                className="form-input"
                placeholder="Leave empty for unlimited"
                value={formData.timeLimit}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                disabled={loading}
                min="1"
              />
              <span className="form-hint">Leave empty for no time limit</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="attemptsAllowed">
                Attempts Allowed
              </label>
              <input
                id="attemptsAllowed"
                name="attemptsAllowed"
                type="number"
                className="form-input"
                placeholder="Leave empty for unlimited"
                value={formData.attemptsAllowed}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                disabled={loading}
                min="1"
              />
              <span className="form-hint">Leave empty for unlimited attempts</span>
            </div>
          </div>
        </section>

        {/* Visibility */}
        <section className="form-section">
          <h2>Visibility</h2>
          
          <div className="visibility-toggle">
            <label className={`visibility-option ${!formData.visibility ? 'selected' : ''}`}>
              <input
                type="radio"
                name="visibility"
                checked={!formData.visibility}
                onChange={() => setFormData(prev => ({ ...prev, visibility: false }))}
                disabled={loading}
              />
              <div className="option-content">
                <span className="option-title">Draft</span>
                <span className="option-desc">Only you can see this quiz. Publish when ready.</span>
              </div>
            </label>
            
            <label className={`visibility-option ${formData.visibility ? 'selected' : ''}`}>
              <input
                type="radio"
                name="visibility"
                checked={formData.visibility}
                onChange={() => setFormData(prev => ({ ...prev, visibility: true }))}
                disabled={loading}
              />
              <div className="option-content">
                <span className="option-title">Published</span>
                <span className="option-desc">Students can see and take this quiz immediately.</span>
              </div>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/teacher/quizzes')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Quiz & Add Questions'}
          </button>
        </div>
      </form>

      <style>{`
        .create-quiz-page {
          max-width: 700px;
          margin: 0 auto;
        }
        
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
        
        .quiz-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }
        
        .form-section h2 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--color-border);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }
        
        .form-textarea {
          width: 100%;
          resize: vertical;
          min-height: 80px;
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          font-size: var(--font-size-base);
          font-family: inherit;
          transition: border-color var(--transition-fast);
          box-sizing: border-box;
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .form-input {
          width: 100%;
          box-sizing: border-box;
        }
        
        .form-hint {
          display: block;
          margin-top: var(--space-xs);
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .visibility-toggle {
          display: flex;
          gap: var(--space-md);
        }
        
        .visibility-option {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-md);
          border: 2px solid var(--color-border);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .visibility-option:hover {
          border-color: var(--color-primary-light);
        }
        
        .visibility-option.selected {
          border-color: var(--color-primary);
          background: #eff6ff;
        }
        
        .visibility-option input {
          margin-top: 4px;
        }
        
        .option-content {
          display: flex;
          flex-direction: column;
        }
        
        .option-title {
          font-weight: 600;
        }
        
        .option-desc {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-border);
        }
        
        @media (max-width: 600px) {
          .visibility-toggle {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
