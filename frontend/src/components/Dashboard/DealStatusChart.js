// src/components/Dashboard/DealStatusChart.js
import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const DealStatusChart = ({ data }) => {
  const theme = useTheme();

  // Define colors for each status
  const COLORS = {
    Pending: theme.palette.warning.main,
    Active: theme.palette.info.main,
    Completed: theme.palette.success.main,
    Overdue: theme.palette.error.main
  };

  // Format data for the pie chart
  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status] || theme.palette.grey[500]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'grey.300',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Box sx={{ color: payload[0].payload.color, fontWeight: 'bold' }}>
            {payload[0].name}: {payload[0].value} deals
          </Box>
        </Box>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {value > 0 ? `${value}` : ''}
      </text>
    );
  };

  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DealStatusChart;
