import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if we have a token in localStorage as a fallback
  const hasToken = token || localStorage.getItem('token');
  
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token but no user (due to network issues), still allow access
  // The user data will be restored when the network is available
  if (!user && hasToken) {
    console.log('User data temporarily unavailable, but token exists. Allowing access.');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
