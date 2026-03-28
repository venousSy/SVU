import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container glass-panel">
      <Link to="/" className="header-logo">
        <span className="logo-icon">▲</span> SVU ConnectHub
      </Link>
      <nav className="header-nav">
        <Link to="/library" className="nav-link">Library</Link>
        <Link to="/saved-tests" className="nav-link">Saved Tests</Link>
        <Link to="/add" className="btn-primary" style={{ marginRight: '1rem', textDecoration: 'none' }}>+ Add</Link>
        <button className="btn-primary">Login</button>
      </nav>
    </header>
  );
};

export default Header;
