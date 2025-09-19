import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import {
  Refresh,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PersonaDashboard from './PersonaDashboard';

interface Order {
  order_id: number;
  client_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  order_date: string;
  promised_delivery_date: string;
  actual_delivery_date?: string;
  status: string;
  payment_mode: string;
  amount: number;
  failure_reason?: string;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  // Debug logging
  console.log('Orders component rendered, orders state:', orders, 'type:', typeof orders, 'isArray:', Array.isArray(orders));
  const { token } = useAuth();
  const { showError } = useNotification();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // API Gateway port

  useEffect(() => {
    fetchOrders();
  }, [page]);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        skip: ((page - 1) * 20).toString(),
        limit: '20'
      });

      const response = await axios.get(`${API_BASE_URL}/api/data/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Debug logging
      console.log('API Response:', response.data);
      
      // Ensure we have a valid orders array
      const ordersArray = Array.isArray(response.data.orders) ? response.data.orders : [];
      setOrders(ordersArray);
      
      // Calculate total pages based on response
      setTotalPages(Math.ceil((response.data.total || ordersArray.length || 0) / 20));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch orders');
      showError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      case 'In-Transit': return 'info';
      case 'Returned': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Additional safety check
  const safeOrders = Array.isArray(orders) ? orders : [];
  console.log('Safe orders for rendering:', safeOrders);

  return (
    <PersonaDashboard>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        View and manage delivery orders
      </Typography>


      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Promised Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeOrders.length > 0 ? safeOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>{order.order_id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {order.customer_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer_phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.delivery_address_line1}
                        </Typography>
                        {order.delivery_address_line2 && (
                          <Typography variant="caption" color="textSecondary">
                            {order.delivery_address_line2}
                          </Typography>
                        )}
                        <Typography variant="caption" color="textSecondary" display="block">
                          {order.city}, {order.state} - {order.pincode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                      {order.failure_reason && (
                        <Typography variant="caption" color="error" display="block">
                          {order.failure_reason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ₹{(order.amount || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.payment_mode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.order_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.promised_delivery_date)}
                      </Typography>
                      {order.actual_delivery_date && (
                        <Typography variant="caption" color="textSecondary">
                          Actual: {formatDate(order.actual_delivery_date)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(order)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="order-details-title"
        aria-describedby="order-details-description"
      >
        <DialogTitle id="order-details-title">
          Order Details - {selectedOrder?.order_id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order ID</Typography>
                  <Typography variant="body1">{selectedOrder.order_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Client ID</Typography>
                  <Typography variant="body1">{selectedOrder.client_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Customer Name</Typography>
                  <Typography variant="body1">{selectedOrder.customer_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Customer Phone</Typography>
                  <Typography variant="body1">{selectedOrder.customer_phone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Delivery Address</Typography>
                  <Typography variant="body1">
                    {selectedOrder.delivery_address_line1}
                    {selectedOrder.delivery_address_line2 && (
                      <><br />{selectedOrder.delivery_address_line2}</>
                    )}
                    <br />{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip 
                    label={selectedOrder.status} 
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small"
                  />
                  {selectedOrder.failure_reason && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                      Failure Reason: {selectedOrder.failure_reason}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1">₹{(selectedOrder.amount || 0).toLocaleString()}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Payment: {selectedOrder.payment_mode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order Date</Typography>
                  <Typography variant="body1">{formatDate(selectedOrder.order_date)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Promised Delivery</Typography>
                  <Typography variant="body1">{formatDate(selectedOrder.promised_delivery_date)}</Typography>
                  {selectedOrder.actual_delivery_date && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Actual: {formatDate(selectedOrder.actual_delivery_date)}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography variant="body1">{formatDate(selectedOrder.created_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </PersonaDashboard>
  );
};

export default Orders;
