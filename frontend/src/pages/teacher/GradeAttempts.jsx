import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI, attemptAPI, questionAPI } from '../../api';

/**
 * Grade Attempts Page (Teacher)
 * 
 * PURPOSE:
 * Allows teachers to review student submissions and manually grade
 * short answer questions or adjust scores.
 * 
 * FLOW:
 * 1. Show list of submitted attempts for a quiz
 * 2. Click on attempt to view student's answers
 * 3. Compare with correct answers
 * 4. Assign/update score
 * 
 * WHY MANUAL GRADING?
 * - Short answer questions can't be auto-graded reliably
 * - Teachers may want to give partial credit
 * - Allows for reviewing essay-type responses
 */
export default function GradeAttempts() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Data state
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [quizId]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load quiz, attempts, and questions in parallel
      const [quizzesData, attemptsData, questionsData] = await Promise.all([
        quizAPI.getAll(),
        attemptAPI.getByQuizId(quizId),
        questionAPI.getByQuizId(quizId)
      ]);

      const quizData = quizzesData.find(q => q.id === parseInt(quizId));
      if (!quizData) {
        setError('Quiz not found');
        return;
      }

      setQuiz(quizData);
      setAttempts(attemptsData);
      setQuestions(questionsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function selectAttempt(attempt) {
    setSelectedAttempt(attempt);
    setGradeInput(attempt.score?.toString() || '0');
    setSuccessMessage('');
  }

  async function saveGrade() {
    if (!selectedAttempt) return;

    const score = parseInt(gradeInput);
    if (isNaN(score) || score < 0) {
      setError('Please enter a valid score (0 or higher)');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await attemptAPI.grade(selectedAttempt.id, score);
      
      // Update local state
      setAttempts(prev => prev.map(a => 
        a.id === selectedAttempt.id 
          ? { ...a, score }
          : a
      ));
      setSelectedAttempt(prev => ({ ...prev, score }));
      setSuccessMessage('Grade saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  function getAnswerDisplay(questionId) {
    if (!selectedAttempt?.answers) return 'No answer';
    const answers = typeof selectedAttempt.answers === 'string' 
      ? JSON.parse(selectedAttempt.answers) 
      : selectedAttempt.answers;
    return answers[questionId] || 'No answer';
  }

  function getCorrectAnswer(question) {
    if (!question.correct_answer) return 'Not set';
    // Parse if it's a JSON string
    try {
      const parsed = typeof question.correct_answer === 'string'
        ? JSON.parse(question.correct_answer)
        : question.correct_answer;
      return parsed;
    } catch {
      return question.correct_answer;
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="grade-attempts-page">
      <header className="page-header">
        <div>
          <Link to="/teacher/quizzes" className="back-link">← Back to Quizzes</Link>
          <h1>Grade: {quiz?.title}</h1>
          <p className="subtitle">{attempts.length} submission(s)</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="grade-layout">
        {/* Attempts List */}
        <div className="attempts-panel card">
          <h2>Submissions</h2>
          
          {attempts.length === 0 ? (
            <p className="empty-state">No submissions yet</p>
          ) : (
            <ul className="attempts-list">
              {attempts.map(attempt => (
                <li 
                  key={attempt.id}
                  className={`attempt-item ${selectedAttempt?.id === attempt.id ? 'selected' : ''}`}
                  onClick={() => selectAttempt(attempt)}
                >
                  <div className="attempt-info">
                    <span className="username">{attempt.username}</span>
                    <span className="date">{formatDate(attempt.submitted_at)}</span>
                  </div>
                  <div className="attempt-score">
                    <span className={`score ${attempt.score !== null ? 'graded' : 'pending'}`}>
                      {attempt.score !== null ? `${attempt.score} pts` : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Grading Panel */}
        <div className="grading-panel card">
          {selectedAttempt ? (
            <>
              <div className="grading-header">
                <h2>Review: {selectedAttempt.username}</h2>
                <p>Submitted: {formatDate(selectedAttempt.submitted_at)}</p>
              </div>

              {/* Questions & Answers */}
              <div className="answers-review">
                {questions.map((question, index) => (
                  <div key={question.id} className="answer-item">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <span className={`question-type badge badge-${question.type === 'mcq' ? 'primary' : question.type === 'truefalse' ? 'info' : 'warning'}`}>
                        {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'truefalse' ? 'True/False' : 'Short Answer'}
                      </span>
                    </div>
                    <p className="question-text">{question.text}</p>
                    
                    <div className="answer-comparison">
                      <div className="student-answer">
                        <label>Student's Answer:</label>
                        <div className="answer-value">{getAnswerDisplay(question.id)}</div>
                      </div>
                      <div className="correct-answer">
                        <label>Correct Answer:</label>
                        <div className="answer-value correct">{getCorrectAnswer(question)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade Input */}
              <div className="grade-input-section">
                <label htmlFor="score">Total Score:</label>
                <div className="grade-controls">
                  <input
                    type="number"
                    id="score"
                    className="form-input score-input"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    min="0"
                  />
                  <span className="max-score">/ {questions.length} pts</span>
                  <button 
                    className="btn btn-success"
                    onClick={saveGrade}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a submission to review and grade</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .grade-attempts-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--space-lg);
        }

        .back-link {
          color: var(--color-text-light);
          text-decoration: none;
          font-size: var(--font-size-sm);
        }

        .back-link:hover {
          color: var(--color-primary);
        }

        .page-header h1 {
          margin: var(--space-xs) 0;
        }

        .subtitle {
          color: var(--color-text-light);
          margin: 0;
        }

        .grade-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-lg);
        }

        @media (max-width: 768px) {
          .grade-layout {
            grid-template-columns: 1fr;
          }
        }

        .attempts-panel h2,
        .grading-panel h2 {
          margin-bottom: var(--space-md);
          font-size: var(--font-size-lg);
        }

        .attempts-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .attempt-item {
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          margin-bottom: var(--space-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .attempt-item:hover {
          border-color: var(--color-primary);
          background: var(--color-bg);
        }

        .attempt-item.selected {
          border-color: var(--color-primary);
          background: #eff6ff;
        }

        .attempt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-xs);
        }

        .username {
          font-weight: 600;
        }

        .date {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }

        .attempt-score {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .score.pending {
          color: var(--color-warning);
        }

        .score.graded {
          color: var(--color-success);
          font-weight: 600;
        }

        .graded-badge {
          font-size: var(--font-size-xs);
          color: var(--color-success);
        }

        .grading-header {
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .grading-header h2 {
          margin-bottom: var(--space-xs);
        }

        .grading-header p {
          color: var(--color-text-light);
          margin: 0;
          font-size: var(--font-size-sm);
        }

        .answers-review {
          max-height: 500px;
          overflow-y: auto;
          margin-bottom: var(--space-lg);
        }

        .answer-item {
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          margin-bottom: var(--space-md);
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .question-number {
          font-weight: 700;
          color: var(--color-primary);
        }

        .question-text {
          font-weight: 500;
          margin-bottom: var(--space-md);
        }

        .answer-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }

        @media (max-width: 600px) {
          .answer-comparison {
            grid-template-columns: 1fr;
          }
        }

        .student-answer label,
        .correct-answer label {
          display: block;
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
          margin-bottom: var(--space-xs);
        }

        .answer-value {
          padding: var(--space-sm);
          background: var(--color-bg);
          border-radius: var(--border-radius);
          min-height: 40px;
        }

        .answer-value.correct {
          background: #dcfce7;
          color: var(--color-success);
        }

        .grade-input-section {
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-lg);
        }

        .grade-input-section label {
          display: block;
          font-weight: 600;
          margin-bottom: var(--space-sm);
        }

        .grade-controls {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .score-input {
          width: 100px;
          text-align: center;
          font-size: var(--font-size-lg);
          font-weight: 600;
        }

        .max-score {
          color: var(--color-text-light);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-xl);
          color: var(--color-text-light);
        }

        .alert-success {
          background: #dcfce7;
          color: #166534;
          padding: var(--space-md);
          border-radius: var(--border-radius);
          margin-bottom: var(--space-md);
        }
      `}</style>
    </div>
  );
}
