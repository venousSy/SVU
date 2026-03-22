import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="search-container">
      <form className="search-wrapper" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Search study materials, tests..."
          value={query}
          onChange={handleInputChange}
        />
        <span className="search-icon">🔍</span>
      </form>
    </div>
  );
};

export default SearchBar;
