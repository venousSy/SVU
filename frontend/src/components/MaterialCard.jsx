import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTestGeneration } from '../hooks/useTestGeneration';
import Modal from './common/Modal';
import './MaterialCard.css';

const MaterialCard = ({ id, title, description, type, author, date, fileUrl, onTestGenerated }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const {
    isGenerating,
    showExistingDialog,
    existingTestCount,
    limitErrorMsg,
    showLimitModal,
    checkAndGenerateTest,
    generateNewTest,
    closeDialogs
  } = useTestGeneration(id, onTestGenerated);

  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf':   return '📄';
      case 'video': return '🎥';
      case 'test':  return '📝';
      default:      return '📁';
    }
  };

  const requireAuth = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleView = (e) => {
    if (!requireAuth(e)) return;
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCreateTest = async (e) => {
    e.stopPropagation();
    if (!requireAuth(e)) return;
    await checkAndGenerateTest();
  };

  const handleGoToExisting = () => {
    closeDialogs();
    navigate(`/saved-tests?material=${id}`);
  };

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

      {showExistingDialog && (
        <Modal
          title="Test Already Exists"
          message={`There ${existingTestCount === 1 ? 'is already 1 test' : \`are already \${existingTestCount} tests\`} for this material. What would you like to do?`}
          onClose={closeDialogs}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleGoToExisting}>
              View Existing Tests
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={generateNewTest}>
              Create New Test
            </button>
          </div>
          <button
            onClick={closeDialogs}
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

      {showLimitModal && (
        <Modal
          title="Test Limit Reached"
          message={limitErrorMsg}
          onClose={closeDialogs}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleGoToExisting}>
              View Existing Tests
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={closeDialogs}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MaterialCard;
