// controllers/dashboard.controller.js
const Deal = require('../models/deal.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Get user dashboard metrics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all user deals
    const deals = await Deal.find({ user: userId });
    
    // Calculate metrics
    const contractedEarnings = deals.reduce((sum, deal) => sum + deal.contractAmount, 0);
    const paidEarnings = deals.reduce((sum, deal) => {
      if (deal.paymentStatus === 'Paid') {
        return sum + deal.contractAmount;
      } else if (deal.paymentStatus === 'Partial') {
        return sum + deal.amountPaid;
      }
      return sum;
    }, 0);
    
    const pendingPayments = contractedEarnings - paidEarnings;
    
    const totalVideosDelivered = deals.reduce((sum, deal) => sum + deal.videosDelivered, 0);
    const totalVideosRequired = deals.reduce((sum, deal) => sum + deal.videosRequired, 0);
    
    const averageRatePerVideo = totalVideosDelivered > 0 
      ? contractedEarnings / totalVideosDelivered 
      : (totalVideosRequired > 0 ? contractedEarnings / totalVideosRequired : 0);
    
    // Get unique brands/clients
    const uniqueBrands = [...new Set(deals.map(deal => deal.clientName))];
    
    // Count deals by status
    const statusCounts = {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Overdue: 0
    };
    
    deals.forEach(deal => {
      statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;
    });
    
    // Return dashboard metrics
    res.json({
      contractedEarnings,
      paidEarnings,
      pendingPayments,
      averageRatePerVideo,
      totalVideos: totalVideosDelivered,
      totalBrands: uniqueBrands.length,
      totalDeals: deals.length,
      dealStatusCounts: statusCounts,
      activeDeals: statusCounts.Active || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Error fetching dashboard metrics' });
  }
};

/**
 * Get monthly earnings data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMonthlyEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    
    // Get monthly earnings for the current year
    const deals = await Deal.find({
      user: userId,
      startDate: { $gte: startDate }
    });
    
    // Group deals by month
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      earnings: 0
    }));
    
    deals.forEach(deal => {
      const startMonth = new Date(deal.startDate).getMonth();
      monthlyData[startMonth].earnings += deal.contractAmount;
    });
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    res.status(500).json({ message: 'Error fetching monthly earnings' });
  }
};

/**
 * Get deal status chart data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDealStatusChart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get deals and count by status
    const deals = await Deal.find({ user: userId });
    
    const statusCounts = {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Overdue: 0
    };
    
    deals.forEach(deal => {
      statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;
    });
    
    // Format the response for the chart
    const chartData = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status]
    }));
    
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching deal status chart data:', error);
    res.status(500).json({ message: 'Error fetching deal status data' });
  }
};

/**
 * Get year-over-year comparison data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getYearlyComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const startOfCurrentYear = new Date(currentYear, 0, 1);
    const startOfPreviousYear = new Date(previousYear, 0, 1);
    
    // Get deals for current and previous year
    const deals = await Deal.find({
      user: userId,
      startDate: { $gte: startOfPreviousYear }
    });
    
    // Calculate earnings by year and month
    const yearlyData = {
      currentYear: Array(12).fill(0).map((_, i) => ({
        month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
        earnings: 0
      })),
      previousYear: Array(12).fill(0).map((_, i) => ({
        month: new Date(previousYear, i, 1).toLocaleString('default', { month: 'short' }),
        earnings: 0
      }))
    };
    
    deals.forEach(deal => {
      const dealYear = new Date(deal.startDate).getFullYear();
      const dealMonth = new Date(deal.startDate).getMonth();
      
      if (dealYear === currentYear) {
        yearlyData.currentYear[dealMonth].earnings += deal.contractAmount;
      } else if (dealYear === previousYear) {
        yearlyData.previousYear[dealMonth].earnings += deal.contractAmount;
      }
    });
    
    res.json(yearlyData);
  } catch (error) {
    console.error('Error fetching yearly comparison data:', error);
    res.status(500).json({ message: 'Error fetching yearly comparison data' });
  }
};

/**
 * Get upcoming deadlines
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // Get deals with upcoming end dates or payment due dates
    const deals = await Deal.find({
      user: userId,
      $or: [
        { endDate: { $gte: today, $lte: thirtyDaysFromNow } },
        { paymentDueDate: { $gte: today, $lte: thirtyDaysFromNow } }
      ],
      status: { $in: ['Pending', 'Active'] }
    }).sort({ endDate: 1 });
    
    const deadlines = deals.map(deal => {
      const daysUntilEnd = Math.ceil((new Date(deal.endDate) - today) / (1000 * 60 * 60 * 24));
      const daysUntilPayment = deal.paymentDueDate 
        ? Math.ceil((new Date(deal.paymentDueDate) - today) / (1000 * 60 * 60 * 24))
        : null;
      
      return {
        _id: deal._id,
        clientName: deal.clientName,
        contractAmount: deal.contractAmount,
        endDate: deal.endDate,
        paymentDueDate: deal.paymentDueDate,
        daysUntilEnd: daysUntilEnd > 0 ? daysUntilEnd : 0,
        daysUntilPayment: daysUntilPayment !== null ? (daysUntilPayment > 0 ? daysUntilPayment : 0) : null,
        videosDelivered: deal.videosDelivered,
        videosRequired: deal.videosRequired,
        status: deal.status
      };
    });
    
    res.json(deadlines);
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error);
    res.status(500).json({ message: 'Error fetching upcoming deadlines' });
  }
};