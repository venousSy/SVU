import React from 'react';
import './MaterialCard.css';

const MaterialCard = ({ title, description, type, author, date }) => {
  // Determine icon based on file type
  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'test': return '📝';
      default: return '📁';
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
        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View</button>
      </div>
    </div>
  );
};

export default MaterialCard;
