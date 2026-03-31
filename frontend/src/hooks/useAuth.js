import { useState, useEffect } from 'react';

/**
 * Returns the current authenticated user (from localStorage) and helpers.
 * Re-reads from storage on mount so it reflects the latest login state.
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Sync if storage changes in another tab
    const handleStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isLoggedIn = !!user;

  return { user, isLoggedIn };
};
