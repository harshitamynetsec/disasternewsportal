import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
