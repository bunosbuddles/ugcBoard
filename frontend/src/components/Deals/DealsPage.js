// src/components/Deals/DealsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Grid,
  IconButton,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_URL } from '../../config';

// Status chip component
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Active':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

// Payment status chip component
const PaymentChip = ({ status }) => {
  const getPaymentColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warning';
      case 'Unpaid':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getPaymentColor(status)}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDeals, setTotalDeals] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    status: 'Pending',
    contractAmount: '',
    videosRequired: '',
    videosDelivered: '0',
    paymentStatus: 'Unpaid',
    amountPaid: '0',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    paymentDueDate: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchDeals();
  }, [page, rowsPerPage, statusFilter, searchTerm]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: 'updatedAt',
        order: 'desc'
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await axios.get(`${API_URL}/api/deals`, { params });
      
      setDeals(response.data.deals);
      setTotalDeals(response.data.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch deals',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (deal = null) => {
    if (deal) {
      setSelectedDeal(deal);
      setFormData({
        clientName: deal.clientName,
        status: deal.status,
        contractAmount: deal.contractAmount.toString(),
        videosRequired: deal.videosRequired.toString(),
        videosDelivered: deal.videosDelivered.toString(),
        paymentStatus: deal.paymentStatus,
        amountPaid: deal.amountPaid.toString(),
        startDate: new Date(deal.startDate),
        endDate: new Date(deal.endDate),
        paymentDueDate: deal.paymentDueDate ? new Date(deal.paymentDueDate) : null
      });
    } else {
      setSelectedDeal(null);
      setFormData({
        clientName: '',
        status: 'Pending',
        contractAmount: '',
        videosRequired: '',
        videosDelivered: '0',
        paymentStatus: 'Unpaid',
        amountPaid: '0',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentDueDate: null
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (deal) => {
    setSelectedDeal(deal);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.clientName.trim()) {
      errors.clientName = 'Client name is required';
    }
    
    if (!formData.contractAmount || isNaN(formData.contractAmount) || parseFloat(formData.contractAmount) <= 0) {
      errors.contractAmount = 'Valid contract amount is required';
    }
    
    if (!formData.videosRequired || isNaN(formData.videosRequired) || parseInt(formData.videosRequired) <= 0) {
      errors.videosRequired = 'Valid number of videos is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format data for submission
      const dealData = {
        ...formData,
        contractAmount: parseFloat(formData.contractAmount),
        videosRequired: parseInt(formData.videosRequired),
        videosDelivered: parseInt(formData.videosDelivered),
        amountPaid: parseFloat(formData.amountPaid)
      };
      
      if (selectedDeal) {
        // Update existing deal
        await axios.put(`${API_URL}/api/deals/${selectedDeal._id}`, dealData);
        setSnackbar({
          open: true,
          message: 'Deal updated successfully',
          severity: 'success'
        });
      } else {
        // Create new deal
        await axios.post(`${API_URL}/api/deals`, dealData);
        setSnackbar({
          open: true,
          message: 'Deal created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save deal',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/deals/${selectedDeal._id}`);
      setSnackbar({
        open: true,
        message: 'Deal deleted successfully',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete deal',
        severity: 'error'
      });
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Deals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Deal
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search by client name"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              color="primary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              title="Clear Filters"
            >
              <FilterListIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Deals Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Videos</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      No deals found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>{deal.clientName}</TableCell>
                    <TableCell>
                      <StatusChip status={deal.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(deal.contractAmount)}</TableCell>
                    <TableCell>
                      {deal.videosDelivered} / {deal.videosRequired}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentChip status={deal.paymentStatus} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          component={Link}
                          to={`/deals/${deal._id}`}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenDialog(deal)}
                          title="Edit Deal"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(deal)}
                          title="Delete Deal"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalDeals}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Deal Form Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedDeal ? 'Edit Deal' : 'Create New Deal'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Client Name *"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    error={!!formErrors.clientName}
                    helperText={formErrors.clientName}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Contract Amount ($) *"
                    name="contractAmount"
                    type="number"
                    value={formData.contractAmount}
                    onChange={handleInputChange}
                    error={!!formErrors.contractAmount}
                    helperText={formErrors.contractAmount}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Videos Required *"
                    name="videosRequired"
                    type="number"
                    value={formData.videosRequired}
                    onChange={handleInputChange}
                    error={!!formErrors.videosRequired}
                    helperText={formErrors.videosRequired}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Videos Delivered"
                    name="videosDelivered"
                    type="number"
                    value={formData.videosDelivered}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="payment-status-label">Payment Status</InputLabel>
                    <Select
                      labelId="payment-status-label"
                      id="paymentStatus"
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      label="Payment Status"
                    >
                      <MenuItem value="Unpaid">Unpaid</MenuItem>
                      <MenuItem value="Partial">Partial</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Amount Paid ($)"
                    name="amountPaid"
                    type="number"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date *"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={!!formErrors.startDate}
                        helperText={formErrors.startDate}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date *"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={!!formErrors.endDate}
                        helperText={formErrors.endDate}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Payment Due Date"
                    value={formData.paymentDueDate}
                    onChange={(date) => handleDateChange('paymentDueDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
            >
              {selectedDeal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the deal for "{selectedDeal?.clientName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealsPage;