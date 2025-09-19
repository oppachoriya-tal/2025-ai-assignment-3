import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Paper } from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon,
  Business as OperationsIcon,
  LocalShipping as FleetIcon,
  Warehouse as WarehouseIcon,
  Analytics as DataAnalystIcon,
  Support as CustomerServiceIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface PersonaDashboardProps {
  children: React.ReactNode;
}

const PersonaDashboard: React.FC<PersonaDashboardProps> = ({ children }) => {
  const { user } = useAuth();

  const getPersonaInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'System Administrator',
          description: 'Full system access and configuration management',
          icon: <AdminIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
          color: '#1976d2',
          features: []
        };
      case 'operations_manager':
        return {
          title: 'Operations Manager',
          description: 'Delivery operations analysis and optimization',
          icon: <OperationsIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
          color: '#2e7d32',
          features: []
        };
      case 'fleet_manager':
        return {
          title: 'Fleet Manager',
          description: 'Fleet performance and driver management',
          icon: <FleetIcon sx={{ fontSize: 40, color: '#1565c0' }} />,
          color: '#1565c0',
          features: []
        };
      case 'warehouse_manager':
        return {
          title: 'Warehouse Manager',
          description: 'Warehouse operations and inventory management',
          icon: <WarehouseIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />,
          color: '#7b1fa2',
          features: []
        };
      case 'data_analyst':
        return {
          title: 'Data Analyst',
          description: 'Advanced analytics and data insights',
          icon: <DataAnalystIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
          color: '#d32f2f',
          features: []
        };
      case 'customer_service':
        return {
          title: 'Customer Service',
          description: 'Customer support and order tracking',
          icon: <CustomerServiceIcon sx={{ fontSize: 40, color: '#388e3c' }} />,
          color: '#388e3c',
          features: []
        };
      default:
        return {
          title: 'User',
          description: 'Basic system access',
          icon: <CustomerServiceIcon sx={{ fontSize: 40, color: '#666' }} />,
          color: '#666',
          features: []
        };
    }
  };

  const personaInfo = getPersonaInfo(user?.role || 'customer_service');

  return (
    <Box sx={{ p: 3 }}>
      {/* Persona Header */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${personaInfo.color}10 0%, ${personaInfo.color}05 100%)` }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              {personaInfo.icon}
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom sx={{ color: personaInfo.color, fontWeight: 'bold' }}>
                {personaInfo.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {personaInfo.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(personaInfo.features) ? personaInfo.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    sx={{
                      backgroundColor: `${personaInfo.color}20`,
                      color: personaInfo.color,
                      fontWeight: 'bold',
                      border: `1px solid ${personaInfo.color}40`
                    }}
                  />
                )) : (
                  <Typography color="textSecondary">No features available</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Persona-specific content */}
      {children}
    </Box>
  );
};

export default PersonaDashboard;
