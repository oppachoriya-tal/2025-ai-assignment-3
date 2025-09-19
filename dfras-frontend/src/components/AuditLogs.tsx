import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Button,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip_address: string;
  user_agent: string;
  details: string;
  status: 'success' | 'failure';
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { showSuccess, showError } = useNotification();

  // Mock audit logs data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'admin',
      action: 'LOGIN',
      resource: '/api/auth/login',
      severity: 'info',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Successful login from admin account',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      user: 'operations_manager',
      action: 'CREATE_USER',
      resource: '/api/admin/users',
      severity: 'warning',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: 'Created new user account for fleet_manager role',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      user: 'unknown',
      action: 'LOGIN_FAILED',
      resource: '/api/auth/login',
      severity: 'error',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
      details: 'Failed login attempt with invalid credentials',
      status: 'failure'
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:15:00Z',
      user: 'admin',
      action: 'UPDATE_CONFIG',
      resource: '/api/admin/config',
      severity: 'info',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Updated system configuration: session_timeout',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:10:00Z',
      user: 'data_analyst',
      action: 'DATA_EXPORT',
      resource: '/api/analytics/export',
      severity: 'warning',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: 'Exported sensitive analytics data',
      status: 'success'
    },
    {
      id: '6',
      timestamp: '2024-01-15T10:05:00Z',
      user: 'unknown',
      action: 'UNAUTHORIZED_ACCESS',
      resource: '/api/admin/users',
      severity: 'critical',
      ip_address: '192.168.1.104',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      details: 'Attempted unauthorized access to admin endpoints',
      status: 'failure'
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, severityFilter, actionFilter, userFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredLogs = [...mockLogs];
      
      if (severityFilter) {
        filteredLogs = filteredLogs.filter(log => log.severity === severityFilter);
      }
      
      if (actionFilter) {
        filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(actionFilter.toLowerCase()));
      }
      
      if (userFilter) {
        filteredLogs = filteredLogs.filter(log => log.user.toLowerCase().includes(userFilter.toLowerCase()));
      }
      
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      info: <InfoIcon sx={{ color: '#2196f3' }} />,
      warning: <WarningIcon sx={{ color: '#ff9800' }} />,
      error: <ErrorIcon sx={{ color: '#f44336' }} />,
      critical: <SecurityIcon sx={{ color: '#9c27b0' }} />
    };
    return icons[severity as keyof typeof icons] || <InfoIcon />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: '#2196f3',
      warning: '#ff9800',
      error: '#f44336',
      critical: '#9c27b0'
    };
    return colors[severity as keyof typeof colors] || '#666';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <PersonIcon />;
    if (action.includes('CONFIG')) return <SettingsIcon />;
    if (action.includes('USER')) return <PersonIcon />;
    return <HistoryIcon />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
  };

  const handleExportLogs = () => {
    try {
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'IP Address', 'Status', 'Details'],
        ...logs.map(log => [
          log.timestamp,
          log.user,
          log.action,
          log.resource,
          log.severity,
          log.ip_address,
          log.status,
          log.details
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showSuccess('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      showError('Failed to export audit logs');
    }
  };

  const filteredLogs = logs.slice((page - 1) * 10, page * 10);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Monitor system activities, user actions, and security events
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="User"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchLogs}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportLogs}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Resource</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(log.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {log.user}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getActionIcon(log.action)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {log.action}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {log.resource}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(log.severity)}
                            label={log.severity.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getSeverityColor(log.severity),
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {log.ip_address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status.toUpperCase()}
                            size="small"
                            color={log.status === 'success' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(log)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredLogs.length === 0 && (
                <Box textAlign="center" p={3}>
                  <Typography variant="body2" color="text.secondary">
                    No audit logs found
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="log-details-title"
      >
        <DialogTitle id="log-details-title">
          Audit Log Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Timestamp</Typography>
                  <Typography variant="body1">{formatDate(selectedLog.timestamp)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">User</Typography>
                  <Typography variant="body1">{selectedLog.user}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Action</Typography>
                  <Typography variant="body1">{selectedLog.action}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Resource</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.resource}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Severity</Typography>
                  <Chip
                    icon={getSeverityIcon(selectedLog.severity)}
                    label={selectedLog.severity.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getSeverityColor(selectedLog.severity),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedLog.status.toUpperCase()}
                    size="small"
                    color={selectedLog.status === 'success' ? 'success' : 'error'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">IP Address</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.ip_address}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">User Agent</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedLog.user_agent}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Details</Typography>
                  <Typography variant="body1">{selectedLog.details}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;
