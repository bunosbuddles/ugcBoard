// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import MetricCard from './MetricCard';
import MonthlyEarningsChart from './MonthlyEarningsChart';
import DealStatusChart from './DealStatusChart';
import RecentDealsTable from './RecentDealsTable';
import axios from 'axios';
import { API_URL } from '../../config';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    activeDeals: 0,
    totalVideos: 0,
    averageMoneyPerVideo: 0,
    dealStatusCounts: { Pending: 0, Active: 0, Completed: 0, Overdue: 0 }
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [dealStatusData, setDealStatusData] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch agency metrics
        const metricsResponse = await axios.get(`${API_URL}/api/dashboard/metrics`);
        setMetrics(metricsResponse.data);
        
        // Fetch monthly earnings chart data
        const earningsResponse = await axios.get(`${API_URL}/api/dashboard/charts/monthly-earnings`);
        setMonthlyEarnings(earningsResponse.data);
        
        // Fetch deal status chart data
        const dealStatusResponse = await axios.get(`${API_URL}/api/dashboard/charts/deal-status`);
        setDealStatusData(dealStatusResponse.data);
        
        // Fetch recent deals
        const recentDealsResponse = await axios.get(`${API_URL}/api/dashboard/recent-deals`);
        setRecentDeals(recentDealsResponse.data);
        
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

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Agency Dashboard
      </Typography>
      
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Earnings"
            value={formatCurrency(metrics.totalEarnings)}
            icon="MonetizationOn"
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            icon="Assignment"
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Videos"
            value={metrics.totalVideos}
            icon="Videocam"
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg $ Per Video"
            value={formatCurrency(metrics.averageMoneyPerVideo)}
            icon="AttachMoney"
            color="#9c27b0"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper elevation={2}>
            <Typography variant="h6" gutterBottom>
              Recent Deals
            </Typography>
            <RecentDealsTable deals={recentDeals} />
          </StyledPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;
