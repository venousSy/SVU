import React from 'react';

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

export default Modal;
