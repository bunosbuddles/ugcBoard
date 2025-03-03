const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creator.controller');
const auth = require('../middleware/auth');

// Creator routes
router.post('/', auth, creatorController.createCreator);
router.get('/', auth, creatorController.getAllCreators);
router.get('/:id', auth, creatorController.getCreatorById);
router.put('/:id', auth, creatorController.updateCreator);
router.delete('/:id', auth, creatorController.deleteCreator);
router.get('/:id/deals', auth, creatorController.getCreatorDeals);
router.get('/:id/dashboard', auth, creatorController.getCreatorDashboard);

module.exports = router;
