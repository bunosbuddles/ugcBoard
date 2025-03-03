// backend/controllers/creator.controller.js
const Creator = require('../models/creator.model');
const Deal = require('../models/deal.model');
const mongoose = require('mongoose');

/**
 * Create a new creator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createCreator = async (req, res) => {
  try {
    const { name, email, phone, socialHandles, notes } = req.body;

    // Check if required fields are present
    if (!name) {
      return res.status(400).json({ message: 'Creator name is required' });
    }

    // Create new creator
    const creator = new Creator({
      name,
      email,
      phone,
      socialHandles,
      notes
    });

    // Save creator to database
    const savedCreator = await creator.save();
    res.status(201).json(savedCreator);
  } catch (error) {
    console.error('Error creating creator:', error);
    res.status(500).json({ message: 'Error creating creator' });
  }
};

/**
 * Get all creators
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllCreators = async (req, res) => {
  try {
    const creators = await Creator.find().sort({ name: 1 });
    res.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ message: 'Error fetching creators' });
  }
};

/**
 * Get creator by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCreatorById = async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    res.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    res.status(500).json({ message: 'Error fetching creator' });
  }
};

/**
 * Update creator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateCreator = async (req, res) => {
  try {
    const { name, email, phone, socialHandles, notes } = req.body;
    
    // Check if required fields are present
    if (!name) {
      return res.status(400).json({ message: 'Creator name is required' });
    }
    
    // Find and update creator
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        socialHandles,
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCreator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    res.json(updatedCreator);
  } catch (error) {
    console.error('Error updating creator:', error);
    res.status(500).json({ message: 'Error updating creator' });
  }
};

/**
 * Delete creator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteCreator = async (req, res) => {
  try {
    // Check if creator has any deals
    const dealsCount = await Deal.countDocuments({ creator: req.params.id });
    
    if (dealsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete creator with existing deals. Please reassign or delete the deals first.' 
      });
    }
    
    // Delete creator
    const deletedCreator = await Creator.findByIdAndDelete(req.params.id);
    
    if (!deletedCreator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    res.json({ message: 'Creator deleted successfully' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({ message: 'Error deleting creator' });
  }
};

/**
 * Get creator deals
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCreatorDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ creator: req.params.id })
      .sort({ startDate: -1 });
    
    res.json(deals);
  } catch (error) {
    console.error('Error fetching creator deals:', error);
    res.status(500).json({ message: 'Error fetching creator deals' });
  }
};

/**
 * Get creator dashboard metrics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCreatorDashboard = async (req, res) => {
  try {
    const creatorId = req.params.id;
    
    // Check if creator exists
    const creatorExists = await Creator.exists({ _id: creatorId });
    if (!creatorExists) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    // Get all creator deals
    const deals = await Deal.find({ creator: creatorId });
    
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
    
    const averageRatePerVideo = totalVideosDelivered > 0 
      ? contractedEarnings / totalVideosDelivered 
      : 0;
    
    // Get unique brands/clients
    const uniqueBrands = [...new Set(deals.map(deal => deal.clientName))];
    
    // Return dashboard metrics
    res.json({
      contractedEarnings,
      paidEarnings,
      pendingPayments,
      averageRatePerVideo,
      totalBrands: uniqueBrands.length,
      totalDeals: deals.length
    });
  } catch (error) {
    console.error('Error fetching creator dashboard:', error);
    res.status(500).json({ message: 'Error fetching creator dashboard' });
  }
};
