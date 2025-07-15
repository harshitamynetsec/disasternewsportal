// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const getTokenPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const payload = getTokenPayload(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      return jwtDecode(token);
    }
    localStorage.removeItem('token');
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // On mount, check for token validity
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      setUser(jwtDecode(token));
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};