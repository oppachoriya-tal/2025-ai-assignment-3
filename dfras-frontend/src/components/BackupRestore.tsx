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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  created: string;
  status: 'completed' | 'failed' | 'in_progress';
  description: string;
}

const BackupRestore: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: '1',
      name: 'Full Backup - 2024-01-15',
      type: 'full',
      size: '2.3 GB',
      created: '2024-01-15T10:00:00Z',
      status: 'completed',
      description: 'Complete system backup including database and configurations'
    },
    {
      id: '2',
      name: 'Incremental Backup - 2024-01-14',
      type: 'incremental',
      size: '156 MB',
      created: '2024-01-14T10:00:00Z',
      status: 'completed',
      description: 'Incremental backup of changes since last full backup'
    },
    {
      id: '3',
      name: 'Full Backup - 2024-01-13',
      type: 'full',
      size: '2.1 GB',
      created: '2024-01-13T10:00:00Z',
      status: 'completed',
      description: 'Complete system backup including database and configurations'
    },
    {
      id: '4',
      name: 'Scheduled Backup - 2024-01-12',
      type: 'differential',
      size: '890 MB',
      created: '2024-01-12T10:00:00Z',
      status: 'failed',
      description: 'Differential backup failed due to insufficient disk space'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental' | 'differential',
    description: ''
  });

  const { showSuccess, showError } = useNotification();

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
      failed: <ErrorIcon sx={{ color: '#f44336' }} />,
      in_progress: <LinearProgress sx={{ width: 20 }} />
    };
    return icons[status as keyof typeof icons] || <WarningIcon />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'success',
      failed: 'error',
      in_progress: 'warning'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      full: '#2196f3',
      incremental: '#4caf50',
      differential: '#ff9800'
    };
    return colors[type as keyof typeof colors] || '#666';
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

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      // Simulate backup process
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBackingUp(false);
            
            // Add new backup to list
            const newBackup: BackupRecord = {
              id: Date.now().toString(),
              name: formData.name || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Backup - ${new Date().toLocaleDateString()}`,
              type: formData.type,
              size: '2.4 GB',
              created: new Date().toISOString(),
              status: 'completed',
              description: formData.description || 'System backup created successfully'
            };
            
            setBackups(prev => [newBackup, ...prev]);
            setDialogOpen(false);
            setFormData({ name: '', type: 'full', description: '' });
            showSuccess('Backup created successfully');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
    } catch (error) {
      console.error('Error creating backup:', error);
      showError('Failed to create backup');
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleRestoreBackup = async (backup: BackupRecord) => {
    if (!window.confirm(`Are you sure you want to restore from "${backup.name}"? This will overwrite current data.`)) {
      return;
    }

    try {
      // Simulate restore process
      showSuccess(`Restoring from backup: ${backup.name}`);
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      showError('Failed to restore backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      showSuccess('Backup deleted successfully');
    } catch (error) {
      console.error('Error deleting backup:', error);
      showError('Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (backup: BackupRecord) => {
    try {
      // Simulate download
      showSuccess(`Downloading backup: ${backup.name}`);
    } catch (error) {
      console.error('Error downloading backup:', error);
      showError('Failed to download backup');
    }
  };

  const handleOpenDialog = () => {
    setFormData({ name: '', type: 'full', description: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ name: '', type: 'full', description: '' });
  };

  const handleOpenRestoreDialog = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const handleCloseRestoreDialog = () => {
    setRestoreDialogOpen(false);
    setSelectedBackup(null);
  };

  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const totalBackups = backups.length;
  const totalSize = backups.reduce((sum, backup) => {
    const size = parseFloat(backup.size.replace(/[^\d.]/g, ''));
    return sum + size;
  }, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Backup & Restore
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage system backups, restore data, and configure backup schedules
      </Typography>

      {/* Backup Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BackupIcon sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Total Backups</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {totalBackups}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedBackups} completed, {totalBackups - completedBackups} failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Storage Used</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {totalSize.toFixed(1)} GB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total backup storage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h6">Last Backup</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {backups.length > 0 ? formatDate(backups[0].created) : 'Never'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most recent backup
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
              startIcon={<BackupIcon />}
              onClick={handleOpenDialog}
              disabled={isBackingUp}
            >
              Create Backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              disabled
            >
              Schedule Backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              disabled
            >
              Upload Backup
            </Button>
          </Box>
          
          {isBackingUp && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Creating backup... {backupProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={backupProgress} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Backup History
          </Typography>
          
          <List>
            {backups.map((backup, index) => (
              <React.Fragment key={backup.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                          {backup.name}
                        </Typography>
                        <Chip
                          label={backup.type.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getTypeColor(backup.type),
                            color: 'white',
                            mr: 1
                          }}
                        />
                        <Chip
                          icon={getStatusIcon(backup.status)}
                          label={backup.status.toUpperCase()}
                          color={getStatusColor(backup.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {backup.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {backup.size} • Created: {formatDate(backup.created)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadBackup(backup)}
                        disabled={backup.status !== 'completed'}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenRestoreDialog(backup)}
                        disabled={backup.status !== 'completed'}
                      >
                        <RestoreIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBackup(backup.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < backups.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="backup-dialog-title"
      >
        <DialogTitle id="backup-dialog-title">
          Create New Backup
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Backup Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Leave empty for auto-generated name"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Backup Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Backup Type"
                  >
                    <MenuItem value="full">Full Backup</MenuItem>
                    <MenuItem value="incremental">Incremental Backup</MenuItem>
                    <MenuItem value="differential">Differential Backup</MenuItem>
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
          <Button 
            onClick={handleCreateBackup} 
            variant="contained"
            disabled={isBackingUp}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog 
        open={restoreDialogOpen} 
        onClose={handleCloseRestoreDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="restore-dialog-title"
      >
        <DialogTitle id="restore-dialog-title">
          Restore from Backup
        </DialogTitle>
        <DialogContent>
          {selectedBackup && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> This will overwrite current data with the backup from {formatDate(selectedBackup.created)}.
                  Make sure you have a current backup before proceeding.
                </Typography>
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom>
                Backup Details:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Name:</strong> {selectedBackup.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Type:</strong> {selectedBackup.type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Size:</strong> {selectedBackup.size}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Created:</strong> {formatDate(selectedBackup.created)}
              </Typography>
              <Typography variant="body2">
                <strong>Description:</strong> {selectedBackup.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestoreDialog}>Cancel</Button>
          <Button 
            onClick={() => selectedBackup && handleRestoreBackup(selectedBackup)} 
            variant="contained"
            color="error"
          >
            Restore Backup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupRestore;
