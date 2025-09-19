import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'audit';
}

const SecuritySettings: React.FC = () => {
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    {
      id: '1',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements',
      enabled: true,
      severity: 'high',
      category: 'authentication'
    },
    {
      id: '2',
      name: 'Session Timeout',
      description: 'Automatic session expiration after inactivity',
      enabled: true,
      severity: 'medium',
      category: 'authentication'
    },
    {
      id: '3',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for admin accounts',
      enabled: false,
      severity: 'critical',
      category: 'authentication'
    },
    {
      id: '4',
      name: 'API Rate Limiting',
      description: 'Limit API requests per user/IP',
      enabled: true,
      severity: 'medium',
      category: 'network'
    },
    {
      id: '5',
      name: 'Data Encryption',
      description: 'Encrypt sensitive data at rest',
      enabled: true,
      severity: 'critical',
      category: 'data_protection'
    },
    {
      id: '6',
      name: 'Audit Logging',
      description: 'Log all security-relevant events',
      enabled: true,
      severity: 'high',
      category: 'audit'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'authentication' as 'authentication' | 'authorization' | 'data_protection' | 'network' | 'audit'
  });

  const { showSuccess, showError } = useNotification();

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0'
    };
    return colors[severity as keyof typeof colors] || '#666';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      authentication: <LockIcon />,
      authorization: <ShieldIcon />,
      data_protection: <SecurityIcon />,
      network: <SecurityIcon />,
      audit: <SecurityIcon />
    };
    return icons[category as keyof typeof icons] || <SecurityIcon />;
  };

  const handlePolicyToggle = async (policyId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication required');
        return;
      }

      // Update policy status
      setSecurityPolicies(prev => 
        prev.map(policy => 
          policy.id === policyId 
            ? { ...policy, enabled: !policy.enabled }
            : policy
        )
      );

      showSuccess('Security policy updated successfully');
    } catch (error) {
      console.error('Error updating security policy:', error);
      showError('Failed to update security policy');
    }
  };

  const handleOpenDialog = (policy?: SecurityPolicy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        name: policy.name,
        description: policy.description,
        enabled: policy.enabled,
        severity: policy.severity,
        category: policy.category
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        name: '',
        description: '',
        enabled: true,
        severity: 'medium',
        category: 'authentication'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      enabled: true,
      severity: 'medium',
      category: 'authentication'
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingPolicy) {
        // Update existing policy
        setSecurityPolicies(prev =>
          prev.map(policy =>
            policy.id === editingPolicy.id
              ? { ...policy, ...formData }
              : policy
          )
        );
        showSuccess('Security policy updated successfully');
      } else {
        // Create new policy
        const newPolicy: SecurityPolicy = {
          id: Date.now().toString(),
          ...formData
        };
        setSecurityPolicies(prev => [...prev, newPolicy]);
        showSuccess('Security policy created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving security policy:', error);
      showError('Failed to save security policy');
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!window.confirm('Are you sure you want to delete this security policy?')) {
      return;
    }

    try {
      setSecurityPolicies(prev => prev.filter(policy => policy.id !== policyId));
      showSuccess('Security policy deleted successfully');
    } catch (error) {
      console.error('Error deleting security policy:', error);
      showError('Failed to delete security policy');
    }
  };

  const enabledPolicies = securityPolicies.filter(policy => policy.enabled).length;
  const totalPolicies = securityPolicies.length;
  const criticalPolicies = securityPolicies.filter(policy => policy.severity === 'critical' && policy.enabled).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage security policies, authentication settings, and system security configurations
      </Typography>

      {/* Security Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShieldIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Active Policies</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {enabledPolicies}/{totalPolicies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Security policies enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon sx={{ fontSize: 40, color: '#f44336', mr: 2 }} />
                <Typography variant="h6">Critical Policies</Typography>
              </Box>
              <Typography variant="h3" color="error">
                {criticalPolicies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical security policies active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Security Score</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {Math.round((enabledPolicies / totalPolicies) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall security compliance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Policies */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Security Policies</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Policy
            </Button>
          </Box>
          
          <List>
            {securityPolicies.map((policy, index) => (
              <React.Fragment key={policy.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                          {policy.name}
                        </Typography>
                        <Chip
                          label={policy.severity.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getSeverityColor(policy.severity),
                            color: 'white',
                            mr: 1
                          }}
                        />
                        <Chip
                          icon={getCategoryIcon(policy.category)}
                          label={policy.category.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {policy.description}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={policy.enabled}
                            onChange={() => handlePolicyToggle(policy.id)}
                            color="primary"
                          />
                        }
                        label={policy.enabled ? 'Enabled' : 'Disabled'}
                        labelPlacement="start"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(policy)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePolicy(policy.id)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < securityPolicies.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Recommendations
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Two-Factor Authentication:</strong> Enable 2FA for all admin accounts to enhance security.
            </Typography>
          </Alert>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Regular Security Audits:</strong> Review and update security policies monthly.
            </Typography>
          </Alert>
          <Alert severity="success">
            <Typography variant="body2">
              <strong>Data Encryption:</strong> All sensitive data is encrypted at rest and in transit.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Policy Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="security-dialog-title"
      >
        <DialogTitle id="security-dialog-title">
          {editingPolicy ? 'Edit Security Policy' : 'Add Security Policy'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Policy Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    label="Severity"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    label="Category"
                  >
                    <MenuItem value="authentication">Authentication</MenuItem>
                    <MenuItem value="authorization">Authorization</MenuItem>
                    <MenuItem value="data_protection">Data Protection</MenuItem>
                    <MenuItem value="network">Network</MenuItem>
                    <MenuItem value="audit">Audit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                  }
                  label="Enable Policy"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
