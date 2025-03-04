// controllers/deal.controller.js
const Deal = require('../models/deal.model');
const Document = require('../models/document.model');

/**
 * Create a new deal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createDeal = async (req, res) => {
  try {
    const {
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
      notes,
      tags
    } = req.body;

    // Check if required fields are present
    if (!clientName || !contractAmount || !videosRequired || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Client name, contract amount, videos required, start date, and end date are required' 
      });
    }

    // Create new deal
    const deal = new Deal({
      user: req.user.id, // Set current user id from auth middleware
      clientName,
      status: status || 'Pending',
      contractAmount,
      videosRequired,
      videosDelivered: videosDelivered || 0,
      paymentStatus: paymentStatus || 'Unpaid',
      amountPaid: amountPaid || 0,
      startDate,
      endDate,
      paymentDueDate,
      notes,
      tags
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
 * Get all deals for current user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllDeals = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, search, sort, order } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id }; // Only get deals for current user
    
    if (status) {
      filter.status = status;
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
    const deal = await Deal.findOne({ 
      _id: req.params.id,
      user: req.user.id // Ensure deal belongs to current user
    });
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // Get documents associated with this deal
    const documents = await Document.find({ 
      dealId: req.params.id,
      userId: req.user.id // Ensure documents belong to current user
    }).sort({ uploadDate: -1 });
    
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
      notes,
      tags
    } = req.body;
    
    // Check if required fields are present
    if (!clientName || !contractAmount || !videosRequired || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Client name, contract amount, videos required, start date, and end date are required' 
      });
    }
    
    // Find and update deal
    const updatedDeal = await Deal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id // Ensure deal belongs to current user
      },
      {
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
        notes,
        tags,
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
    const deletedDeal = await Deal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id // Ensure deal belongs to current user
    });
    
    if (!deletedDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // Delete associated documents
    await Document.deleteMany({ 
      dealId: req.params.id,
      userId: req.user.id // Ensure documents belong to current user
    });
    
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
    const updatedDeal = await Deal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id // Ensure deal belongs to current user
      },
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

/**
 * Update deal payment status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;
    
    if (!paymentStatus || !['Unpaid', 'Partial', 'Paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    // Find the deal first to get current contract amount
    const deal = await Deal.findOne({
      _id: req.params.id,
      user: req.user.id // Ensure deal belongs to current user
    });
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // Validate amount paid based on payment status
    let updatedAmountPaid = amountPaid;
    if (paymentStatus === 'Paid') {
      updatedAmountPaid = deal.contractAmount;
    } else if (paymentStatus === 'Unpaid') {
      updatedAmountPaid = 0;
    } else if (
      paymentStatus === 'Partial' && 
      (amountPaid === undefined || amountPaid <= 0 || amountPaid >= deal.contractAmount)
    ) {
      return res.status(400).json({ 
        message: 'Partial payment requires a valid amount paid (greater than 0 and less than the contract amount)' 
      });
    }
    
    // Update deal payment status
    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: deal._id },
      {
        paymentStatus,
        amountPaid: updatedAmountPaid,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};