import React, { useState, useEffect, useMemo } from 'react';
import './ExamRunner.css';

const ExamRunner = ({ test, timeLimitMinutes = 10 }) => {
  const { questions, test_metadata } = test;
  
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [finalScore, setFinalScore] = useState(0);
  const [results, setResults] = useState([]);

  // Timer Effect
  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionKey) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [questions[currentQuestionIndex].id]: optionKey,
    });
  };

  const submitExam = () => {
    if (isSubmitted) return;

    let score = 0;
    const examResults = questions.map((q) => {
      const userAnswer = userAnswers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) score++;
      
      return {
        ...q,
        userAnswer,
        isCorrect,
      };
    });

    setFinalScore(score);
    setResults(examResults);
    setIsSubmitted(true);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isSubmitted) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const scorePercentage = (finalScore / questions.length) * 100;

    return (
      <div className="exam-runner-container">
        <div className="exam-card results-view">
          <h1 style={{ marginBottom: '1rem' }}>Exam Results</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{test_metadata.subject}</p>
          
          <div className="score-circle" style={{ '--progress': `${scorePercentage}%` }}>
            <span className="score-text">{Math.round(scorePercentage)}%</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Correct</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{finalScore} / {questions.length}</p>
            </div>
            <div className="stat-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Time Spent</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{formatTime(timeSpent)}</p>
            </div>
          </div>

          <div className="wrong-answers-list">
            <h3 style={{ marginBottom: '1.5rem', color: '#e2e8f0' }}>Review Answers</h3>
            {results.map((res, idx) => (
              <div key={res.id} className={`wrong-answer-item ${res.isCorrect ? 'correct-item' : ''}`} style={res.isCorrect ? { borderColor: 'rgba(74, 222, 128, 0.2)', background: 'rgba(74, 222, 128, 0.05)' } : {}}>
                <h4>{idx + 1}. {res.question_text}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ color: res.isCorrect ? '#4ade80' : '#fb7185' }}>
                    Your Answer: {res.userAnswer ? `${res.userAnswer}: ${res.options[res.userAnswer]}` : 'Not answered'}
                  </p>
                  {!res.isCorrect && (
                    <>
                      <span className="correct-badge">Correct Answer: {res.correct_answer}: {res.options[res.correct_answer]}</span>
                      <div className="explanation">
                        <strong>Explanation:</strong> {res.explanation}
                      </div>
                    </>
                  )}
                  {res.isCorrect && (
                    <div className="explanation">
                      <strong>Note:</strong> {res.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => window.location.reload()}>
            Return to Materials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-runner-container">
      <div className="exam-card">
        <div className="exam-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9' }}>{test_metadata.subject}</h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
             {formatTime(timeLeft)}
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="question-section">
          <h2>{currentQuestion.question_text}</h2>
          
          <div className="options-grid">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <div
                key={key}
                className={`option-card ${userAnswers[currentQuestion.id] === key ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(key)}
              >
                <div className="option-marker">{key}</div>
                <div className="option-text">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button className="btn btn-primary" onClick={submitExam}>
              Submit Exam ✓
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            >
              Next Question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamRunner;
