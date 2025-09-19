import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Monitor as MonitorIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Cloud as CloudIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  port: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
}

const SystemMonitor: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    timestamp: new Date().toISOString()
  });
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: '2d 14h 32m',
      responseTime: 45,
      lastCheck: new Date().toISOString(),
      port: 8000
    },
    {
      name: 'Analytics Service',
      status: 'healthy',
      uptime: '2d 14h 30m',
      responseTime: 120,
      lastCheck: new Date().toISOString(),
      port: 8002
    },
    {
      name: 'Data Service',
      status: 'warning',
      uptime: '2d 14h 28m',
      responseTime: 250,
      lastCheck: new Date().toISOString(),
      port: 8001
    },
    {
      name: 'AI Query Service',
      status: 'healthy',
      uptime: '2d 14h 25m',
      responseTime: 180,
      lastCheck: new Date().toISOString(),
      port: 8010
    },
    {
      name: 'Admin Service',
      status: 'healthy',
      uptime: '2d 14h 20m',
      responseTime: 60,
      lastCheck: new Date().toISOString(),
      port: 8008
    },
    {
      name: 'PostgreSQL',
      status: 'healthy',
      uptime: '2d 14h 35m',
      responseTime: 15,
      lastCheck: new Date().toISOString(),
      port: 5432
    },
    {
      name: 'Redis',
      status: 'healthy',
      uptime: '2d 14h 33m',
      responseTime: 8,
      lastCheck: new Date().toISOString(),
      port: 6379
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSystemMetrics();
    if (autoRefresh) {
      const interval = setInterval(fetchSystemMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemMetrics = async () => {
    setLoading(true);
    try {
      // Simulate API call to fetch system metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic metrics
      const newMetrics: SystemMetrics = {
        cpu: Math.random() * 80 + 10, // 10-90%
        memory: Math.random() * 70 + 20, // 20-90%
        disk: Math.random() * 60 + 30, // 30-90%
        network: Math.random() * 50 + 10, // 10-60%
        timestamp: new Date().toISOString()
      };
      
      setSystemMetrics(newMetrics);
      
      // Update service response times
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(5, service.responseTime + (Math.random() - 0.5) * 20),
        lastCheck: new Date().toISOString()
      })));
      
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      showError('Failed to fetch system metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      healthy: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
      warning: <WarningIcon sx={{ color: '#ff9800' }} />,
      error: <ErrorIcon sx={{ color: '#f44336' }} />,
      unknown: <InfoIcon sx={{ color: '#666' }} />
    };
    return icons[status as keyof typeof icons] || <InfoIcon />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      healthy: 'success',
      warning: 'warning',
      error: 'error',
      unknown: 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getMetricColor = (value: number) => {
    if (value < 50) return '#4caf50';
    if (value < 80) return '#ff9800';
    return '#f44336';
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('API')) return <CloudIcon />;
    if (serviceName.includes('Analytics')) return <MonitorIcon />;
    if (serviceName.includes('Data')) return <DatabaseIcon />;
    if (serviceName.includes('AI')) return <SecurityIcon />;
    if (serviceName.includes('Admin')) return <SecurityIcon />;
    if (serviceName.includes('PostgreSQL') || serviceName.includes('Redis')) return <DatabaseIcon />;
    return <NetworkIcon />;
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;
  const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            System Monitor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time system performance and service health monitoring
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSystemMetrics}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "contained" : "outlined"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </Box>
      </Box>

      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">CPU Usage</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: getMetricColor(systemMetrics.cpu) }}>
                {systemMetrics.cpu.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.cpu}
                sx={{
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getMetricColor(systemMetrics.cpu)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MemoryIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: getMetricColor(systemMetrics.memory) }}>
                {systemMetrics.memory.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.memory}
                sx={{
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getMetricColor(systemMetrics.memory)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">Disk Usage</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: getMetricColor(systemMetrics.disk) }}>
                {systemMetrics.disk.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.disk}
                sx={{
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getMetricColor(systemMetrics.disk)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NetworkIcon sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                <Typography variant="h6">Network I/O</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: getMetricColor(systemMetrics.network) }}>
                {systemMetrics.network.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.network}
                sx={{
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getMetricColor(systemMetrics.network)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Health Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Service Health</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {healthyServices}/{totalServices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Services running healthy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Avg Response Time</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {avgResponseTime.toFixed(0)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average service response time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MonitorIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">System Load</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {((systemMetrics.cpu + systemMetrics.memory) / 2).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall system load
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Status Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Status
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Uptime</TableCell>
                    <TableCell>Response Time</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>Last Check</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getServiceIcon(service.name)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {service.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(service.status)}
                          label={service.status.toUpperCase()}
                          color={getStatusColor(service.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatUptime(service.uptime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {service.responseTime.toFixed(0)}ms
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {service.port}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Alerts
          </Typography>
          
          {systemMetrics.cpu > 80 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              High CPU usage detected: {systemMetrics.cpu.toFixed(1)}%
            </Alert>
          )}
          
          {systemMetrics.memory > 85 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              High memory usage detected: {systemMetrics.memory.toFixed(1)}%
            </Alert>
          )}
          
          {systemMetrics.disk > 90 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Critical disk usage: {systemMetrics.disk.toFixed(1)}%
            </Alert>
          )}
          
          {services.some(s => s.status === 'error') && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Some services are experiencing errors
            </Alert>
          )}
          
          {services.some(s => s.status === 'warning') && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Some services are showing warnings
            </Alert>
          )}
          
          {systemMetrics.cpu < 50 && systemMetrics.memory < 70 && systemMetrics.disk < 80 && 
           services.every(s => s.status === 'healthy') && (
            <Alert severity="success">
              All systems operating normally
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemMonitor;
