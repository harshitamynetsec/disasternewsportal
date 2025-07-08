// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthManager, SessionManager, ActivityLogger, RateLimiter, isLockedOut, recordFailedAttempt, resetFailedAttempts, getAttemptsLeft, sanitizeInput } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

  // Initialize managers
  const authManager = new AuthManager();
  const sessionManager = new SessionManager();
  const activityLogger = new ActivityLogger();
  const rateLimiter = new RateLimiter();

  useEffect(() => {
    // Check for existing session on mount
    const session = sessionManager.getSession();
    if (session) {
      setIsAuthenticated(true);
      setUser(session.user);
      activityLogger.log('session_restored', { email: session.user.email });
      startSessionTimer(session.expiresAt);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Activity tracking
    const handleActivity = () => {
      if (isAuthenticated) {
        sessionManager.extendSession();
        const session = sessionManager.getSession();
        if (session) {
          startSessionTimer(session.expiresAt);
        }
      }
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated]);

  const startSessionTimer = (expiresAt) => {
    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, expiresAt - now);
      
      if (timeLeft === 0) {
        logout('session_expired');
        return;
      }
      
      setSessionTimeLeft(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  };

  const login = async (email, password) => {
    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      if (isLockedOut(sanitizedEmail)) {
        throw new Error('Account locked due to too many failed attempts. Try again later.');
      }
      // Rate limiting check
      if (!rateLimiter.isAllowed()) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Authenticate user
      authManager.authenticateUser(sanitizedEmail, sanitizedPassword);
      resetFailedAttempts(sanitizedEmail);
      // Create session
      const userData = { 
        email: sanitizedEmail, 
        loginTime: new Date().toISOString(),
        role: 'user' // You can expand this based on email or other logic
      };
      
      const session = sessionManager.createSession(userData);
      
      setIsAuthenticated(true);
      setUser(userData);
      
      // Log successful login
      activityLogger.log('login_success', { 
        email: sanitizedEmail, 
        timestamp: userData.loginTime 
      });
      
      startSessionTimer(session.expiresAt);
      
      return { success: true };
    } catch (error) {
      recordFailedAttempt(email);
      const attemptsLeft = getAttemptsLeft(email);
      // Log failed attempt
      activityLogger.log('login_failed', { 
        email, 
        error: error.message,
        attemptsLeft,
        timestamp: new Date().toISOString()
      });
      error.attemptsLeft = attemptsLeft;
      throw error;
    }
  };

  const logout = (reason = 'user_initiated') => {
    if (user) {
      activityLogger.log('logout', { 
        email: user.email, 
        reason,
        timestamp: new Date().toISOString()
      });
    }
    
    sessionManager.clearSession();
    setIsAuthenticated(false);
    setUser(null);
    setSessionTimeLeft(null);
  };

  const checkLockoutStatus = (email) => {
    return authManager.isLockedOut(email);
  };

  const getActivityLogs = () => {
    return activityLogger.getLogs();
  };

  const formatTimeLeft = (ms) => {
    if (!ms) return null;
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    sessionTimeLeft: formatTimeLeft(sessionTimeLeft),
    login,
    logout,
    checkLockoutStatus,
    getActivityLogs
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};