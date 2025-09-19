import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Analytics from './components/Analytics';
import DataIngestion from './components/DataIngestion';
import EnhancedAnalytics from './components/EnhancedAnalytics';
import DataVisualization from './components/DataVisualization';
import AIQueryAnalysis from './components/AIQueryAnalysis';
import SampleData from './components/SampleData';
import UserManagement from './components/UserManagement';
import SystemConfiguration from './components/SystemConfiguration';
import SecuritySettings from './components/SecuritySettings';
import AuditLogs from './components/AuditLogs';
import SystemMonitor from './components/SystemMonitor';
import BackupRestore from './components/BackupRestore';
import DebugTools from './components/DebugTools';
import SystemReports from './components/SystemReports';
import AdminNotifications from './components/AdminNotifications';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="data-ingestion" element={<DataIngestion />} />
                <Route path="sample-data" element={<SampleData />} />
                <Route path="enhanced-analytics" element={<EnhancedAnalytics />} />
                <Route path="data-visualization" element={<DataVisualization />} />
                <Route path="ai-query" element={<AIQueryAnalysis />} />
                <Route path="admin/users" element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } />
                <Route path="admin/config" element={
                  <AdminRoute>
                    <SystemConfiguration />
                  </AdminRoute>
                } />
                <Route path="admin/security" element={
                  <AdminRoute>
                    <SecuritySettings />
                  </AdminRoute>
                } />
                <Route path="admin/audit-logs" element={
                  <AdminRoute>
                    <AuditLogs />
                  </AdminRoute>
                } />
                <Route path="admin/system-monitor" element={
                  <AdminRoute>
                    <SystemMonitor />
                  </AdminRoute>
                } />
                <Route path="admin/backup" element={
                  <AdminRoute>
                    <BackupRestore />
                  </AdminRoute>
                } />
                <Route path="admin/debug" element={
                  <AdminRoute>
                    <DebugTools />
                  </AdminRoute>
                } />
                <Route path="admin/reports" element={
                  <AdminRoute>
                    <SystemReports />
                  </AdminRoute>
                } />
                <Route path="admin/notifications" element={
                  <AdminRoute>
                    <AdminNotifications />
                  </AdminRoute>
                } />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;