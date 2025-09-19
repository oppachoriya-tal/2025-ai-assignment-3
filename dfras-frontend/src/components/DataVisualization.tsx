import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Assessment,
  Insights,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  Timeline,
  LocationOn,
  Schedule,
  People,
  Download,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { LineChart, PieChart, BarChart } from '@mui/x-charts';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

interface GeographicData {
  location: string;
  orders: number;
  failures: number;
  failureRate: number;
}

interface PerformanceMetrics {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

const DataVisualization: React.FC = () => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timeRange] = useState('30');
  const [selectedMetric] = useState('all');

  // Fetch real data from analytics service
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDashboardData(data);
      updateVisualizationData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update visualization data based on dropdown selections
  const updateVisualizationData = (data: any) => {
    if (!data) return;

    // Update chart data based on selected metric
    let chartLabels = [];
    let chartValues = [];
    let chartColors = [];

    switch (selectedMetric) {
      case 'status':
        chartLabels = data.orders_by_status?.map((item: any) => item.status) || [];
        chartValues = data.orders_by_status?.map((item: any) => item.count) || [];
        chartColors = ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0'];
        break;
      case 'state':
        chartLabels = data.orders_by_state?.map((item: any) => item.state) || [];
        chartValues = data.orders_by_state?.map((item: any) => item.count) || [];
        chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        break;
      case 'city':
        chartLabels = data.orders_by_city?.map((item: any) => item.city) || [];
        chartValues = data.orders_by_city?.map((item: any) => item.count) || [];
        chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        break;
      case 'failures':
        chartLabels = data.top_failure_reasons?.map((item: any) => item.reason) || [];
        chartValues = data.top_failure_reasons?.map((item: any) => item.count) || [];
        chartColors = ['#FF6B6B', '#FF8A80', '#FFAB91', '#FFCC02', '#FFD54F'];
        break;
      default:
        chartLabels = data.orders_by_status?.map((item: any) => item.status) || [];
        chartValues = data.orders_by_status?.map((item: any) => item.count) || [];
        chartColors = ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0'];
    }

    setChartData({
      labels: chartLabels,
      datasets: [{
        label: `${selectedMetric === 'all' ? 'Status' : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Distribution`,
        data: chartValues,
        backgroundColor: chartColors,
        borderWidth: 2
      }]
    });

    // Update time series data based on time range
    let timeData: any[] = [];
    if (data.daily_trends) {
      const days = parseInt(timeRange);
      const recentTrends = data.daily_trends.slice(-days);
      
      timeData = recentTrends.map((trend: any) => ({
        date: trend.date,
        value: trend.total_orders,
        category: 'Orders'
      }));
      
      // Add failure data
      const failureData = recentTrends.map((trend: any) => ({
        date: trend.date,
        value: trend.failed_orders,
        category: 'Failures'
      }));
      
      timeData = [...timeData, ...failureData];
    }
    setTimeSeriesData(timeData);

    // Update geographic data
    const geoData = data.orders_by_city?.map((item: any, index: number) => ({
      location: item.city,
      orders: item.count,
      failures: Math.floor(item.count * 0.2), // Estimate failures
      failureRate: 20.0 // Estimate failure rate
    })) || [];
    setGeographicData(geoData);

    // Update performance metrics
    const perfData = [
      { 
        metric: 'Success Rate', 
        value: data.success_rate || 0, 
        trend: 'up' as const, 
        change: 2.3, 
        unit: '%' 
      },
      { 
        metric: 'Total Orders', 
        value: data.total_orders || 0, 
        trend: 'up' as const, 
        change: 5.2, 
        unit: '' 
      },
      { 
        metric: 'Failed Orders', 
        value: data.failed_orders || 0, 
        trend: 'down' as const, 
        change: -1.2, 
        unit: '' 
      },
      { 
        metric: 'Total Revenue', 
        value: (data.total_revenue || 0) / 100000, 
        trend: 'up' as const, 
        change: 3.1, 
        unit: 'L' 
      }
    ];
    setPerformanceMetrics(perfData);
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      updateVisualizationData(dashboardData);
    }
  }, [selectedMetric, timeRange, dashboardData]);

  // Mock data for demonstration - in real implementation, this would come from API
  const mockChartData: ChartData = {
    labels: ['Delivered', 'Failed', 'In-Transit', 'Pending', 'Returned'],
    datasets: [{
      label: 'Order Status Distribution',
      data: [1250, 180, 95, 45, 30],
      backgroundColor: [
        '#4CAF50',
        '#F44336',
        '#FF9800',
        '#2196F3',
        '#9C27B0'
      ],
      borderWidth: 2
    }]
  };

  const mockTimeSeriesData: TimeSeriesData[] = [
    { date: '2025-01-01', value: 45, category: 'Orders' },
    { date: '2025-01-02', value: 52, category: 'Orders' },
    { date: '2025-01-03', value: 48, category: 'Orders' },
    { date: '2025-01-04', value: 61, category: 'Orders' },
    { date: '2025-01-05', value: 55, category: 'Orders' },
    { date: '2025-01-06', value: 67, category: 'Orders' },
    { date: '2025-01-07', value: 72, category: 'Orders' },
    { date: '2025-01-01', value: 8, category: 'Failures' },
    { date: '2025-01-02', value: 12, category: 'Failures' },
    { date: '2025-01-03', value: 6, category: 'Failures' },
    { date: '2025-01-04', value: 15, category: 'Failures' },
    { date: '2025-01-05', value: 9, category: 'Failures' },
    { date: '2025-01-06', value: 11, category: 'Failures' },
    { date: '2025-01-07', value: 14, category: 'Failures' }
  ];

  const mockGeographicData: GeographicData[] = [
    { location: 'Mumbai', orders: 450, failures: 45, failureRate: 10.0 },
    { location: 'Delhi', orders: 380, failures: 38, failureRate: 10.0 },
    { location: 'Bangalore', orders: 320, failures: 25, failureRate: 7.8 },
    { location: 'Chennai', orders: 280, failures: 22, failureRate: 7.9 },
    { location: 'Kolkata', orders: 250, failures: 30, failureRate: 12.0 },
    { location: 'Hyderabad', orders: 220, failures: 18, failureRate: 8.2 },
    { location: 'Pune', orders: 200, failures: 15, failureRate: 7.5 },
    { location: 'Ahmedabad', orders: 180, failures: 20, failureRate: 11.1 }
  ];

  const mockPerformanceMetrics: PerformanceMetrics[] = [
    { metric: 'On-Time Delivery Rate', value: 87.5, trend: 'up', change: 2.3, unit: '%' },
    { metric: 'Average Delivery Time', value: 1.8, trend: 'down', change: -0.2, unit: 'hours' },
    { metric: 'Customer Satisfaction', value: 4.2, trend: 'up', change: 0.1, unit: '/5' },
    { metric: 'Order Processing Time', value: 2.5, trend: 'down', change: -0.3, unit: 'hours' },
    { metric: 'Failure Rate', value: 11.2, trend: 'down', change: -1.5, unit: '%' },
    { metric: 'Warehouse Efficiency', value: 92.8, trend: 'up', change: 1.2, unit: '%' }
  ];

  const fetchVisualizationData = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from API
      // const response = await fetch(`/api/enhanced-analytics/visualization?timeRange=${timeRange}&metric=${selectedMetric}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChartData(mockChartData);
      setTimeSeriesData(mockTimeSeriesData);
      setGeographicData(mockGeographicData);
      setPerformanceMetrics(mockPerformanceMetrics);
      
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      showNotification('Error fetching visualization data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisualizationData();
  }, [timeRange, selectedMetric]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <Timeline color="info" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'info';
    }
  };

  const renderStatusDistribution = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Status Distribution
        </Typography>
        {chartData && (
          <Box>
            {(chartData?.labels || []).map((label, index) => {
              const value = chartData.datasets[0].data[index];
              const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = (value / total) * 100;
              
              return (
                <Box key={label} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{label}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {(value || 0).toLocaleString()}
                      </Typography>
                      <Chip
                        label={`${percentage.toFixed(1)}%`}
                        size="small"
                        color={label === 'Delivered' ? 'success' : label === 'Failed' ? 'error' : 'default'}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: chartData.datasets[0].backgroundColor?.[index] || '#1976d2'
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderTimeSeriesChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Orders & Failures Over Time
        </Typography>
        <Box sx={{ height: 300, overflow: 'auto' }}>
          {timeSeriesData.filter(d => d.category === 'Orders').map((data, index) => {
            const failureData = timeSeriesData.find(d => d.date === data.date && d.category === 'Failures');
            const failureRate = failureData ? (failureData.value / data.value) * 100 : 0;
            
            return (
              <Box key={data.date} mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">{new Date(data.date).toLocaleDateString()}</Typography>
                  <Box display="flex" gap={2}>
                    <Typography variant="body2">
                      Orders: {data.value}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Failures: {failureData?.value || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rate: {failureRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Box flex={1}>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{ height: 6, backgroundColor: 'rgba(0,0,0,0.1)' }}
                    />
                  </Box>
                  <Box flex={failureRate / 20} sx={{ maxWidth: '50%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{ height: 6, backgroundColor: 'rgba(244, 67, 54, 0.3)' }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );

  const renderGeographicAnalysis = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Geographic Performance Analysis
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Failures</TableCell>
                <TableCell align="right">Failure Rate</TableCell>
                <TableCell align="center">Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {geographicData.map((location) => (
                <TableRow key={location.location}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      {location.location}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{(location.orders || 0).toLocaleString()}</TableCell>
                  <TableCell align="right">{(location.failures || 0).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${location.failureRate.toFixed(1)}%`}
                      color={location.failureRate > 10 ? 'error' : location.failureRate > 8 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <LinearProgress
                      variant="determinate"
                      value={100 - location.failureRate}
                      sx={{ width: 60, height: 6 }}
                      color={location.failureRate > 10 ? 'error' : location.failureRate > 8 ? 'warning' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Grid container spacing={2}>
      {performanceMetrics.map((metric) => (
        <Grid item xs={12} sm={6} md={4} key={metric.metric}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  {metric.metric}
                </Typography>
                {getTrendIcon(metric.trend)}
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                {metric.value}{metric.unit}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={`${metric.change > 0 ? '+' : ''}${metric.change}${metric.unit}`}
                  color={getTrendColor(metric.trend)}
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  vs last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderFailureAnalysis = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Failure Analysis Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Top Failure Reasons
            </Typography>
            <Box>
              {[
                { reason: 'Stockout', count: 45, percentage: 25.0 },
                { reason: 'Weather Delay', count: 32, percentage: 17.8 },
                { reason: 'Traffic Congestion', count: 28, percentage: 15.6 },
                { reason: 'Address Incorrect', count: 22, percentage: 12.2 },
                { reason: 'Customer Unavailable', count: 18, percentage: 10.0 }
              ].map((item) => (
                <Box key={item.reason} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{item.reason}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.count}
                      </Typography>
                      <Chip label={`${item.percentage}%`} size="small" color="error" />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{ height: 6 }}
                    color="error"
                  />
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Failure Trends by Time
            </Typography>
            <Box>
              {[
                { time: 'Morning (6-12)', failures: 25, trend: 'up' },
                { time: 'Afternoon (12-18)', failures: 45, trend: 'down' },
                { time: 'Evening (18-24)', failures: 35, trend: 'stable' },
                { time: 'Night (0-6)', failures: 15, trend: 'down' }
              ].map((item) => (
                <Box key={item.time} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{item.time}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.failures}
                      </Typography>
                      {getTrendIcon(item.trend)}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.failures / 45) * 100}
                    sx={{ height: 6 }}
                    color="warning"
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const exportData = () => {
    const dataToExport = {
      chartData,
      timeSeriesData,
      geographicData,
      performanceMetrics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dfras-visualization-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Advanced Data Visualization
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportData}
            disabled={loading}
          >
            Export Data
          </Button>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchVisualizationData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls */}

      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<PieChartIcon />} label="Status Distribution" />
          <Tab icon={<LineChartIcon />} label="Time Series" />
          <Tab icon={<LocationOn />} label="Geographic" />
          <Tab icon={<BarChartIcon />} label="Performance" />
          <Tab icon={<Assessment />} label="Failure Analysis" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderStatusDistribution()}
      {activeTab === 1 && renderTimeSeriesChart()}
      {activeTab === 2 && renderGeographicAnalysis()}
      {activeTab === 3 && renderPerformanceMetrics()}
      {activeTab === 4 && renderFailureAnalysis()}
    </Box>
  );
};

export default DataVisualization;
