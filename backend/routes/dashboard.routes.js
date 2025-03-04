// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

// Dashboard routes
router.get('/metrics', auth, dashboardController.getMetrics);
router.get('/charts/monthly-earnings', auth, dashboardController.getMonthlyEarnings);
router.get('/charts/deal-status', auth, dashboardController.getDealStatusChart);
router.get('/charts/yearly-comparison', auth, dashboardController.getYearlyComparison);
router.get('/upcoming-deadlines', auth, dashboardController.getUpcomingDeadlines);

module.exports = router;