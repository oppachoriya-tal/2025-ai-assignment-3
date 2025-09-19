import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationRule {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'system';
  trigger: 'user_login' | 'system_error' | 'security_alert' | 'backup_complete' | 'high_usage';
  enabled: boolean;
  recipients: string[];
  message: string;
  lastTriggered?: string;
}

const AdminNotifications: React.FC = () => {
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Admin Login Alerts',
      type: 'email',
      trigger: 'user_login',
      enabled: true,
      recipients: ['admin@dfras.com'],
      message: 'Admin user has logged into the system',
      lastTriggered: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'System Error Notifications',
      type: 'email',
      trigger: 'system_error',
      enabled: true,
      recipients: ['admin@dfras.com', 'ops@dfras.com'],
      message: 'System error detected: {error_message}',
      lastTriggered: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Security Alert SMS',
      type: 'sms',
      trigger: 'security_alert',
      enabled: true,
      recipients: ['+1234567890'],
      message: 'Security alert: {alert_type} detected',
      lastTriggered: '2024-01-14T16:45:00Z'
    },
    {
      id: '4',
      name: 'Backup Completion',
      type: 'email',
      trigger: 'backup_complete',
      enabled: false,
      recipients: ['admin@dfras.com'],
      message: 'Backup completed successfully: {backup_name}'
    },
    {
      id: '5',
      name: 'High Resource Usage',
      type: 'system',
      trigger: 'high_usage',
      enabled: true,
      recipients: ['admin@dfras.com'],
      message: 'High resource usage detected: {resource_type} at {usage_percentage}%'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'system',
    trigger: 'user_login' as 'user_login' | 'system_error' | 'security_alert' | 'backup_complete' | 'high_usage',
    enabled: true,
    recipients: '',
    message: ''
  });

  const { showSuccess, showError } = useNotification();

  const getTypeIcon = (type: string) => {
    const icons = {
      email: <EmailIcon />,
      sms: <SmsIcon />,
      system: <NotificationIcon />
    };
    return icons[type as keyof typeof icons] || <NotificationIcon />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      email: '#2196f3',
      sms: '#4caf50',
      system: '#ff9800'
    };
    return colors[type as keyof typeof colors] || '#666';
  };

  const getTriggerIcon = (trigger: string) => {
    const icons = {
      user_login: <SecurityIcon />,
      system_error: <ErrorIcon />,
      security_alert: <WarningIcon />,
      backup_complete: <CheckCircleIcon />,
      high_usage: <InfoIcon />
    };
    return icons[trigger as keyof typeof icons] || <InfoIcon />;
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

  const handleToggleRule = async (ruleId: string) => {
    try {
      setNotificationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, enabled: !rule.enabled }
            : rule
        )
      );
      showSuccess('Notification rule updated successfully');
    } catch (error) {
      console.error('Error updating notification rule:', error);
      showError('Failed to update notification rule');
    }
  };

  const handleOpenDialog = (rule?: NotificationRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        type: rule.type,
        trigger: rule.trigger,
        enabled: rule.enabled,
        recipients: rule.recipients.join(', '),
        message: rule.message
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        type: 'email',
        trigger: 'user_login',
        enabled: true,
        recipients: '',
        message: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRule(null);
    setFormData({
      name: '',
      type: 'email',
      trigger: 'user_login',
      enabled: true,
      recipients: '',
      message: ''
    });
  };

  const handleSubmit = async () => {
    try {
      const recipients = formData.recipients.split(',').map(r => r.trim()).filter(r => r);
      
      if (editingRule) {
        // Update existing rule
        setNotificationRules(prev =>
          prev.map(rule =>
            rule.id === editingRule.id
              ? { ...rule, ...formData, recipients }
              : rule
          )
        );
        showSuccess('Notification rule updated successfully');
      } else {
        // Create new rule
        const newRule: NotificationRule = {
          id: Date.now().toString(),
          ...formData,
          recipients
        };
        setNotificationRules(prev => [...prev, newRule]);
        showSuccess('Notification rule created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving notification rule:', error);
      showError('Failed to save notification rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification rule?')) {
      return;
    }

    try {
      setNotificationRules(prev => prev.filter(rule => rule.id !== ruleId));
      showSuccess('Notification rule deleted successfully');
    } catch (error) {
      console.error('Error deleting notification rule:', error);
      showError('Failed to delete notification rule');
    }
  };

  const handleTestNotification = async (rule: NotificationRule) => {
    try {
      showSuccess(`Test notification sent to: ${rule.recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending test notification:', error);
      showError('Failed to send test notification');
    }
  };

  const enabledRules = notificationRules.filter(rule => rule.enabled).length;
  const totalRules = notificationRules.length;
  const recentNotifications = notificationRules.filter(rule => 
    rule.lastTriggered && 
    new Date(rule.lastTriggered) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notification Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure system notifications, alerts, and communication settings
      </Typography>

      {/* Notification Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Active Rules</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {enabledRules}/{totalRules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notification rules enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Recent Notifications</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {recentNotifications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notifications sent in last 24h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">Alert Types</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Different notification triggers
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
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Notification Rule
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationIcon />}
              disabled
            >
              Notification Templates
            </Button>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              disabled
            >
              Email Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Rules
          </Typography>
          
          <List>
            {notificationRules.map((rule, index) => (
              <React.Fragment key={rule.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                          {rule.name}
                        </Typography>
                        <Chip
                          icon={getTypeIcon(rule.type)}
                          label={rule.type.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getTypeColor(rule.type),
                            color: 'white',
                            mr: 1,
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                        <Chip
                          icon={getTriggerIcon(rule.trigger)}
                          label={rule.trigger.replace('_', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {rule.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recipients: {rule.recipients.join(', ')}
                          {rule.lastTriggered && (
                            <> • Last triggered: {formatDate(rule.lastTriggered)}</>
                          )}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={rule.enabled}
                            onChange={() => handleToggleRule(rule.id)}
                            color="primary"
                          />
                        }
                        label={rule.enabled ? 'Enabled' : 'Disabled'}
                        labelPlacement="start"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleTestNotification(rule)}
                        disabled={!rule.enabled}
                      >
                        <NotificationIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(rule)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRule(rule.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < notificationRules.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Notification Rule Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="notification-dialog-title"
      >
        <DialogTitle id="notification-dialog-title">
          {editingRule ? 'Edit Notification Rule' : 'Add Notification Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Notification Type"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="system">System Notification</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trigger Event</InputLabel>
                  <Select
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value as any })}
                    label="Trigger Event"
                  >
                    <MenuItem value="user_login">User Login</MenuItem>
                    <MenuItem value="system_error">System Error</MenuItem>
                    <MenuItem value="security_alert">Security Alert</MenuItem>
                    <MenuItem value="backup_complete">Backup Complete</MenuItem>
                    <MenuItem value="high_usage">High Resource Usage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipients"
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="Enter recipients separated by commas"
                  required
                  helperText="For email: user@example.com, For SMS: +1234567890"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message Template"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  multiline
                  rows={3}
                  required
                  helperText="Use {variable_name} for dynamic content"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                  }
                  label="Enable Rule"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;
