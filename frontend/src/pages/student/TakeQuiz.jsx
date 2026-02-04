import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, questionAPI, attemptAPI } from '../../api';

/**
 * Take Quiz Page
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → View quizzes → [START QUIZ] → [SUBMIT] → View score
 * 
 * PURPOSE:
 * The actual quiz-taking experience where students answer questions.
 * 
 * FLOW:
 * 1. Load quiz details and questions
 * 2. Create attempt record (starts timer)
 * 3. Student answers questions
 * 4. On submit, send answers to backend
 * 5. Show result and redirect
 * 
 * FEATURES:
 * - Timer countdown (if quiz has time limit)
 * - Progress indicator
 * - Question navigation
 * - Answer selection (single/multiple choice)
 * - Submit confirmation
 * 
 * WHY START ATTEMPT BEFORE SHOWING QUESTIONS?
 * - Backend records start_time for time limit enforcement
 * - Prevents gaming by viewing questions before "starting"
 * - Matches the flow: "Attempt created" happens first
 */
export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Quiz data
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  
  // User answers: { questionId: selectedAnswer }
  const [answers, setAnswers] = useState({});
  
  // UI state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Ref to prevent double execution in React Strict Mode
  const hasStarted = useRef(false);

  // Load quiz, questions, and start attempt
  useEffect(() => {
    // Prevent double execution in React 18 Strict Mode
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    startQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  async function startQuiz() {
    try {
      // Fetch quiz details and questions in parallel
      const [quizData, questionsData] = await Promise.all([
        quizAPI.getAll().then(quizzes => quizzes.find(q => q.id === parseInt(quizId))),
        questionAPI.getByQuizId(quizId)
      ]);

      if (!quizData) {
        setError('Quiz not found');
        setLoading(false);
        return;
      }

      setQuiz(quizData);
      setQuestions(questionsData);

      // Start attempt (records start_time in backend)
      const attemptData = await attemptAPI.start(quizId);
      setAttempt(attemptData.attempt);

      // Set timer if quiz has time limit
      if (quizData.time_limit) {
        setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
      }

    } catch (err) {
      setError(err.message || 'Failed to start quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle answer selection
   */
  function selectAnswer(questionId, answer) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }

  /**
   * Navigate to next question
   */
  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }

  /**
   * Navigate to previous question
   */
  function prevQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }

  /**
   * Go to specific question
   */
  function goToQuestion(index) {
    setCurrentQuestion(index);
  }

  /**
   * Calculate score (client-side for now)
   * NOTE: This should ideally be done server-side for security
   * Returns raw score (number of correct answers), not percentage
   */
  function calculateScore() {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  }

  /**
   * Auto-submit when time runs out
   */
  const handleAutoSubmit = useCallback(async () => {
    if (submitting) return;
    await submitQuiz();
  }, [submitting, answers, attempt]);

  /**
   * Submit quiz
   */
  async function submitQuiz() {
    if (submitting || !attempt) return;
    
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const score = calculateScore();
      
      await attemptAPI.submit(attempt.id, answers, score);
      
      // Redirect to results with success state
      navigate('/student/results', { 
        state: { 
          justCompleted: true, 
          score,
          totalQuestions: questions.length,
          quizTitle: quiz.title 
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  }

  /**
   * Format time for display
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="error-container">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate('/student/quizzes')} className="btn btn-secondary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="take-quiz-page">
      {/* Quiz Header */}
      <header className="quiz-header">
        <div className="quiz-title">
          <h1>{quiz?.title}</h1>
          <span className="question-counter">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        
        {timeLeft !== null && (
          <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Navigation Pills */}
      <div className="question-nav">
        {questions.map((q, index) => (
          <button
            key={q.id}
            className={`nav-pill ${index === currentQuestion ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
            onClick={() => goToQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      {currentQ && (
        <div className="question-container card">
          <h2 className="question-text">{currentQ.text}</h2>
          
          <div className="options-list">
            {/* Short Answer / Text Questions */}
            {(currentQ.type === 'short_answer' || currentQ.type === 'text' || currentQ.type === 'short') ? (
              <div className="short-answer-container">
                <textarea
                  className="short-answer-input"
                  placeholder="Type your answer here..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => selectAnswer(currentQ.id, e.target.value)}
                  rows={4}
                />
              </div>
            ) : currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
              /* Multiple Choice Questions */
              currentQ.options.map((option, index) => (
                <label 
                  key={index} 
                  className={`option ${answers[currentQ.id] === option ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={() => selectAnswer(currentQ.id, option)}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </label>
              ))
            ) : (
              /* Fallback - treat as short answer if no options */
              <div className="short-answer-container">
                <textarea
                  className="short-answer-input"
                  placeholder="Type your answer here..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => selectAnswer(currentQ.id, e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="quiz-navigation">
        <button 
          onClick={prevQuestion} 
          className="btn btn-secondary"
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        <span className="answered-count">
          {answeredCount} of {questions.length} answered
        </span>

        {isLastQuestion ? (
          <button 
            onClick={() => setShowConfirm(true)} 
            className="btn btn-success"
            disabled={submitting}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            onClick={nextQuestion} 
            className="btn btn-primary"
          >
            Next →
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal card">
            <h3>Submit Quiz?</h3>
            <p>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="warning-text">
                  {' '}You have {questions.length - answeredCount} unanswered question(s).
                </span>
              )}
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="btn btn-secondary"
              >
                Review Answers
              </button>
              <button 
                onClick={submitQuiz} 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .take-quiz-page {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }
        
        .quiz-title h1 {
          margin: 0;
          font-size: var(--font-size-xl);
        }
        
        .question-counter {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        .timer {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg);
          border-radius: var(--border-radius);
        }
        
        .timer-warning {
          color: var(--color-error);
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          50% { opacity: 0.5; }
        }
        
        .progress-bar {
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          margin-bottom: var(--space-md);
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s ease;
        }
        
        .question-nav {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          margin-bottom: var(--space-lg);
        }
        
        .nav-pill {
          width: 36px;
          height: 36px;
          border: 2px solid var(--color-border);
          border-radius: 50%;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        
        .nav-pill:hover {
          border-color: var(--color-primary);
        }
        
        .nav-pill.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .nav-pill.answered:not(.active) {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
        }
        
        .question-container {
          margin-bottom: var(--space-lg);
        }
        
        .question-text {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-lg);
        }
        
        .options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        
        .option {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border: 2px solid var(--color-border);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .option:hover {
          border-color: var(--color-primary-light);
          background: var(--color-bg);
        }
        
        .option.selected {
          border-color: var(--color-primary);
          background: #eff6ff;
        }
        
        .option input {
          display: none;
        }
        
        .option-letter {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg);
          border-radius: 50%;
          font-weight: 600;
        }
        
        .option.selected .option-letter {
          background: var(--color-primary);
          color: white;
        }
        
        .option-text {
          flex: 1;
        }
        
        .short-answer-container {
          width: 100%;
        }
        
        .short-answer-input {
          width: 100%;
          padding: var(--space-md);
          border: 2px solid var(--color-border);
          border-radius: var(--border-radius);
          font-size: var(--font-size-base);
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          transition: border-color var(--transition-fast);
        }
        
        .short-answer-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .short-answer-input::placeholder {
          color: var(--color-text-light);
        }
        
        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-border);
        }
        
        .answered-count {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
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
        
        .warning-text {
          color: var(--color-warning);
        }
        
        .modal-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
        }
        
        .error-container {
          text-align: center;
          padding: var(--space-2xl);
        }
      `}</style>
    </div>
  );
}
