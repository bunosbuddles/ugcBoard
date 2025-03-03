// backend/controllers/deal.controller.js
const Deal = require('../models/deal.model');
const Creator = require('../models/creator.model');
const Document = require('../models/document.model');

/**
 * Create a new deal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createDeal = async (req, res) => {
  try {
    const {
      creator,
      clientName,
      status,
      contractAmount,
      videosRequired,
      videosDelivered,
      paymentStatus,
      amountPaid,
      startDate,
      endDate,
      paymentDueDate
    } = req.body;

    // Check if required fields are present
    if (!creator || !clientName || !contractAmount || !videosRequired || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Creator, client name, contract amount, videos required, start date, and end date are required' 
      });
    }

    // Check if creator exists
    const creatorExists = await Creator.exists({ _id: creator });
    if (!creatorExists) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Create new deal
    const deal = new Deal({
      creator,
      clientName,
      status: status || 'Pending',
      contractAmount,
      videosRequired,
      videosDelivered: videosDelivered || 0,
      paymentStatus: paymentStatus || 'Unpaid',
      amountPaid: amountPaid || 0,
      startDate,
      endDate,
      paymentDueDate
    });

    // Save deal to database
    const savedDeal = await deal.save();
    res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ message: 'Error creating deal' });
  }
};

/**
 * Get all deals
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllDeals = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, creator, search, sort, order } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (creator) {
      filter.creator = creator;
    }
    
    if (search) {
      filter.clientName = { $regex: search, $options: 'i' };
    }
    
    // Build sort object
    const sortObj = {};
    if (sort) {
      sortObj[sort] = order === 'asc' ? 1 : -1;
    } else {
      sortObj.updatedAt = -1; // Default sort by updatedAt desc
    }
    
    // Get deals with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const deals = await Deal.find(filter)
      .populate('creator', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Deal.countDocuments(filter);
    
    res.json({
      deals,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Error fetching deals' });
  }
};

/**
 * Get deal by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('creator', 'name email phone socialHandles');
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // Get documents associated with this deal
    const documents = await Document.find({ dealId: req.params.id })
      .sort({ uploadDate: -1 });
    
    res.json({
      deal,
      documents
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ message: 'Error fetching deal' });
  }
};

/**
 * Update deal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateDeal = async (req, res) => {
  try {
    const {
      creator,
      clientName,
      status,
      contractAmount,
      videosRequired,
      videosDelivered,
      paymentStatus,
      amountPaid,
      startDate,
      endDate,
      paymentDueDate
    } = req.body;
    
    // Check if required fields are present
    if (!creator || !clientName || !contractAmount || !videosRequired || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Creator, client name, contract amount, videos required, start date, and end date are required' 
      });
    }
    
    // Check if creator exists
    if (creator) {
      const creatorExists = await Creator.exists({ _id: creator });
      if (!creatorExists) {
        return res.status(404).json({ message: 'Creator not found' });
      }
    }
    
    // Find and update deal
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        creator,
        clientName,
        status,
        contractAmount,
        videosRequired,
        videosDelivered,
        paymentStatus,
        amountPaid,
        startDate,
        endDate,
        paymentDueDate,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ message: 'Error updating deal' });
  }
};

/**
 * Delete deal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteDeal = async (req, res) => {
  try {
    // Find and delete deal
    const deletedDeal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deletedDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // Delete associated documents
    await Document.deleteMany({ dealId: req.params.id });
    
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ message: 'Error deleting deal' });
  }
};

/**
 * Update deal status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateDealStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Pending', 'Active', 'Completed', 'Overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find and update deal status
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal status:', error);
    res.status(500).json({ message: 'Error updating deal status' });
  }
};
