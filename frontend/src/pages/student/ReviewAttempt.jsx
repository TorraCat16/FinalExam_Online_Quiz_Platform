import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { attemptAPI, questionAPI } from '../../api';

/**
 * Review Attempt Page (Student)
 *
 * PURPOSE:
 * Allows a student to review a past quiz attempt from "My Results".
 *
 * DATA FLOW:
 * - Navigated from /student/results with attemptId (URL param)
 * - Loads the student's own attempts via attemptAPI.getMine()
 * - Finds the specific attempt by id and then loads questions for that quiz
 */
export default function ReviewAttempt() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quizTitleFromState = location.state?.quizTitle;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const allAttempts = await attemptAPI.getMine();
      const idNum = parseInt(attemptId, 10);
      const foundAttempt = allAttempts.find(a => a.id === idNum);

      if (!foundAttempt) {
        setError('Attempt not found or does not belong to you.');
        setLoading(false);
        return;
      }

      setAttempt(foundAttempt);

      const qs = await questionAPI.getByQuizId(foundAttempt.quiz_id);
      setQuestions(qs);
    } catch (err) {
      setError(err.message || 'Failed to load attempt details');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  function getAnswerDisplay(questionId) {
    if (!attempt?.answers) return 'No answer';
    const answers =
      typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers;
    return answers[questionId] ?? 'No answer';
  }

  function getCorrectAnswer(question) {
    if (!question.correct_answer) return 'Not set';
    try {
      const parsed =
        typeof question.correct_answer === 'string'
          ? JSON.parse(question.correct_answer)
          : question.correct_answer;
      return parsed;
    } catch {
      return question.correct_answer;
    }
  }

  const quizTitle =
    quizTitleFromState || (attempt ? `Quiz #${attempt.quiz_id}` : 'Quiz Review');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading attempt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <header className="page-header">
          <h1>Review Attempt</h1>
        </header>
        <div className="alert alert-error">{error}</div>
        <div className="cta-section">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <header className="page-header">
        <Link to="/student/results" className="back-link">
          ← Back to My Results
        </Link>
        <h1>{quizTitle}</h1>
        <p>Review your previous answers</p>
      </header>

      {attempt && (
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-value">
              {attempt.score} / {attempt.total_questions || '?'}
            </div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatDate(attempt.submitted_at)}
            </div>
            <div className="stat-label">Submitted</div>
          </div>
        </section>
      )}

      <section className="results-section">
        <h2>Answers Review</h2>
        {questions.length === 0 ? (
          <p className="empty-state">
            No questions found for this quiz.
          </p>
        ) : (
          <div className="card">
            <div className="answers-review">
              {questions.map((question, index) => (
                <div key={question.id} className="answer-item">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span
                      className={`question-type badge badge-${
                        question.type === 'mcq'
                          ? 'primary'
                          : question.type === 'truefalse'
                          ? 'info'
                          : 'warning'
                      }`}
                    >
                      {question.type === 'mcq'
                        ? 'Multiple Choice'
                        : question.type === 'truefalse'
                        ? 'True/False'
                        : 'Short Answer'}
                    </span>
                  </div>
                  <p className="question-text">{question.text}</p>

                  <div className="answer-comparison">
                    <div className="student-answer">
                      <label>Your Answer:</label>
                      <div className="answer-value">
                        {String(getAnswerDisplay(question.id))}
                      </div>
                    </div>
                    <div className="correct-answer">
                      <label>Correct Answer:</label>
                      <div className="answer-value correct">
                        {String(getCorrectAnswer(question))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .back-link {
          color: var(--color-text-light);
          text-decoration: none;
          font-size: var(--font-size-sm);
        }

        .back-link:hover {
          color: var(--color-primary);
        }

        .answers-review {
          max-height: 600px;
          overflow-y: auto;
        }

        .answer-item {
          padding: var(--space-md);
          border: 1px solid var(--color-border);
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
          min-height: 40px;
        }

        .answer-value.correct {
          background: #dcfce7;
          color: var(--color-success);
        }
      `}</style>
    </div>
  );
}

