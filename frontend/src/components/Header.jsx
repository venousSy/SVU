import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header-container glass-panel">
      <Link to="/" className="header-logo">
        <span className="logo-icon">▲</span> SVU ConnectHub
      </Link>
      <nav className="header-nav">
        <Link to="/library" className="nav-link">Library</Link>
        <Link to="/saved-tests" className="nav-link">Saved Tests</Link>
        <Link to="/add" className="btn-primary" style={{ marginRight: '1rem', textDecoration: 'none' }}>+ Add</Link>
        {user ? (
          <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <span style={{ fontWeight: 500 }}>{user.name}</span>
             <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
