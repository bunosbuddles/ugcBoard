// src/components/Dashboard/RecentDealsTable.js
import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const RecentDealsTable = ({ deals }) => {
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
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Creator</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Videos</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                  No recent deals
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            deals.map((deal) => (
              <TableRow key={deal._id}>
                <TableCell>{deal.creator?.name || 'Unknown'}</TableCell>
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
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    href={`/deals/${deal._id}`}
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
  );
};

export default RecentDealsTable;
