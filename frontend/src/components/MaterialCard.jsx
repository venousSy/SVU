import React, { useState } from 'react';
import axios from 'axios';
import './MaterialCard.css';

const MaterialCard = ({ id, title, description, type, author, date, fileUrl, onTestGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine icon based on file type
  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'test': return '📝';
      default: return '📁';
    }
  };

  const handleCreateTest = async (e) => {
    e.stopPropagation();
    setIsGenerating(true);
    
    try {
      const response = await axios.post(`http://localhost:5000/api/materials/${id}/generate-test`);
      if (response.data && response.data.test) {
        onTestGenerated(response.data.test);
      }
    } catch (err) {
      console.error('Error generating test:', err);
      alert('Failed to generate test. Please ensure the backend is running and the PDF is accessible.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
              {isGenerating ? 'Generating...' : 'Create Test'}
            </button>
          )}
          {fileUrl ? (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>View</a>
          ) : (
            <button className="btn-primary" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)' }} disabled>View</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
