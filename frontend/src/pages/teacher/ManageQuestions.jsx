import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { questionAPI, quizAPI } from '../../api';

/**
 * Manage Questions Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → Create quiz → [ADD QUESTIONS] → Publish
 * 
 * PURPOSE:
 * Add, edit, and delete questions for a specific quiz.
 * 
 * QUESTION TYPES SUPPORTED:
 * - MCQ (Multiple Choice): Multiple options, one correct answer
 * - True/False: Two options (True/False)
 * - Short Answer: Text input (for manual grading)
 * 
 * FEATURES:
 * - Add new questions
 * - Edit existing questions
 * - Delete questions
 * - Reorder questions (future enhancement)
 */
export default function ManageQuestions() {
  const { quizId } = useParams();
  const location = useLocation();
  
  // Data state
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  // Check if we just created this quiz
  const isNewQuiz = location.state?.newQuiz;

  useEffect(() => {
    fetchData();
  }, [quizId]);

  async function fetchData() {
    try {
      const [quizzes, questionsData] = await Promise.all([
        quizAPI.getAll(),
        questionAPI.getByQuizId(quizId)
      ]);
      
      const quizData = quizzes.find(q => q.id === parseInt(quizId));
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    setFormData({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
    setEditingQuestion(null);
    setShowForm(false);
  }

  /**
   * Open form for editing a question
   */
  function startEdit(question) {
    setFormData({
      text: question.text,
      type: question.type || 'mcq',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correct_answer || ''
    });
    setEditingQuestion(question);
    setShowForm(true);
  }

  /**
   * Handle form input changes
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  /**
   * Handle option text changes
   */
  function handleOptionChange(index, value) {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  }

  /**
   * Add another option
   */
  function addOption() {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  }

  /**
   * Remove an option
   */
  function removeOption(index) {
    if (formData.options.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer === prev.options[index] ? '' : prev.correctAnswer
    }));
  }

  /**
   * Submit question form
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.text.trim()) {
      setError('Question text is required');
      return;
    }

    if (formData.type === 'mcq') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        return;
      }
      if (!formData.correctAnswer) {
        setError('Please select the correct answer');
        return;
      }
    }

    try {
      const questionData = {
        quizId: parseInt(quizId),
        text: formData.text.trim(),
        type: formData.type,
        options: formData.type === 'mcq' 
          ? formData.options.filter(opt => opt.trim())
          : formData.type === 'truefalse'
            ? ['True', 'False']
            : null,
        correctAnswer: formData.correctAnswer || null
      };

      if (editingQuestion) {
        await questionAPI.update(editingQuestion.id, questionData);
      } else {
        await questionAPI.create(questionData);
      }

      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save question');
    }
  }

  /**
   * Delete a question
   */
  async function deleteQuestion(id) {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await questionAPI.delete(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete question');
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="manage-questions-page">
      <header className="page-header">
        <div>
          <Link to="/teacher/quizzes" className="back-link">← Back to Quizzes</Link>
          <h1>{quiz?.title || 'Quiz'} - Questions</h1>
          <p>{questions.length} question(s)</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary"
          >
            + Add Question
          </button>
        )}
      </header>

      {isNewQuiz && (
        <div className="alert alert-success">
          Quiz created successfully! Now add some questions.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Question Form */}
      {showForm && (
        <div className="card question-form-card">
          <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea
                name="text"
                className="form-textarea question-textarea"
                placeholder="Enter your question..."
                value={formData.text}
                onChange={handleChange}
                rows={5}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Question Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="truefalse">True / False</option>
                <option value="short">Short Answer</option>
              </select>
            </div>

            {/* MCQ Options */}
            {formData.type === 'mcq' && (
              <div className="form-group">
                <label className="form-label">Options (select the correct one)</label>
                <div className="options-editor">
                  {formData.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === option && option !== ''}
                        onChange={() => setFormData(prev => ({ ...prev, correctAnswer: option }))}
                        disabled={!option.trim()}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => removeOption(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addOption}
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {/* True/False Options */}
            {formData.type === 'truefalse' && (
              <div className="form-group">
                <label className="form-label">Correct Answer</label>
                <div className="tf-options">
                  <label className={`tf-option ${formData.correctAnswer === 'True' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      value="True"
                      checked={formData.correctAnswer === 'True'}
                      onChange={handleChange}
                    />
                    True
                  </label>
                  <label className={`tf-option ${formData.correctAnswer === 'False' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      value="False"
                      checked={formData.correctAnswer === 'False'}
                      onChange={handleChange}
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {/* Short Answer */}
            {formData.type === 'short' && (
              <div className="form-group">
                <label className="form-label">Expected Answer (for auto-grading)</label>
                <input
                  type="text"
                  name="correctAnswer"
                  className="form-input"
                  placeholder="Enter expected answer..."
                  value={formData.correctAnswer}
                  onChange={handleChange}
                />
                <span className="form-hint">
                  Leave empty for manual grading
                </span>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state">
            <h3>No Questions Yet</h3>
            <p>Add your first question to this quiz.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div key={question.id} className="card question-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className={`badge badge-${question.type === 'mcq' ? 'primary' : question.type === 'truefalse' ? 'info' : 'warning'}`}>
                  {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'truefalse' ? 'True/False' : 'Short Answer'}
                </span>
              </div>
              
              <p className="question-text">{question.text}</p>
              
              {question.options && Array.isArray(question.options) && (
                <div className="question-options">
                  {question.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`option-display ${opt === question.correct_answer ? 'correct' : ''}`}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                      {opt}
                      {opt === question.correct_answer && <span className="correct-badge">✓</span>}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="question-actions">
                <button onClick={() => startEdit(question)} className="btn btn-secondary btn-sm">
                  Edit
                </button>
                <button onClick={() => deleteQuestion(question.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
        }
        
        .back-link {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
          display: block;
          margin-bottom: var(--space-xs);
        }
        
        .page-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }
        
        .question-form-card {
          margin-bottom: var(--space-xl);
        }
        
        .question-form-card h2 {
          margin-bottom: var(--space-lg);
        }
        
        .question-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        
        .question-textarea {
          width: 100%;
          min-height: 120px;
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          font-size: var(--font-size-base);
          font-family: inherit;
          resize: vertical;
          box-sizing: border-box;
        }
        
        .question-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .options-editor {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .option-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .option-row input[type="radio"] {
          margin: 0;
        }
        
        .option-row .form-input {
          flex: 1;
        }
        
        .btn-icon {
          background: none;
          border: none;
          color: var(--color-error);
          cursor: pointer;
          padding: var(--space-xs);
        }
        
        .tf-options {
          display: flex;
          gap: var(--space-md);
        }
        
        .tf-option {
          flex: 1;
          padding: var(--space-md);
          text-align: center;
          border: 2px solid var(--color-border);
          border-radius: var(--border-radius);
          cursor: pointer;
          font-weight: 500;
        }
        
        .tf-option:hover {
          border-color: var(--color-primary-light);
        }
        
        .tf-option.selected {
          border-color: var(--color-primary);
          background: #eff6ff;
        }
        
        .tf-option input {
          display: none;
        }
        
        .form-hint {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
          margin-top: var(--space-xs);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-border);
        }
        
        .questions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        
        .question-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .question-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .question-number {
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .badge-info {
          background: #ecfeff;
          color: var(--color-info);
        }
        
        .question-text {
          font-size: var(--font-size-lg);
          margin: 0;
        }
        
        .question-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          margin-top: var(--space-sm);
        }
        
        .option-display {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg);
          border-radius: var(--border-radius);
        }
        
        .option-display.correct {
          background: #dcfce7;
        }
        
        .option-display .option-letter {
          font-weight: 600;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
        }
        
        .correct-badge {
          margin-left: auto;
          color: var(--color-success);
          font-weight: 700;
        }
        
        .question-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
          padding-top: var(--space-sm);
          border-top: 1px solid var(--color-border);
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
      `}</style>
    </div>
  );
}
