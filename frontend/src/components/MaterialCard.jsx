import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import './MaterialCard.css';

const MAX_USER_TESTS = 5;

/* ─────────────────────────────────────────── Modal ── */
const Modal = ({ title, message, children, onClose }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
    onClick={onClose}
  >
    <div
      className="glass-panel"
      style={{
        padding: '2rem', maxWidth: '420px', width: '90%',
        borderRadius: '1rem', position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {message}
      </p>
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────── Card ─── */
const MaterialCard = ({ id, title, description, type, author, date, fileUrl, onTestGenerated }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);

  // dialog state
  const [showExistingDialog, setShowExistingDialog] = useState(false);
  const [existingTestCount, setExistingTestCount] = useState(0);
  const [limitErrorMsg, setLimitErrorMsg] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);

  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf':   return '📄';
      case 'video': return '🎥';
      case 'test':  return '📝';
      default:      return '📁';
    }
  };

  /* ── Guard: redirect to login if guest ─────────── */
  const requireAuth = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }
    return true;
  };

  /* ── "View" button handler ──────────────────────── */
  const handleView = (e) => {
    if (!requireAuth(e)) return;
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  /* ── Generate a brand-new test via Gemini ───────── */
  const generateNewTest = async () => {
    setIsGenerating(true);
    setShowExistingDialog(false);
    try {
      const response = await api.post(`/materials/${id}/generate-test`);
      if (response.data?.test) {
        const generatedTest = response.data.test;
        onTestGenerated(generatedTest);

        // Save to DB — enforce limit on the backend too
        try {
          await api.post('/tests', { materialId: id, testContent: generatedTest });
        } catch (saveErr) {
          if (saveErr.response?.data?.limitReached) {
            setLimitErrorMsg(saveErr.response.data.message);
            setShowLimitModal(true);
          } else {
            console.error('Error saving generated test:', saveErr);
          }
        }
      }
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setLimitErrorMsg(err.response.data.message);
        setShowLimitModal(true);
      } else {
        console.error('Error generating test:', err);
        alert('Failed to generate test. Please ensure the backend is running and the PDF is accessible.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Main "Create Test" button handler ─────────── */
  const handleCreateTest = async (e) => {
    e.stopPropagation();
    if (!requireAuth(e)) return;

    setIsGenerating(true);
    setLimitErrorMsg('');

    try {
      // 1. Check user's global test-creation count first
      const countRes = await api.get('/tests/user/count');
      const { count, limitReached } = countRes.data;

      if (limitReached) {
        setLimitErrorMsg(
          `You've reached the limit of ${MAX_USER_TESTS} created tests. You can still view and take any existing tests.`
        );
        setShowLimitModal(true);
        setIsGenerating(false);
        return;
      }

      // 2. Check if a test already exists for this material
      try {
        const existingRes = await api.get(`/tests/${id}`);
        if (existingRes.data?.tests?.length > 0) {
          // Tests exist → ask the user what to do
          setExistingTestCount(existingRes.data.count);
          setShowExistingDialog(true);
          setIsGenerating(false);
          return;
        }
      } catch (checkErr) {
        // 404 → no existing test, proceed to generate
        if (checkErr.response?.status !== 404) {
          console.error('Error checking existing test:', checkErr);
        }
      }

      // 3. No existing test → generate immediately
      await generateNewTest();
    } catch (err) {
      console.error('Error in handleCreateTest:', err);
      setIsGenerating(false);
    }
  };

  /* ── "Go to existing tests" ─────────────────────── */
  const handleGoToExisting = () => {
    setShowExistingDialog(false);
    navigate(`/saved-tests?material=${id}`);
  };

  /* ─────────────────────────────── Render ─────────── */
  return (
    <>
      <div className="card-container glass-panel">
        <div className="card-header">
          <div className="card-icon">{getIcon()}</div>
          <div>
            <h3 className="card-title">{title || 'Untitled Material'}</h3>
            <p className="card-subtitle">By {author || 'Anonymous'} • {date || 'New'}</p>
          </div>
        </div>

        <div className="card-body">
          <p>{description || 'No description provided for this study material.'}</p>
        </div>

        <div className="card-footer">
          <span className="card-tag">{type?.toUpperCase() || 'DOCUMENT'}</span>
          <div className="card-actions">
            {type?.toLowerCase() === 'pdf' && (
              <button
                className="btn-secondary"
                onClick={handleCreateTest}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : isLoggedIn ? 'Create Test' : '🔒 Create Test'}
              </button>
            )}
            <button
              className="btn-primary"
              style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}
              onClick={handleView}
              disabled={!fileUrl}
            >
              {isLoggedIn ? 'View' : '🔒 View'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Dialog: existing test found ── */}
      {showExistingDialog && (
        <Modal
          title="Test Already Exists"
          message={`There ${existingTestCount === 1 ? 'is already 1 test' : `are already ${existingTestCount} tests`} for this material. What would you like to do?`}
          onClose={() => setShowExistingDialog(false)}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleGoToExisting}
            >
              View Existing Tests
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={generateNewTest}
            >
              Create New Test
            </button>
          </div>
          <button
            onClick={() => setShowExistingDialog(false)}
            style={{
              marginTop: '1rem', background: 'none', border: 'none',
              color: 'var(--color-text-secondary)', cursor: 'pointer',
              width: '100%', textAlign: 'center', fontSize: 'var(--font-size-sm)',
            }}
          >
            Cancel
          </button>
        </Modal>
      )}

      {/* ── Dialog: limit reached ── */}
      {showLimitModal && (
        <Modal
          title="Test Limit Reached"
          message={limitErrorMsg}
          onClose={() => setShowLimitModal(false)}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleGoToExisting}
            >
              View Existing Tests
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setShowLimitModal(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MaterialCard;
