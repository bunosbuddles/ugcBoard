// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MonthlyEarningsChart from './MonthlyEarningsChart';
import DealStatusChart from './DealStatusChart';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4]
  }
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
    fontWeight: 'bold'
  };
});

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    contractedEarnings: 0,
    paidEarnings: 0,
    pendingPayments: 0,
    averageRatePerVideo: 0,
    totalBrands: 0,
    totalDeals: 0
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [dealStatusData, setDealStatusData] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard metrics
        const metricsResponse = await axios.get(`${API_URL}/api/dashboard/metrics`);
        setMetrics(metricsResponse.data);
        
        // Fetch monthly earnings chart data
        const earningsResponse = await axios.get(`${API_URL}/api/dashboard/charts/monthly-earnings`);
        setMonthlyEarnings(earningsResponse.data);
        
        // Fetch deal status chart data
        const dealStatusResponse = await axios.get(`${API_URL}/api/dashboard/charts/deal-status`);
        setDealStatusData(dealStatusResponse.data);
        
        // Fetch recent deals
        const recentDealsResponse = await axios.get(`${API_URL}/api/deals?limit=5&sort=updatedAt&order=desc`);
        setRecentDeals(recentDealsResponse.data.deals);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

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
    <DashboardContainer>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          Your Dashboard
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/deals"
          startIcon={<AddIcon />}
        >
          Create New Deal
        </Button>
      </Box>
      
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Contracted Earnings
              </Typography>
              <Typography variant="h5" component="div" color="primary.main">
                {formatCurrency(metrics.contractedEarnings)}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Paid Earnings
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                {formatCurrency(metrics.paidEarnings)}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {formatCurrency(metrics.pendingPayments)}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Avg Rate Per Video
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(metrics.averageRatePerVideo)}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Brands Worked With
              </Typography>
              <Typography variant="h5" component="div">
                {metrics.totalBrands}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Deals
              </Typography>
              <Typography variant="h5" component="div">
                {metrics.totalDeals}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={2}>
            <Typography variant="h6" gutterBottom>
              Monthly Earnings
            </Typography>
            <MonthlyEarningsChart data={monthlyEarnings} />
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper elevation={2}>
            <Typography variant="h6" gutterBottom>
              Deal Status
            </Typography>
            <DealStatusChart data={dealStatusData} />
          </StyledPaper>
        </Grid>
      </Grid>
      
      {/* Recent Deals */}
      <StyledPaper elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Deals
          </Typography>
          <Button
            variant="outlined"
            component={Link}
            to="/deals"
            size="small"
          >
            View All Deals
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Videos</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                      No deals found. Create your first deal to get started!
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/deals"
                      startIcon={<AddIcon />}
                    >
                      Create Deal
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                recentDeals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>{deal.clientName}</TableCell>
                    <TableCell>
                      <StatusChip label={deal.status} status={deal.status} size="small" />
                    </TableCell>
                    <TableCell>
                      {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(deal.contractAmount)}</TableCell>
                    <TableCell>
                      {deal.videosDelivered} / {deal.videosRequired}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        component={Link}
                        to={`/deals/${deal._id}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </DashboardContainer>
  );
};

export default Dashboard;