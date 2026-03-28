import React, { useState } from 'react';
import api from '../api';
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
      // 1. Check if a test already exists for this material
      try {
        const existingTestRes = await api.get(`/tests/${id}`);
        if (existingTestRes.data && existingTestRes.data.testContent) {
          console.log('Found existing test, skipping generation');
          onTestGenerated(existingTestRes.data.testContent);
          setIsGenerating(false);
          return;
        }
      } catch (checkErr) {
        // 404 means not found, which is fine, proceed to generation
        if (checkErr.response && checkErr.response.status !== 404) {
             console.error('Error checking for existing test:', checkErr);
        }
      }

      // 2. Generate test if not found (calling Gemini)
      console.log('Generating new test...');
      const response = await api.post(`/materials/${id}/generate-test`);
      
      if (response.data && response.data.test) {
        const generatedTest = response.data.test;
        onTestGenerated(generatedTest);
        
        // 3. Save the newly generated test to db
        try {
          await api.post('/tests', {
            materialId: id,
            testContent: generatedTest
          });
          console.log('Saved newly generated test successfully');
        } catch (saveErr) {
          console.error('Error saving generated test:', saveErr);
          // Non-blocking error, user still gets their test but it fails to save
        }
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
