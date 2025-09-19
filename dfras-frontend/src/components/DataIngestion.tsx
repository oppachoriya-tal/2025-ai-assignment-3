import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Refresh,
  CheckCircle,
  Error,
  Info,
  Assessment,
  DataUsage,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PersonaDashboard from './PersonaDashboard';

interface IngestionStatus {
  status: string;
  data_counts: Record<string, number>;
  timestamp: string;
}

interface DataQualityReport {
  status: string;
  data_quality_report: {
    orders: {
      total_orders: number;
      failed_orders: number;
      orders_with_failure_reason: number;
      delivered_orders: number;
      inconsistent_delivery_status: number;
      data_completeness: number;
    };
    warehouse_logs: {
      total_logs: number;
      logs_with_picking_start: number;
      logs_with_picking_end: number;
      logs_with_dispatch_time: number;
      completeness_score: number;
    };
    fleet_logs: {
      total_logs: number;
      logs_with_departure: number;
      logs_with_arrival: number;
      logs_with_vehicle: number;
      completeness_score: number;
    };
  };
  timestamp: string;
}

const DataIngestion: React.FC = () => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null);
  const [dataQualityReport, setDataQualityReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('');

  const fetchIngestionStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/data-ingestion/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setIngestionStatus(data);
    } catch (error) {
      console.error('Error fetching ingestion status:', error);
      showNotification('Error fetching ingestion status', 'error');
    }
  };

  const fetchDataQualityReport = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/data-ingestion/data-quality`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDataQualityReport(data);
    } catch (error) {
      console.error('Error fetching data quality report:', error);
      showNotification('Error fetching data quality report', 'error');
    }
  };

  const ingestSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/data-ingestion/sample-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'completed') {
        showNotification('Sample data ingested successfully!', 'success');
        await fetchIngestionStatus();
        await fetchDataQualityReport();
      } else {
        showNotification('Error ingesting sample data', 'error');
      }
    } catch (error) {
      console.error('Error ingesting sample data:', error);
      showNotification('Error ingesting sample data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/data-ingestion/clear-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          showNotification('Data cleared successfully', 'success');
          await fetchIngestionStatus();
          await fetchDataQualityReport();
        } else {
          showNotification('Error clearing data', 'error');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Error clearing data', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !tableName) {
      showNotification('Please select a file and specify table name', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('table_name', tableName);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/data-ingestion/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification(`File "${selectedFile.name}" uploaded and ingested successfully!`, 'success');
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setTableName('');
        await fetchIngestionStatus();
        await fetchDataQualityReport();
      } else {
        showNotification('Error uploading file', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Error uploading file', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngestionStatus();
    fetchDataQualityReport();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <PersonaDashboard>
      <Typography variant="h4" gutterBottom>
        Data Ingestion & Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Data Status Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Data Status Overview</Typography>
                <Box>
                  <Tooltip title="Refresh Status">
                    <IconButton onClick={fetchIngestionStatus} disabled={loading}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {ingestionStatus && (
                <Grid container spacing={2}>
                  {Object.entries(ingestionStatus.data_counts || {}).length > 0 ? Object.entries(ingestionStatus.data_counts || {}).map(([table, count]) => (
                    <Grid item xs={6} sm={4} md={2} key={table}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {typeof count === 'number' ? count.toLocaleString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {table.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Typography color="textSecondary" textAlign="center">
                        No data counts available
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Quality Report */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Data Quality Report</Typography>
                <Tooltip title="Refresh Quality Report">
                  <IconButton onClick={fetchDataQualityReport} disabled={loading}>
                    <Assessment />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {dataQualityReport && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Orders Data Quality
                      </Typography>
                      <Box mb={1}>
                        <Typography variant="body2">
                          Total Orders: {(dataQualityReport.data_quality_report?.orders?.total_orders || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Failed Orders: {(dataQualityReport.data_quality_report?.orders?.failed_orders || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          With Failure Reason: {(dataQualityReport.data_quality_report?.orders?.orders_with_failure_reason || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${dataQualityReport.data_quality_report?.orders?.data_completeness || 0}% Complete`}
                        color={getCompletenessColor(dataQualityReport.data_quality_report?.orders?.data_completeness || 0)}
                        size="small"
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Warehouse Logs Quality
                      </Typography>
                      <Box mb={1}>
                        <Typography variant="body2">
                          Total Logs: {(dataQualityReport.data_quality_report?.warehouse_logs?.total_logs || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          With Picking Times: {(dataQualityReport.data_quality_report?.warehouse_logs?.logs_with_picking_start || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          With Dispatch Time: {(dataQualityReport.data_quality_report?.warehouse_logs?.logs_with_dispatch_time || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${dataQualityReport.data_quality_report?.warehouse_logs?.completeness_score || 0}% Complete`}
                        color={getCompletenessColor(dataQualityReport.data_quality_report?.warehouse_logs?.completeness_score || 0)}
                        size="small"
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Fleet Logs Quality
                      </Typography>
                      <Box mb={1}>
                        <Typography variant="body2">
                          Total Logs: {(dataQualityReport.data_quality_report?.fleet_logs?.total_logs || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          With Departure: {(dataQualityReport.data_quality_report?.fleet_logs?.logs_with_departure || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          With Arrival: {(dataQualityReport.data_quality_report?.fleet_logs?.logs_with_arrival || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${dataQualityReport.data_quality_report?.fleet_logs?.completeness_score || 0}% Complete`}
                        color={getCompletenessColor(dataQualityReport.data_quality_report?.fleet_logs?.completeness_score || 0)}
                        size="small"
                      />
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Management Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<DataUsage />}
                  onClick={ingestSampleData}
                  disabled={loading}
                >
                  Ingest Sample Data
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialogOpen(true)}
                  disabled={loading}
                >
                  Upload CSV File
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Error />}
                  onClick={clearData}
                  disabled={loading}
                >
                  Clear All Data
                </Button>
              </Box>
              
              {loading && (
                <Box mt={2}>
                  <LinearProgress />
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Processing data...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="upload-dialog-title"
        aria-describedby="upload-dialog-description"
      >
        <DialogTitle id="upload-dialog-title">Upload CSV File</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography id="upload-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a CSV file to upload and specify the target table name for data ingestion.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                type="file"
                inputProps={{ accept: '.csv' }}
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  setSelectedFile(file || null);
                }}
                sx={{ mb: 1 }}
              />
              {selectedFile && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Selected file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </Alert>
              )}
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Target Table</InputLabel>
              <Select
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                label="Target Table"
              >
                <MenuItem value="orders">Orders</MenuItem>
                <MenuItem value="clients">Clients</MenuItem>
                <MenuItem value="warehouses">Warehouses</MenuItem>
                <MenuItem value="drivers">Drivers</MenuItem>
                <MenuItem value="warehouse_logs">Warehouse Logs</MenuItem>
                <MenuItem value="fleet_logs">Fleet Logs</MenuItem>
                <MenuItem value="external_factors">External Factors</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
              </Select>
            </FormControl>
            
            {selectedFile && tableName && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Ready to upload <strong>{selectedFile.name}</strong> to <strong>{tableName}</strong> table
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={uploadFile} 
            variant="contained" 
            disabled={!selectedFile || !tableName || loading}
            startIcon={<CloudUpload />}
          >
            {loading ? 'Uploading...' : 'Upload & Ingest'}
          </Button>
        </DialogActions>
      </Dialog>
    </PersonaDashboard>
  );
};

export default DataIngestion;
