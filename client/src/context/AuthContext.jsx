import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [character, setCharacter] = useState(() => JSON.parse(localStorage.getItem('character') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (character) localStorage.setItem('character', JSON.stringify(character));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('character');
    }
  }, [token, user, character]);

  const api = async (path, options = {}) => {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    if (res.status === 401) {
      logout();
    }
    return res;
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    setUser(data.user);
    setCharacter(data.character);
    return data;
  };

  const register = async (email, username, password, characterName) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, characterName: characterName || username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Registration failed');
    setToken(data.token);
    setUser(data.user);
    setCharacter(data.character);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCharacter(null);
  };

  const updateCharacter = (next) => {
    setCharacter((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const refreshProfile = async () => {
    if (!token) return;
    const res = await api('/user/profile');
    if (res.ok) {
      const { character: c } = await res.json();
      setCharacter(c);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, character, loading, login, register, logout, api, updateCharacter, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
