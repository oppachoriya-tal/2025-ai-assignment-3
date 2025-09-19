import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BugReport as DebugIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

const DebugTools: React.FC = () => {
  const [debugLogs, setDebugLogs] = useState([
    { id: '1', timestamp: '2024-01-15T10:30:00Z', level: 'INFO', message: 'System initialized successfully', service: 'API Gateway' },
    { id: '2', timestamp: '2024-01-15T10:29:45Z', level: 'DEBUG', message: 'Database connection established', service: 'PostgreSQL' },
    { id: '3', timestamp: '2024-01-15T10:29:30Z', level: 'WARNING', message: 'High memory usage detected', service: 'Analytics Service' },
    { id: '4', timestamp: '2024-01-15T10:29:15Z', level: 'ERROR', message: 'Failed to process request', service: 'Data Service' },
    { id: '5', timestamp: '2024-01-15T10:29:00Z', level: 'INFO', message: 'User authentication successful', service: 'API Gateway' }
  ]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [query, setQuery] = useState('');

  const { showSuccess, showError } = useNotification();

  const getLevelColor = (level: string) => {
    const colors = {
      INFO: '#2196f3',
      DEBUG: '#4caf50',
      WARNING: '#ff9800',
      ERROR: '#f44336'
    };
    return colors[level as keyof typeof colors] || '#666';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    showSuccess('Debug monitoring started');
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    showSuccess('Debug monitoring stopped');
  };

  const handleClearLogs = () => {
    setDebugLogs([]);
    showSuccess('Debug logs cleared');
  };

  const handleExecuteQuery = () => {
    if (!query.trim()) {
      showError('Please enter a debug query');
      return;
    }
    showSuccess(`Executing debug query: ${query}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Advanced debugging tools for system diagnostics and troubleshooting
      </Typography>

      {/* Debug Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Diagnostics
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleStartMonitoring}
                  disabled={isMonitoring}
                >
                  Start Monitoring
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={handleStopMonitoring}
                  disabled={!isMonitoring}
                >
                  Stop Monitoring
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleClearLogs}
                >
                  Clear Logs
                </Button>
              </Box>
              <Alert severity="info">
                Debug monitoring is {isMonitoring ? 'active' : 'inactive'}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Debug Query
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter debug query (e.g., SELECT * FROM users WHERE role='admin')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<CodeIcon />}
                onClick={handleExecuteQuery}
                fullWidth
              >
                Execute Query
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Debug Logs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Debug Logs
          </Typography>
          
          <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            <List>
              {debugLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" mb={1}>
                          <Chip
                            label={log.level}
                            size="small"
                            sx={{
                              backgroundColor: getLevelColor(log.level),
                              color: 'white',
                              mr: 2
                            }}
                          />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {log.service}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(log.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2">
                          {log.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < debugLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </CardContent>
      </Card>

      {/* System Information */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MemoryIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                2.1 GB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current memory consumption
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Response Time</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                45ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average API response time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">Active Issues</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issues requiring attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DebugTools;
