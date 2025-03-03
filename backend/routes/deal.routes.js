const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const auth = require('../middleware/auth');

// Deal routes
router.post('/', auth, dealController.createDeal);
router.get('/', auth, dealController.getAllDeals);
router.get('/:id', auth, dealController.getDealById);
router.put('/:id', auth, dealController.updateDeal);
router.delete('/:id', auth, dealController.deleteDeal);
router.put('/:id/status', auth, dealController.updateDealStatus);

module.exports = router;
