// src/components/Creators/CreatorDashboard.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { API_URL } from '../../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
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

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CreatorDashboard = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [deals, setDeals] = useState([]);
  const [metrics, setMetrics] = useState({
    contractedEarnings: 0,
    paidEarnings: 0,
    pendingPayments: 0,
    averageRatePerVideo: 0,
    totalBrands: 0,
    totalDeals: 0
  });
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        setLoading(true);
        
        // Fetch creator details
        const creatorResponse = await axios.get(`${API_URL}/api/creators/${id}`);
        setCreator(creatorResponse.data);
        
        // Fetch creator dashboard metrics
        const metricsResponse = await axios.get(`${API_URL}/api/creators/${id}/dashboard`);
        setMetrics(metricsResponse.data);
        
        // Fetch creator deals
        const dealsResponse = await axios.get(`${API_URL}/api/creators/${id}/deals`);
        setDeals(dealsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching creator data:', error);
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleUpdateDealStatus = async (dealId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/deals/${dealId}/status`, { status: newStatus });
      
      // Update the deal status in the local state
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal._id === dealId ? { ...deal, status: newStatus } : deal
        )
      );
    } catch (error) {
      console.error('Error updating deal status:', error);
    }
  };

  // Filter and sort deals
  const filteredDeals = deals.filter(deal => {
    const matchesStatus = filterStatus ? deal.status === filterStatus : true;
    const matchesSearch = searchTerm
      ? deal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal._id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'paymentDueDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Group deals by status
  const dealsByStatus = {
    Pending: sortedDeals.filter(deal => deal.status === 'Pending'),
    Active: sortedDeals.filter(deal => deal.status === 'Active'),
    Completed: sortedDeals.filter(deal => deal.status === 'Completed'),
    Overdue: sortedDeals.filter(deal => deal.status === 'Overdue')
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!creator) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Creator not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          {creator.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          href={`/creators/${id}/edit`}
        >
          Edit Creator
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
              <Typography variant="h5" component="div">
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
              <Typography variant="h5" component="div">
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
      
      {/* Deals Section */}
      <StyledPaper elevation={2}>
        <Typography variant="h5" gutterBottom>
          Deals
        </Typography>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="deal tabs">
              <Tab label={`All (${deals.length})`} />
              <Tab label={`Pending (${dealsByStatus.Pending.length})`} />
              <Tab label={`Active (${dealsByStatus.Active.length})`} />
              <Tab label={`Completed (${dealsByStatus.Completed.length})`} />
              <Tab label={`Overdue (${dealsByStatus.Overdue.length})`} />
            </Tabs>
          </Box>
          
          {/* Filters */}
          <Box sx={{ py: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="filter-status-label">Filter by Status</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                onChange={handleFilterChange}
                label="Filter by Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="startDate">Start Date</MenuItem>
                <MenuItem value="endDate">End Date</MenuItem>
                <MenuItem value="clientName">Client Name</MenuItem>
                <MenuItem value="contractAmount">Contract Amount</MenuItem>
                <MenuItem value="videosRequired">Videos Required</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton onClick={handleSortOrderToggle} color="primary">
              <FilterListIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          
          {/* Deal Tables */}
          <TabPanel value={tabValue} index={0}>
            <DealsTable 
              deals={sortedDeals} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateDealStatus}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <DealsTable 
              deals={dealsByStatus.Pending} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateDealStatus}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <DealsTable 
              deals={dealsByStatus.Active} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateDealStatus}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <DealsTable 
              deals={dealsByStatus.Completed} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateDealStatus}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <DealsTable 
              deals={dealsByStatus.Overdue} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateDealStatus}
            />
          </TabPanel>
        </Box>
      </StyledPaper>
    </Box>
  );
};

// Deals Table Component
const DealsTable = ({ deals, formatCurrency, formatDate, onUpdateStatus }) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Contract Amount</TableCell>
            <TableCell>Videos</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                  No deals found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            deals.map((deal) => (
              <TableRow key={deal._id}>
                <TableCell>{deal.clientName}</TableCell>
                <TableCell>
                  <StatusChip
                    label={deal.status}
                    status={deal.status}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(deal.startDate)}</TableCell>
                <TableCell>{formatDate(deal.endDate)}</TableCell>
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
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      href={`/deals/${deal._id}`}
                      title="View Details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={deal.status}
                        size="small"
                        onChange={(e) => onUpdateStatus(deal._id, e.target.value)}
                        displayEmpty
                        variant="outlined"
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CreatorDashboard;
