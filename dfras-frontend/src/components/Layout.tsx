import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as OrdersIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as DataIngestionIcon,
  Assessment as EnhancedAnalyticsIcon,
  BarChart as DataVisualizationIcon,
  AccountCircle,
  Logout,
  Chat as AIQueryIcon,
  Storage as SampleDataIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

// Role-based menu configuration
const getMenuItemsForRole = (role: string) => {
  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['*'] },
    { text: 'AI Query Analysis', icon: <AIQueryIcon />, path: '/ai-query', roles: ['admin', 'operations_manager', 'data_analyst'] },
    { text: 'Orders', icon: <OrdersIcon />, path: '/orders', roles: ['admin', 'operations_manager', 'customer_service'] },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', roles: ['*'] },
    { text: 'Data Ingestion', icon: <DataIngestionIcon />, path: '/data-ingestion', roles: ['admin', 'data_analyst'] },
    { text: 'Sample Data', icon: <SampleDataIcon />, path: '/sample-data', roles: ['*'] },
    { text: 'Data Visualization', icon: <DataVisualizationIcon />, path: '/data-visualization', roles: ['admin', 'data_analyst'] },
  ];

  return allMenuItems.filter(item => 
    item.roles.includes('*') || item.roles.includes(role)
  );
};

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role-specific menu items
  const menuItems = getMenuItemsForRole(user?.role || 'customer_service');

  // Get persona-specific theme colors
  const getPersonaTheme = (role: string) => {
    switch (role) {
      case 'admin':
        return { primary: '#1976d2', secondary: '#dc004e', accent: '#ff9800' };
      case 'operations_manager':
        return { primary: '#2e7d32', secondary: '#ff6f00', accent: '#4caf50' };
      case 'fleet_manager':
        return { primary: '#1565c0', secondary: '#ff5722', accent: '#2196f3' };
      case 'warehouse_manager':
        return { primary: '#7b1fa2', secondary: '#e91e63', accent: '#9c27b0' };
      case 'data_analyst':
        return { primary: '#d32f2f', secondary: '#ff9800', accent: '#f44336' };
      case 'customer_service':
        return { primary: '#388e3c', secondary: '#ffc107', accent: '#4caf50' };
      default:
        return { primary: '#1976d2', secondary: '#dc004e', accent: '#ff9800' };
    }
  };

  const personaTheme = getPersonaTheme(user?.role || 'customer_service');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        background: `linear-gradient(135deg, ${personaTheme.primary} 0%, ${personaTheme.secondary} 100%)`,
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          DFRAS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {Array.isArray(menuItems) ? menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${personaTheme.accent}20`,
                  borderRight: `3px solid ${personaTheme.accent}`,
                  '& .MuiListItemIcon-root': {
                    color: personaTheme.accent,
                  },
                  '& .MuiListItemText-primary': {
                    color: personaTheme.accent,
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: `${personaTheme.primary}10`,
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path 
                  ? personaTheme.accent 
                  : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        )) : (
          <ListItem>
            <Typography color="textSecondary">No menu items available</Typography>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: `linear-gradient(135deg, ${personaTheme.primary} 0%, ${personaTheme.secondary} 100%)`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            DFRAS - {user?.role?.replace('_', ' ').toUpperCase() || 'SYSTEM'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, fontWeight: 'bold' }}>
              {user?.username} • {user?.role?.replace('_', ' ').toUpperCase()}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
