// src/components/Deals/DealDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import { API_URL } from '../../config';

const DetailWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    Pending: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark
    },
    Active: {
      bg: theme.palette.info.light,
      color: theme.palette.info.dark
    },
    Completed: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark
    },
    Overdue: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark
    }
  };

  return {
    backgroundColor: statusColors[status]?.bg || theme.palette.grey[300],
    color: statusColors[status]?.color || theme.palette.grey[800],
    fontWeight: 'bold',
    fontSize: '0.875rem',
    padding: '4px 12px',
  };
});

const DealDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [dealStatus, setDealStatus] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchDealDetails();
  }, []);

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/deals/${id}`);
      setDeal(response.data.deal);
      setDocuments(response.data.documents);
      setDealStatus(response.data.deal.status);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deal details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch deal details',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    
    try {
      await axios.put(`${API_URL}/api/deals/${id}/status`, { status: newStatus });
      setDealStatus(newStatus);
      setDeal(prev => ({ ...prev, status: newStatus }));
      setSnackbar({
        open: true,
        message: 'Deal status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating deal status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update deal status',
        severity: 'error'
      });
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
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'Contract':
        return <DescriptionIcon color="primary" />;
      case 'Invoice':
        return <PictureAsPdfIcon color="secondary" />;
      default:
        return <PictureAsPdfIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!deal) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Deal not found
        </Typography>
        <Button
          variant="outlined"
          component={Link}
          to="/deals"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Deals
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            component={Link}
            to="/deals"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            Deal Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            // Handle edit (opens dialog or redirects)
          }}
        >
          Edit Deal
        </Button>
      </Box>
      
      {/* Deal Header */}
      <DetailWrapper elevation={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {deal.clientName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mb: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={dealStatus}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
            <StatusChip label={dealStatus} status={dealStatus} />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <LabelTypography variant="body2">
              Contract Amount
            </LabelTypography>
            <Typography variant="h6">
              {formatCurrency(deal.contractAmount)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LabelTypography variant="body2">
              Payment Status
            </LabelTypography>
            <Chip
              label={deal.paymentStatus}
              color={
                deal.paymentStatus === 'Paid'
                  ? 'success'
                  : deal.paymentStatus === 'Partial'
                  ? 'warning'
                  : 'default'
              }
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LabelTypography variant="body2">
              Amount Paid
            </LabelTypography>
            <Typography variant="h6">
              {formatCurrency(deal.amountPaid)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LabelTypography variant="body2">
              Amount Due
            </LabelTypography>
            <Typography variant="h6" color={deal.contractAmount - deal.amountPaid > 0 ? 'error.main' : 'text.primary'}>
              {formatCurrency(deal.contractAmount - deal.amountPaid)}
            </Typography>
          </Grid>
        </Grid>
      </DetailWrapper>
      
      {/* Deal Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <DetailWrapper elevation={2}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  Start Date
                </LabelTypography>
                <Typography variant="body1">
                  {formatDate(deal.startDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  End Date
                </LabelTypography>
                <Typography variant="body1">
                  {formatDate(deal.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  Payment Due Date
                </LabelTypography>
                <Typography variant="body1">
                  {formatDate(deal.paymentDueDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  Last Updated
                </LabelTypography>
                <Typography variant="body1">
                  {formatDate(deal.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </DetailWrapper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <DetailWrapper elevation={2}>
            <Typography variant="h6" gutterBottom>
              Content Delivery
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  Videos Required
                </LabelTypography>
                <Typography variant="h5">
                  {deal.videosRequired}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LabelTypography variant="body2">
                  Videos Delivered
                </LabelTypography>
                <Typography variant="h5">
                  {deal.videosDelivered}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 1, mb: 1 }}>
                  <LabelTypography variant="body2">
                    Delivery Progress
                  </LabelTypography>
                  <Box
                    sx={{
                      height: 10,
                      width: '100%',
                      bgcolor: 'grey.200',
                      borderRadius: 5,
                      mt: 1
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: 5,
                        width: `${(deal.videosDelivered / deal.videosRequired) * 100}%`,
                        bgcolor: deal.videosDelivered >= deal.videosRequired ? 'success.main' : 'primary.main',
                        transition: 'width 0.5s ease-in-out'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                    {((deal.videosDelivered / deal.videosRequired) * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DetailWrapper>
        </Grid>
      </Grid>
      
      {/* Documents Section */}
      <DetailWrapper elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Documents
          </Typography>
          <Button
            variant="outlined"
            component={Link}
            to="/documents/upload"
            startIcon={<UploadFileIcon />}
            size="small"
          >
            Upload Document
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {documents.length === 0 ? (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No documents available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload invoices or contracts for this deal
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/documents/upload"
                startIcon={<UploadFileIcon />}
              >
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getDocumentTypeIcon(doc.type)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          {doc.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        href={doc.fileUrl}
                        target="_blank"
                        title="Download"
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DetailWrapper>
      
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

export default DealDetails;