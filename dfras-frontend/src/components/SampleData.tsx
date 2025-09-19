import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface SampleDataProps {}

const SampleData: React.FC<SampleDataProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState<string>('');
  const { user } = useAuth();

  const dataTypes = [
    { label: 'Clients', key: 'clients', icon: '👥' },
    { label: 'Drivers', key: 'drivers', icon: '🚗' },
    { label: 'Orders', key: 'orders', icon: '📦' },
    { label: 'Warehouses', key: 'warehouses', icon: '🏢' },
    { label: 'Fleet Logs', key: 'fleet_logs', icon: '🚛' },
    { label: 'Warehouse Logs', key: 'warehouse_logs', icon: '📋' },
    { label: 'External Factors', key: 'external_factors', icon: '🌦️' },
    { label: 'Customer Feedback', key: 'feedback', icon: '💬' }
  ];

  const fetchSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new (Error as any)('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/analytics/sample-data?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new (Error as any)(`Failed to fetch sample data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || {});
      setDataSource(result.data_source || 'Unknown');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sample data');
      console.error('Error fetching sample data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSampleData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm('');
  };

  const handleRefresh = () => {
    fetchSampleData();
  };

  const getFilteredData = (dataType: string) => {
    const dataValue = data[dataType];
    // Ensure we always have an array
    const dataArray = Array.isArray(dataValue) ? dataValue : [];
    if (!searchTerm) return dataArray;
    
    return dataArray.filter((item: any) => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getTableHeaders = (dataType: string) => {
    const dataValue = data[dataType];
    // Ensure we always have an array
    const dataArray = Array.isArray(dataValue) ? dataValue : [];
    if (dataArray.length === 0) return [];
    
    // Add null/undefined check for the first element
    const firstElement = dataArray[0];
    if (!firstElement || typeof firstElement !== 'object') return [];
    
    return Object.keys(firstElement);
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getStatusChip = (dataType: string) => {
    const count = data[dataType]?.length || 0;
    const color = count > 0 ? 'success' : 'error';
    return <Chip label={`${count} records`} color={color} size="small" />;
  };

  const handleExport = (dataType: string) => {
    const dataArray = data[dataType] || [];
    if (dataArray.length === 0) return;
    
    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(','),
      ...dataArray.map((row: any) => 
        headers.map(header => `"${formatCellValue(row[header])}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}_sample_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading sample data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              📊 Sample Data Explorer
            </Typography>
            {dataSource && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                Data Source: <strong>{dataSource}</strong>
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {dataTypes.map((dataType) => (
            <Grid item xs={12} sm={6} md={3} key={dataType.key}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {dataType.icon} {dataType.label}
                  </Typography>
                  {getStatusChip(dataType.key)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {dataTypes.map((dataType, index) => (
            <Tab 
              key={dataType.key}
              label={`${dataType.icon} ${dataType.label}`}
              icon={getStatusChip(dataType.key)}
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {dataTypes.map((dataType, index) => (
        <TabPanel key={dataType.key} value={activeTab} index={index}>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {dataType.icon} {dataType.label} Data
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tooltip title="Export to CSV">
                  <IconButton 
                    onClick={() => handleExport(dataType.key)}
                    disabled={!data[dataType.key]?.length}
                    color="primary"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {getTableHeaders(dataType.key).map((header) => (
                      <TableCell key={header} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                        {header.replace(/_/g, ' ').toUpperCase()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(dataType.key).map((row: any, rowIndex: number) => (
                    <TableRow key={rowIndex} hover>
                      {getTableHeaders(dataType.key).map((header) => (
                        <TableCell key={header}>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatCellValue(row[header])}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {getFilteredData(dataType.key).length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? 'No matching records found' : 'No data available'}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      ))}
    </Box>
  );
};

export default SampleData;
