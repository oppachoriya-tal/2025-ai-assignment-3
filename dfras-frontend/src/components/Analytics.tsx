import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  BarChart,
  LineChart,
  PieChart
} from '@mui/x-charts';
import {
  TrendingUp,
  TrendingDown,
  Error,
  MonetizationOn
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PersonaDashboard from './PersonaDashboard';

interface FailureAnalysis {
  total_failures: number;
  failure_rate: number;
  failure_reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
    total_amount: number;
  }>;
  failures_by_state: Array<{
    state: string;
    count: number;
    percentage: number;
    total_amount: number;
  }>;
  failures_by_city: Array<{
    city: string;
    count: number;
    percentage: number;
    total_amount: number;
  }>;
  failures_by_client: Array<{
    client_name: string;
    count: number;
    percentage: number;
    total_amount: number;
  }>;
  temporal_patterns: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
  financial_impact: {
    total_failed_amount: number;
    avg_failed_amount: number;
    potential_revenue_loss: number;
  };
}

const Analytics: React.FC = () => {
  const [analysis, setAnalysis] = useState<FailureAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { showError } = useNotification();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // API Gateway port

  useEffect(() => {
    fetchFailureAnalysis();
  }, []);

  const fetchFailureAnalysis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      const response = await axios.get(`${API_BASE_URL}/api/analytics/failure-analysis?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAnalysis(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch failure analysis');
      showError('Failed to fetch failure analysis');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchFailureAnalysis}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return <Alert severity="info">No analysis data available</Alert>;
  }

  return (
    <PersonaDashboard>
      <Typography variant="h4" gutterBottom>
        Failure Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Comprehensive analysis of delivery failures and their root causes
      </Typography>


      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Error color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Failures
                  </Typography>
                  <Typography variant="h4">
                    {(analysis.total_failures || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingDown color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Failure Rate
                  </Typography>
                  <Typography variant="h4">
                    {(analysis?.failure_rate || 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MonetizationOn color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Lost Revenue
                  </Typography>
                  <Typography variant="h4">
                    ₹{(analysis.financial_impact?.total_failed_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Failed Amount
                  </Typography>
                  <Typography variant="h4">
                    ₹{(analysis.financial_impact?.avg_failed_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Failure Reasons Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failure Reasons Distribution
              </Typography>
              {analysis.failure_reasons && analysis.failure_reasons.length > 0 ? (
                <PieChart
                  series={[{
                    data: Array.isArray(analysis.failure_reasons) ? analysis.failure_reasons.map((reason, index) => ({
                      id: index,
                      value: reason.count,
                      label: reason.reason
                    })) : []
                  }]}
                  width={400}
                  height={300}
                />
              ) : (
                <Typography color="textSecondary">No failure reason data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Failures by State */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failures by State
              </Typography>
              {analysis.failures_by_state && analysis.failures_by_state.length > 0 ? (
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: Array.isArray(analysis.failures_by_state) ? analysis.failures_by_state.map(f => f.state) : []
                  }]}
                  series={[{
                    data: Array.isArray(analysis.failures_by_state) ? analysis.failures_by_state.map(f => f.count) : [],
                    label: 'Failures'
                  }]}
                  width={400}
                  height={300}
                />
              ) : (
                <Typography color="textSecondary">No state data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tables */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Top Failure Reasons Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Failure Reasons
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">%</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(analysis.failure_reasons) ? analysis.failure_reasons.slice(0, 10).map((reason, index) => (
                      <TableRow key={reason.reason}>
                        <TableCell>
                          <Typography variant="body2">
                            {index + 1}. {reason.reason}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={reason.count} size="small" color="error" />
                        </TableCell>
                        <TableCell align="right">
                          {reason.percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          ₹{(reason.total_amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="textSecondary">No failure reasons data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Failures by Client */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Failures by Client
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell align="right">Failures</TableCell>
                      <TableCell align="right">%</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(analysis.failures_by_client) ? analysis.failures_by_client.slice(0, 10).map((client) => (
                      <TableRow key={client.client_name}>
                        <TableCell>
                          <Typography variant="body2">
                            {client.client_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={client.count} size="small" color="error" />
                        </TableCell>
                        <TableCell align="right">
                          {client.percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          ₹{(client.total_amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="textSecondary">No client data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Temporal Patterns */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hourly Failure Patterns
              </Typography>
              {analysis.temporal_patterns && analysis.temporal_patterns.length > 0 ? (
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: Array.isArray(analysis.temporal_patterns) ? analysis.temporal_patterns.map(t => `${t.hour}:00`) : []
                  }]}
                  series={[{
                    data: Array.isArray(analysis.temporal_patterns) ? analysis.temporal_patterns.map(t => t.count) : [],
                    label: 'Failures'
                  }]}
                  width={800}
                  height={300}
                />
              ) : (
                <Typography color="textSecondary">No temporal pattern data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PersonaDashboard>
  );
};

export default Analytics;
