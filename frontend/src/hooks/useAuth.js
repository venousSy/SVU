import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return { user, login, logout };
};
