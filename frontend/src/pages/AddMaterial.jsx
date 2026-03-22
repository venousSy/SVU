import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { createMaterial } from '../services/materialService';
import './AddMaterial.css';

const AddMaterial = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    type: 'pdf'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createMaterial(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="add-material-container">
        <div className="add-material-form-panel glass-panel">
          <div>
            <h1 className="form-title">Add New Material</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Share resources with the SVU community.</p>
          </div>

          {error && <div className="error-message glass-panel" style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Advanced Calculus Notes" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief summary of the material..." />
            </div>

            <div className="form-group">
              <label>File URL</label>
              <input type="url" name="fileUrl" required value={formData.fileUrl} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="pdf">PDF Document</option>
                <option value="video">Video Lecture</option>
                <option value="doc">Word Document</option>
                <option value="image">Image/Diagram</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterial;
