import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface Report {
  id: string;
  name: string;
  type: 'user_activity' | 'system_performance' | 'security_audit' | 'data_usage';
  status: 'completed' | 'generating' | 'failed';
  created: string;
  size: string;
  description: string;
}

const SystemReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'User Activity Report - January 2024',
      type: 'user_activity',
      status: 'completed',
      created: '2024-01-15T10:00:00Z',
      size: '2.3 MB',
      description: 'Comprehensive user activity analysis for January 2024'
    },
    {
      id: '2',
      name: 'System Performance Report - Week 2',
      type: 'system_performance',
      status: 'completed',
      created: '2024-01-14T10:00:00Z',
      size: '1.8 MB',
      description: 'System performance metrics and optimization recommendations'
    },
    {
      id: '3',
      name: 'Security Audit Report - Q1 2024',
      type: 'security_audit',
      status: 'generating',
      created: '2024-01-15T09:30:00Z',
      size: '0 MB',
      description: 'Quarterly security audit and compliance report'
    },
    {
      id: '4',
      name: 'Data Usage Report - December 2023',
      type: 'data_usage',
      status: 'completed',
      created: '2024-01-01T10:00:00Z',
      size: '3.1 MB',
      description: 'Data storage and usage analysis for December 2023'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'user_activity' as 'user_activity' | 'system_performance' | 'security_audit' | 'data_usage',
    description: ''
  });

  const { showSuccess, showError } = useNotification();

  const getTypeIcon = (type: string) => {
    const icons = {
      user_activity: <PeopleIcon />,
      system_performance: <TrendingUpIcon />,
      security_audit: <SecurityIcon />,
      data_usage: <StorageIcon />
    };
    return icons[type as keyof typeof icons] || <ReportsIcon />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      user_activity: '#2196f3',
      system_performance: '#4caf50',
      security_audit: '#f44336',
      data_usage: '#ff9800'
    };
    return colors[type as keyof typeof colors] || '#666';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'success',
      generating: 'warning',
      failed: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerateReport = async () => {
    try {
      const newReport: Report = {
        id: Date.now().toString(),
        name: formData.name || `${formData.type.replace('_', ' ')} Report - ${new Date().toLocaleDateString()}`,
        type: formData.type,
        status: 'generating',
        created: new Date().toISOString(),
        size: '0 MB',
        description: formData.description || 'System generated report'
      };

      setReports(prev => [newReport, ...prev]);
      setDialogOpen(false);
      setFormData({ name: '', type: 'user_activity', description: '' });
      showSuccess('Report generation started');

      // Simulate report generation completion
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'completed', size: '2.1 MB' }
            : report
        ));
        showSuccess('Report generated successfully');
      }, 3000);

    } catch (error) {
      console.error('Error generating report:', error);
      showError('Failed to generate report');
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      showSuccess(`Downloading report: ${report.name}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      showError('Failed to download report');
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ name: '', type: 'user_activity', description: '' });
  };

  const handleCloseViewDialog = () => {
    setSelectedReport(null);
  };

  const completedReports = reports.filter(r => r.status === 'completed').length;
  const totalReports = reports.length;
  const generatingReports = reports.filter(r => r.status === 'generating').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Generate and manage system reports for analysis and compliance
      </Typography>

      {/* Report Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReportsIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Total Reports</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedReports} completed, {generatingReports} generating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Scheduled Reports</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automated report schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">Last Generated</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {reports.length > 0 ? formatDate(reports[0].created) : 'Never'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most recent report
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<ReportsIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              disabled
            >
              Schedule Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              disabled
            >
              Report Templates
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report History
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {report.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(report.type)}
                        label={report.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getTypeColor(report.type),
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status.toUpperCase()}
                        color={getStatusColor(report.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.size}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(report.created)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Report">
                          <IconButton
                            size="small"
                            onClick={() => handleViewReport(report)}
                            disabled={report.status !== 'completed'}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report)}
                            disabled={report.status !== 'completed'}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="report-dialog-title"
      >
        <DialogTitle id="report-dialog-title">
          Generate New Report
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Leave empty for auto-generated name"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Report Type"
                  >
                    <MenuItem value="user_activity">User Activity</MenuItem>
                    <MenuItem value="system_performance">System Performance</MenuItem>
                    <MenuItem value="security_audit">Security Audit</MenuItem>
                    <MenuItem value="data_usage">Data Usage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained">
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog 
        open={!!selectedReport} 
        onClose={handleCloseViewDialog} 
        maxWidth="lg" 
        fullWidth
        aria-labelledby="view-report-title"
      >
        <DialogTitle id="view-report-title">
          {selectedReport?.name}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Report Type: {selectedReport.type.replace('_', ' ')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Description: {selectedReport.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Generated: {formatDate(selectedReport.created)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Size: {selectedReport.size}
              </Typography>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Report Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a preview of the report content. The full report would contain detailed analytics,
                  charts, and data visualizations based on the selected report type.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            onClick={() => selectedReport && handleDownloadReport(selectedReport)} 
            variant="contained"
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemReports;
