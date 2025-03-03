// controllers/dashboard.controller.js
const Deal = require('../models/deal.model');
const Creator = require('../models/creator.model');
const mongoose = require('mongoose');

exports.getAgencyMetrics = async (req, res) => {
  try {
    // Get total earnings (sum of all contract amounts)
    const earningsResult = await Deal.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$contractAmount' },
          totalVideosRequired: { $sum: '$videosRequired' },
          totalVideosDelivered: { $sum: '$videosDelivered' }
        }
      }
    ]);

    // Get counts of deals by status
    const dealStatusCounts = await Deal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format deal status counts
    const statusCounts = {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Overdue: 0
    };

    dealStatusCounts.forEach(status => {
      statusCounts[status._id] = status.count;
    });

    // Get total number of active deals
    const activeDeals = statusCounts.Active || 0;

    // Calculate total metrics
    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;
    const totalVideosRequired = earningsResult.length > 0 ? earningsResult[0].totalVideosRequired : 0;
    const totalVideosDelivered = earningsResult.length > 0 ? earningsResult[0].totalVideosDelivered : 0;
    
    // Calculate average money per video
    const avgMoneyPerVideo = totalVideosDelivered > 0 
      ? totalEarnings / totalVideosDelivered 
      : (totalVideosRequired > 0 ? totalEarnings / totalVideosRequired : 0);

    // Return all metrics
    res.status(200).json({
      totalEarnings,
      activeDeals,
      totalVideos: totalVideosDelivered,
      averageMoneyPerVideo: avgMoneyPerVideo.toFixed(2),
      dealStatusCounts: statusCounts
    });
  } catch (error) {
    console.error('Error fetching agency metrics:', error);
    res.status(500).json({ message: 'Failed to fetch agency metrics', error: error.message });
  }
};

exports.getMonthlyEarnings = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    
    // Get monthly earnings for the current year
    const monthlyEarnings = await Deal.aggregate([
      {
        $match: {
          startDate: { $gte: startDate },
          status: { $in: ['Active', 'Completed'] }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$startDate' },
            year: { $year: '$startDate' }
          },
          earnings: { $sum: '$contractAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the response
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedEarnings = Array(12).fill(0);
    monthlyEarnings.forEach(item => {
      const monthIndex = item._id.month - 1;
      formattedEarnings[monthIndex] = item.earnings;
    });

    const chartData = months.map((month, index) => ({
      month,
      earnings: formattedEarnings[index]
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    res.status(500).json({ message: 'Failed to fetch monthly earnings', error: error.message });
  }
};

exports.getDealStatusChart = async (req, res) => {
  try {
    const dealStatusCounts = await Deal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the response
    const chartData = dealStatusCounts.map(status => ({
      status: status._id,
      count: status.count
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error fetching deal status chart data:', error);
    res.status(500).json({ message: 'Failed to fetch deal status data', error: error.message });
  }
};

exports.getRecentDeals = async (req, res) => {
  try {
    const recentDeals = await Deal.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('creator', 'name')
      .lean();

    res.status(200).json(recentDeals);
  } catch (error) {
    console.error('Error fetching recent deals:', error);
    res.status(500).json({ message: 'Failed to fetch recent deals', error: error.message });
  }
};
