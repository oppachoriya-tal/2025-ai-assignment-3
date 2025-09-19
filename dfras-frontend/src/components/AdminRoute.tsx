import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
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

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AdminIcon sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
              <Typography variant="h5" color="error">
                Access Denied
              </Typography>
            </Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              You do not have permission to access this page. Admin privileges are required.
            </Alert>
            <Typography variant="body1" color="text.secondary">
              This section is restricted to system administrators only. Please contact your system administrator if you believe you should have access to this functionality.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
