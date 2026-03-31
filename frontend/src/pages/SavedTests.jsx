import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ExamRunner from '../components/ExamRunner';
import SearchBar from '../components/SearchBar';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import './ResourceLibrary.css';

const SavedTests = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const materialFilter = searchParams.get('material'); // e.g. ?material=<materialId>

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect guests to login
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      loadTests();
    }
  }, [isLoggedIn]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tests');
      setTests(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch mock tests.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null; // avoid flash before redirect

  // Apply filters: by materialId query param first, then by search string
  const filteredTests = tests.filter((t) => {
    const matchesMaterial = materialFilter
      ? t.materialId?._id === materialFilter || t.materialId === materialFilter
      : true;
    const matchesSearch = !searchQuery
      || t.materialId?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMaterial && matchesSearch;
  });

  return (
    <div className="library-container">
      <Header />

      <div className="library-header">
        <h1 className="library-title">
          {materialFilter ? 'Tests for This Material' : 'Saved Mock Tests'}
        </h1>
        <p className="library-subtitle">
          {materialFilter
            ? 'Showing tests generated for the selected material.'
            : 'Review previously generated exams and practice again without spending API credits.'}
        </p>
        {materialFilter && (
          <button
            className="btn-secondary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => navigate('/saved-tests')}
          >
            ← Show All Tests
          </button>
        )}
      </div>

      <SearchBar onSearch={setSearchQuery} />

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
          <p>Loading your saved tests…</p>
        </div>
      ) : error ? (
        <div className="empty-state glass-panel" style={{ color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="materials-grid">
          {filteredTests.map((mockTest) => (
            <div
              key={mockTest._id}
              className="card-container glass-panel"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTest(mockTest.testContent)}
            >
              <div className="card-header">
                <div className="card-icon">📝</div>
                <div>
                  <h3 className="card-title">
                    {mockTest.materialId?.title || 'Unknown Material'} — Test
                  </h3>
                  <p className="card-subtitle">
                    Saved on {new Date(mockTest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="card-body">
                <p>Click here to start taking this mock exam.</p>
              </div>
              <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary"
                  style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}
                >
                  Launch
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          {materialFilter
            ? <p>No tests found for this material yet. Go back to the Library and click "Create Test"!</p>
            : <p>No saved tests found. Go to the Library and click "Create Test" on a material first!</p>
          }
        </div>
      )}
    </div>
  );
};

export default SavedTests;
