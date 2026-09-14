import { createContext, useContext, useMemo, useState } from 'react';
import client, { apiErrorMessage } from '../api/client';

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('pp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('pp_token'));

  function persist(authResponse) {
    const nextUser = {
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
    };
    localStorage.setItem('pp_token', authResponse.token);
    localStorage.setItem('pp_user', JSON.stringify(nextUser));
    setToken(authResponse.token);
    setUser(nextUser);
    return nextUser;
  }

  async function login(email, password) {
    try {
      const { data } = await client.post('/api/auth/login', { email, password });
      return persist(data);
    } catch (e) {
      throw new Error(apiErrorMessage(e, 'Invalid email or password'));
    }
  }

  async function register(fullName, email, password, role) {
    try {
      const { data } = await client.post('/api/auth/register', { fullName, email, password, role });
      return persist(data);
    } catch (e) {
      throw new Error(apiErrorMessage(e, 'Could not create account'));
    }
  }

  function logout() {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
