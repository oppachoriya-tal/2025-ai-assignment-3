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
  AccordionDetails
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
  Info
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PersonaDashboard from './PersonaDashboard';

interface AdvancedDashboard {
  status: string;
  metrics: {
    status_distribution: Record<string, number>;
    failure_reasons: Record<string, number>;
    daily_trends: Record<string, number>;
    hourly_patterns: Record<string, number>;
    day_of_week_patterns: Record<string, number>;
    geographic_analysis: Record<string, any>;
    performance_metrics: {
      avg_delivery_delay_hours: number;
      median_delivery_delay_hours: number;
      on_time_delivery_rate: number;
      total_delivered_orders: number;
    };
    external_factors_analysis: Record<string, any>;
    customer_satisfaction: any;
  };
  data_points: number;
  timestamp: string;
}

interface FailurePatterns {
  status: string;
  patterns: {
    temporal: {
      hourly_failures: Record<string, number>;
      daily_failures: Record<string, number>;
      monthly_failures: Record<string, number>;
    };
    geographic: Record<string, number>;
    failure_reasons: Record<string, number>;
    warehouse_patterns: Record<string, any>;
    driver_patterns: Record<string, any>;
    external_factors_correlation: Record<string, any>;
    process_times: {
      avg_picking_duration_minutes: number;
      picking_duration_distribution: Record<string, number>;
    };
  };
  total_failures: number;
  timestamp: string;
}

interface PerformanceMetrics {
  status: string;
  metrics: {
    delivery_performance: {
      total_delivered: number;
      avg_delivery_delay_hours: number;
      median_delivery_delay_hours: number;
      on_time_delivery_rate: number;
      delivery_delay_distribution: Record<string, number>;
    };
    warehouse_performance: Record<string, any>;
    driver_performance: Record<string, any>;
    process_efficiency: {
      avg_picking_duration_minutes: number;
      picking_duration_distribution: Record<string, number>;
    };
    customer_satisfaction: {
      avg_rating: number;
      rating_distribution: Record<string, number>;
      sentiment_distribution: Record<string, number>;
    };
  };
  data_points: number;
  timestamp: string;
}

interface Insights {
  status: string;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
    recommendation: string;
    impact: string;
  }>;
  generated_at: string;
  data_points_analyzed: number;
}

const EnhancedAnalytics: React.FC = () => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [advancedDashboard, setAdvancedDashboard] = useState<AdvancedDashboard | null>(null);
  const [failurePatterns, setFailurePatterns] = useState<FailurePatterns | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);

  const fetchAdvancedDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8004/api/enhanced-analytics/advanced-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAdvancedDashboard(data);
    } catch (error) {
      console.error('Error fetching advanced dashboard:', error);
      showNotification('Error fetching advanced dashboard', 'error');
    }
  };

  const fetchFailurePatterns = async () => {
    try {
      const response = await fetch('http://localhost:8004/api/enhanced-analytics/failure-patterns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setFailurePatterns(data);
    } catch (error) {
      console.error('Error fetching failure patterns:', error);
      showNotification('Error fetching failure patterns', 'error');
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8004/api/enhanced-analytics/performance-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      showNotification('Error fetching performance metrics', 'error');
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:8004/api/enhanced-analytics/insights', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      showNotification('Error fetching insights', 'error');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdvancedDashboard(),
        fetchFailurePatterns(),
        fetchPerformanceMetrics(),
        fetchInsights()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getSeverityColor = (severity: string): 'success' | 'info' | 'warning' | 'error' => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getAlertSeverity = (severity: string): 'success' | 'info' | 'warning' | 'error' => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <Error />;
      case 'medium': return <Warning />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const renderAdvancedDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Performance Indicators
            </Typography>
            {advancedDashboard?.metrics?.performance_metrics && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {(advancedDashboard.metrics?.performance_metrics?.total_delivered_orders || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Delivered Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={(advancedDashboard.metrics?.performance_metrics?.on_time_delivery_rate || 0) >= 80 ? 'success.main' : 'warning.main'}>
                      {(advancedDashboard.metrics?.performance_metrics?.on_time_delivery_rate || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      On-Time Delivery Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={(advancedDashboard.metrics?.performance_metrics?.avg_delivery_delay_hours || 0) <= 2 ? 'success.main' : 'error.main'}>
                      {(advancedDashboard.metrics?.performance_metrics?.avg_delivery_delay_hours || 0).toFixed(1)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Delivery Delay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {(advancedDashboard?.data_points || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Data Points
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            {advancedDashboard?.metrics?.status_distribution && (
              <Box>
                {Object.entries(advancedDashboard.metrics?.status_distribution || {}).length > 0 ? Object.entries(advancedDashboard.metrics?.status_distribution || {}).map(([status, count]) => (
                  <Box key={status} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2">{(count || 0).toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / Object.values(advancedDashboard.metrics?.status_distribution || {}).reduce((a, b) => a + b, 0)) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )) : (
                  <Typography color="textSecondary">No status distribution data available</Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Failure Reasons */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Failure Reasons
            </Typography>
            {advancedDashboard?.metrics?.failure_reasons && (
              <Box>
                {Object.entries(advancedDashboard.metrics?.failure_reasons || {}).length > 0 ? Object.entries(advancedDashboard.metrics?.failure_reasons || {}).slice(0, 5).map(([reason, count]) => (
                  <Box key={reason} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{reason}</Typography>
                      <Typography variant="body2">{(count || 0).toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / Object.values(advancedDashboard.metrics?.failure_reasons || {}).reduce((a, b) => a + b, 0)) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )) : (
                  <Typography color="textSecondary">No failure reasons data available</Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Geographic Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Geographic Performance Analysis
            </Typography>
            {advancedDashboard?.metrics?.geographic_analysis && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell align="right">Total Orders</TableCell>
                      <TableCell align="right">Failed Orders</TableCell>
                      <TableCell align="right">Failure Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(advancedDashboard.metrics?.geographic_analysis || {}).length > 0 ? Object.entries(advancedDashboard.metrics?.geographic_analysis || {}).slice(0, 10).map(([location, data]: [string, any]) => (
                      <TableRow key={location}>
                        <TableCell>{location}</TableCell>
                        <TableCell align="right">{(data.total_orders || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">{(data.failed_orders || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${((data.failed_orders / data.total_orders) * 100).toFixed(1)}%`}
                            color={data.failed_orders / data.total_orders > 0.2 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="textSecondary">No geographic data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFailurePatterns = () => (
    <Grid container spacing={3}>
      {/* Temporal Patterns */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hourly Failure Patterns
            </Typography>
            {failurePatterns?.patterns?.temporal?.hourly_failures && (
              <Box>
                {Object.entries(failurePatterns.patterns?.temporal?.hourly_failures || {}).length > 0 ? Object.entries(failurePatterns.patterns?.temporal?.hourly_failures || {}).map(([hour, count]) => (
                  <Box key={hour} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{hour}:00</Typography>
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / Math.max(...Object.values(failurePatterns.patterns?.temporal?.hourly_failures || {}))) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )) : (
                  <Typography color="textSecondary">No hourly failure data available</Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Daily Patterns */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Failure Patterns
            </Typography>
            {failurePatterns?.patterns?.temporal?.daily_failures && (
              <Box>
                {Object.entries(failurePatterns.patterns?.temporal?.daily_failures || {}).length > 0 ? Object.entries(failurePatterns.patterns?.temporal?.daily_failures || {}).map(([day, count]) => (
                  <Box key={day} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{day}</Typography>
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / Math.max(...Object.values(failurePatterns.patterns?.temporal?.daily_failures || {}))) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )) : (
                  <Typography color="textSecondary">No daily failure data available</Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Process Times */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Process Efficiency Analysis
            </Typography>
            {failurePatterns?.patterns.process_times && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {(failurePatterns.patterns?.process_times?.avg_picking_duration_minutes || 0).toFixed(1)}m
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Picking Duration
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Picking Duration Distribution
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      Min: {(failurePatterns.patterns?.process_times?.picking_duration_distribution?.min || 0).toFixed(1)}m
                    </Typography>
                    <Typography variant="body2">
                      Max: {(failurePatterns.patterns?.process_times?.picking_duration_distribution?.max || 0).toFixed(1)}m
                    </Typography>
                    <Typography variant="body2">
                      Std Dev: {(failurePatterns.patterns?.process_times?.picking_duration_distribution?.std || 0).toFixed(1)}m
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPerformanceMetrics = () => (
    <Grid container spacing={3}>
      {/* Delivery Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Delivery Performance Metrics
            </Typography>
            {performanceMetrics?.metrics.delivery_performance && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {(performanceMetrics.metrics.delivery_performance.total_delivered || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Delivered
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={performanceMetrics.metrics.delivery_performance.on_time_delivery_rate >= 80 ? 'success.main' : 'warning.main'}>
                      {performanceMetrics.metrics.delivery_performance.on_time_delivery_rate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      On-Time Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={performanceMetrics.metrics.delivery_performance.avg_delivery_delay_hours <= 2 ? 'success.main' : 'error.main'}>
                      {performanceMetrics.metrics.delivery_performance.avg_delivery_delay_hours.toFixed(1)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Delay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {performanceMetrics.metrics.delivery_performance.median_delivery_delay_hours.toFixed(1)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Median Delay
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Satisfaction */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Satisfaction Metrics
            </Typography>
            {performanceMetrics?.metrics.customer_satisfaction && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={performanceMetrics.metrics.customer_satisfaction.avg_rating >= 4 ? 'success.main' : 'warning.main'}>
                      {performanceMetrics.metrics.customer_satisfaction.avg_rating.toFixed(1)}/5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rating Distribution
                  </Typography>
                  {Object.entries(performanceMetrics.metrics.customer_satisfaction.rating_distribution || {}).length > 0 ? Object.entries(performanceMetrics.metrics.customer_satisfaction.rating_distribution || {}).map(([rating, count]) => (
                    <Box key={rating} mb={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{rating} Stars</Typography>
                        <Typography variant="body2">{count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / Object.values(performanceMetrics.metrics.customer_satisfaction.rating_distribution).reduce((a, b) => a + b, 0)) * 100}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  )) : (
                    <Typography color="textSecondary">No rating distribution data available</Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          AI-Generated Insights & Recommendations
        </Typography>
        {insights?.insights && (
          <Box>
            {Array.isArray(insights.insights) ? insights.insights.map((insight, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getSeverityIcon(insight.severity)}
                    <Typography variant="subtitle1">{insight.title}</Typography>
                    <Chip
                      label={insight.severity.toUpperCase()}
                      color={getSeverityColor(insight.severity)}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" paragraph>
                      {insight.description}
                    </Typography>
                    <Alert severity={getAlertSeverity(insight.severity)} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendation:
                      </Typography>
                      <Typography variant="body2">
                        {insight.recommendation}
                      </Typography>
                    </Alert>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Impact:</strong> {insight.impact}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )) : (
              <Typography color="textSecondary">No insights available</Typography>
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );

  return (
    <PersonaDashboard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Enhanced Analytics & Insights
        </Typography>
        <Tooltip title="Refresh All Data">
          <IconButton onClick={refreshData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Assessment />} label="Advanced Dashboard" />
          <Tab icon={<Error />} label="Failure Patterns" />
          <Tab icon={<TrendingUp />} label="Performance Metrics" />
          <Tab icon={<Insights />} label="AI Insights" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderAdvancedDashboard()}
      {activeTab === 1 && renderFailurePatterns()}
      {activeTab === 2 && renderPerformanceMetrics()}
      {activeTab === 3 && renderInsights()}
    </PersonaDashboard>
  );
};

export default EnhancedAnalytics;
