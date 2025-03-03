// src/components/Dashboard/MetricCard.js
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideocamIcon from '@mui/icons-material/Videocam';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const IconContainer = styled(Box)(({ bgColor }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: bgColor + '20', // 20% opacity
  color: bgColor,
  marginBottom: 2
}));

const MetricCard = ({ title, value, icon, color }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'MonetizationOn':
        return <MonetizationOnIcon fontSize="large" />;
      case 'Assignment':
        return <AssignmentIcon fontSize="large" />;
      case 'Videocam':
        return <VideocamIcon fontSize="large" />;
      case 'AttachMoney':
        return <AttachMoneyIcon fontSize="large" />;
      default:
        return <MonetizationOnIcon fontSize="large" />;
    }
  };

  return (
    <StyledCard elevation={3}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <IconContainer bgColor={color}>
            {getIcon(icon)}
          </IconContainer>
          <Typography variant="h5" component="div" gutterBottom>
            {value}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MetricCard;
