import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MaterialCard from '../components/MaterialCard';
import { fetchMaterials } from '../services/materialService';
import './ResourceLibrary.css';

const ResourceLibrary = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async (query = '') => {
    try {
      setLoading(true);
      const data = await fetchMaterials(query);
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch materials from the actual server. Make sure MongoDB and Node are running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    loadMaterials(query);
  };

  return (
    <div className="library-container">
      <Header />
      
      <div className="library-header">
        <h1 className="library-title">Resource Library</h1>
        <p className="library-subtitle">Find study materials, summaries, and AI-generated mock tests to ace your next SVU exam.</p>
      </div>

      <SearchBar onSearch={handleSearch} />
      
      {loading ? (
        <div className="empty-state glass-panel">
          <p>Loading database resources...</p>
        </div>
      ) : error ? (
        <div className="empty-state glass-panel" style={{ color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : materials.length > 0 ? (
        <div className="materials-grid">
          {materials.map((mat) => (
            <MaterialCard
              key={mat._id}
              title={mat.title}
              description={mat.description}
              type={mat.type || (mat.fileUrl && mat.fileUrl.endsWith('.mp4') ? 'video' : 'pdf')}
              author={mat.uploadedBy?.name || 'Admin User'}
              date={new Date(mat.createdAt).toLocaleDateString() || 'Recently'}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <p>No materials found in the database. Try adjusting your search query!</p>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
