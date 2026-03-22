import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { createMaterial, uploadFile } from '../services/materialService';
import './AddMaterial.css';

const AddMaterial = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return setError('Please select a file to upload.');
    }

    try {
      setLoading(true);
      setError(null);
      
      // 1. Upload the file to S3
      const uploadResponse = await uploadFile(file);
      const fileUrl = uploadResponse.fileUrl;

      // 2. Create the material document in the DB
      await createMaterial({ ...formData, fileUrl });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload material');
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
              <label>Resource File</label>
              <input 
                type="file" 
                required 
                onChange={(e) => setFile(e.target.files[0])} 
                accept=".pdf,.doc,.docx,.jpg,.png,.mp4" 
              />
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
              {loading ? 'Uploading...' : 'Add Material'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterial;
