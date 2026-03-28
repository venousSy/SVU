import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ExamRunner from '../components/ExamRunner';
import api from '../api';
import './ResourceLibrary.css'; // Reuse existing styles

const SavedTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tests');
      setTests(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch scheduled mock tests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="library-container">
      <Header />
      
      <div className="library-header">
        <h1 className="library-title">Saved Mock Tests</h1>
        <p className="library-subtitle">Review previously generated exams and practice again without spending API credits.</p>
      </div>

      {activeTest ? (
        <div style={{ marginTop: '2rem' }}>
          <button 
            className="btn-secondary" 
            style={{ marginBottom: '1rem', marginLeft: 'auto', display: 'block' }}
            onClick={() => setActiveTest(null)}
          >
            ← Back to Saved Tests
          </button>
          <ExamRunner test={activeTest} timeLimitMinutes={15} />
        </div>
      ) : loading ? (
        <div className="empty-state glass-panel">
          <p>Loading your saved tests...</p>
        </div>
      ) : error ? (
        <div className="empty-state glass-panel" style={{ color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : tests.length > 0 ? (
        <div className="materials-grid">
          {tests.map((mockTest) => (
            <div key={mockTest._id} className="card-container glass-panel" style={{ cursor: 'pointer' }} onClick={() => setActiveTest(mockTest.testContent)}>
              <div className="card-header">
                <div className="card-icon">📝</div>
                <div>
                  <h3 className="card-title">{mockTest.materialId?.title || 'Unknown Material'} Test</h3>
                  <p className="card-subtitle">Saved on {new Date(mockTest.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="card-body">
                <p>Click here to start taking this mock exam.</p>
              </div>
              <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
                 <button className="btn-primary" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>Launch</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <p>No saved tests found. Go to the Library and click "Create Test" on a material first!</p>
        </div>
      )}
    </div>
  );
};

export default SavedTests;
