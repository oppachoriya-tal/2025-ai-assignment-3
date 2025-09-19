import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
  Pagination,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Upload as UploadIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

interface ConfigFormData {
  key: string;
  value: string;
  description: string;
  category: string;
  is_encrypted: boolean;
}

const SystemConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState<ConfigFormData>({
    key: '',
    value: '',
    description: '',
    category: 'general',
    is_encrypted: false
  });

  const { showSuccess, showError } = useNotification();

  const categories = [
    { value: 'general', label: 'General', icon: <SettingsIcon />, color: '#1976d2' },
    { value: 'security', label: 'Security', icon: <SecurityIcon />, color: '#d32f2f' },
    { value: 'upload', label: 'File Upload', icon: <UploadIcon />, color: '#2e7d32' },
    { value: 'api', label: 'API Settings', icon: <ApiIcon />, color: '#7b1fa2' },
    { value: 'data', label: 'Data Management', icon: <StorageIcon />, color: '#f57c00' },
    { value: 'session', label: 'Session Management', icon: <ScheduleIcon />, color: '#388e3c' }
  ];

  const getCategoryIcon = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return categoryConfig ? categoryConfig.icon : <SettingsIcon />;
  };

  const getCategoryColor = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return categoryConfig ? categoryConfig.color : '#666';
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        skip: ((page - 1) * 10).toString(),
        limit: '10'
      });

      if (categoryFilter) params.append('category', categoryFilter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/config?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }

      const data = await response.json();
      setConfigs(data);
      setTotalPages(Math.ceil(data.length / 10) || 1);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      showError('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [page, categoryFilter]);

  const handleOpenDialog = (config?: SystemConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        key: config.key,
        value: config.is_encrypted ? '' : config.value,
        description: config.description || '',
        category: config.category,
        is_encrypted: config.is_encrypted
      });
    } else {
      setEditingConfig(null);
      setFormData({
        key: '',
        value: '',
        description: '',
        category: 'general',
        is_encrypted: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      key: '',
      value: '',
      description: '',
      category: 'general',
      is_encrypted: false
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication required');
        return;
      }

      const url = editingConfig
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/config/${editingConfig.key}`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/config`;

      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save configuration');
      }

      showSuccess(editingConfig ? 'Configuration updated successfully' : 'Configuration created successfully');
      handleCloseDialog();
      fetchConfigs();
    } catch (error) {
      console.error('Error saving configuration:', error);
      showError(error instanceof Error ? error.message : 'Failed to save configuration');
    }
  };

  const handleDeleteConfig = async (configKey: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication required');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/config/${configKey}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      showSuccess('Configuration deleted successfully');
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      showError('Failed to delete configuration');
    }
  };

  const filteredConfigs = configs.filter(config =>
    config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (config.description && config.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfigValueDisplay = (config: SystemConfig) => {
    if (config.is_encrypted) {
      return '***ENCRYPTED***';
    }
    if (config.value.length > 50) {
      return config.value.substring(0, 50) + '...';
    }
    return config.value;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage system settings, security parameters, and operational configurations
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search configurations..."
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box display="flex" alignItems="center">
                        {category.icon}
                        <Box ml={1}>{category.label}</Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Add Config
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Configuration Categories */}
      <Box sx={{ mb: 3 }}>
        {categories.map((category) => {
          const categoryConfigs = filteredConfigs.filter(config => config.category === category.value);
          if (categoryConfigs.length === 0) return null;

          return (
            <Accordion key={category.value} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box sx={{ color: category.color, mr: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {category.label}
                  </Typography>
                  <Chip 
                    label={`${categoryConfigs.length} configs`} 
                    size="small" 
                    sx={{ backgroundColor: category.color, color: 'white' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Updated</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryConfigs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle2">
                                {config.key}
                              </Typography>
                              {config.is_encrypted && (
                                <Tooltip title="Encrypted Value">
                                  <LockIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace',
                                color: config.is_encrypted ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {getConfigValueDisplay(config)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {config.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDate(config.updated_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit Configuration">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(config)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Configuration">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteConfig(config.key)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* All Configurations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Configurations
          </Typography>
          
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
                      <TableCell>Key</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Updated</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle2">
                              {config.key}
                            </Typography>
                            {config.is_encrypted && (
                              <Tooltip title="Encrypted Value">
                                <LockIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getCategoryIcon(config.category)}
                            label={categories.find(c => c.value === config.category)?.label || config.category}
                            size="small"
                            sx={{ 
                              backgroundColor: getCategoryColor(config.category),
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              color: config.is_encrypted ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {getConfigValueDisplay(config)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {config.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(config.updated_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Configuration">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(config)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Configuration">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteConfig(config.key)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredConfigs.length === 0 && (
                <Box textAlign="center" p={3}>
                  <Typography variant="body2" color="text.secondary">
                    No configurations found
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

      {/* Configuration Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="config-dialog-title"
        aria-describedby="config-dialog-description"
      >
        <DialogTitle id="config-dialog-title">
          {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography id="config-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {editingConfig ? 'Update system configuration parameters' : 'Create a new system configuration with appropriate settings'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Configuration Key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  disabled={editingConfig !== null}
                  helperText="Unique identifier for this configuration"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Configuration Value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  multiline
                  rows={3}
                  helperText={editingConfig?.is_encrypted ? "Enter new value to update encrypted configuration" : "Configuration value"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                  helperText="Optional description of what this configuration controls"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box display="flex" alignItems="center">
                          {category.icon}
                          <Box ml={1}>{category.label}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_encrypted}
                      onChange={(e) => setFormData({ ...formData, is_encrypted: e.target.checked })}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      {formData.is_encrypted ? <LockIcon /> : <LockOpenIcon />}
                      <Box ml={1}>Encrypt Value</Box>
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            {formData.is_encrypted && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Encrypted values will be stored securely and cannot be retrieved in plain text.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemConfiguration;
