// backend/controllers/document.controller.js
const Document = require('../models/document.model');
const User = require('../models/user.model');
const Deal = require('../models/deal.model');
const fileService = require('../services/fileService');
const pdfProcessor = require('../services/pdfProcessor');
const fs = require('fs');

/**
 * Extract data from uploaded document
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.extractDocumentData = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get document type from request
    const { type } = req.body;
    if (!type || !['Invoice', 'Contract'].includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Process PDF and extract data
    const fileBuffer = fs.readFileSync(req.file.path);
    const extractedData = await pdfProcessor.processPdfDocument(fileBuffer, type);

    // Return extracted data
    res.json({
      ...extractedData,
      userId: req.user.id
    });
  } catch (error) {
    console.error('Error extracting document data:', error);
    res.status(500).json({ message: 'Error extracting document data' });
  }
};

/**
 * Upload document and save data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.uploadDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get document type and parsed data
    const { type, dealId, data } = req.body;
    
    if (!type || !['Invoice', 'Contract'].includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Get file info
    const fileUrl = fileService.getFileUrl(req.file.filename);
    const fileName = req.file.originalname;

    // Prepare document data
    const documentData = {
      type,
      fileUrl,
      fileName,
      extractedData: parsedData,
      userId: req.user.id
    };

    // Find or create a deal
    let dealIdToUse = dealId;

    // If no dealId provided, create a new deal
    if (!dealIdToUse && type === 'Contract' && parsedData.clientName) {
      try {
        // Create new deal
        const newDeal = new Deal({
          user: req.user.id,
          clientName: parsedData.clientName,
          contractAmount: parsedData.amount || 0,
          videosRequired: parsedData.videoCount || 1, // Default to 1 if not provided
          startDate: parsedData.startDate || new Date(),
          endDate: parsedData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          status: 'Pending' // Use a valid status from your enum
        });

        const savedDeal = await newDeal.save();
        dealIdToUse = savedDeal._id;
      } catch (dealError) {
        console.error('Error creating new deal:', dealError);
        // Continue with document upload even if deal creation fails
      }
    }

    // If dealId exists and was provided or created, verify it belongs to this user
    if (dealIdToUse) {
      const dealExists = await Deal.exists({ 
        _id: dealIdToUse,
        user: req.user.id
      });
      
      if (dealExists) {
        documentData.dealId = dealIdToUse;
      } else {
        // If we can't find the deal, create a default one that matches the schema requirements
        try {
          const today = new Date();
          const thirtyDaysLater = new Date(today);
          thirtyDaysLater.setDate(today.getDate() + 30);
          
          const defaultDeal = new Deal({
            user: req.user.id,
            clientName: parsedData.clientName || 'Unknown Client',
            contractAmount: parsedData.amount || 0,
            videosRequired: parsedData.videoCount || 1, // Default to 1
            startDate: today,
            endDate: thirtyDaysLater,
            status: 'Pending' // Use a valid status from your enum
          });
          
          const savedDeal = await defaultDeal.save();
          documentData.dealId = savedDeal._id;
        } catch (error) {
          console.error('Error creating default deal:', error);
          return res.status(500).json({ message: 'Error creating associated deal' });
        }
      }
    } else {
      // If no deal ID and not a contract, create a placeholder deal
      try {
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const placeholderDeal = new Deal({
          user: req.user.id,
          clientName: parsedData.clientName || 'Unknown Client',
          contractAmount: parsedData.amount || 0,
          videosRequired: parsedData.videoCount || 1, // Default to 1
          startDate: today,
          endDate: thirtyDaysLater,
          status: 'Pending' // Use a valid status from your enum
        });
        
        const savedDeal = await placeholderDeal.save();
        documentData.dealId = savedDeal._id;
      } catch (error) {
        console.error('Error creating placeholder deal:', error);
        return res.status(500).json({ message: 'Error creating associated deal' });
      }
    }

    // Save document
    const document = new Document(documentData);
    const savedDocument = await document.save();

    // Return saved document with deal info
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

/**
 * Get all documents
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const typeFilter = req.query.type;
    const searchTerm = req.query.search;
    
    // Build query
    const query = { userId: req.user.id };
    
    // Add type filter if provided
    if (typeFilter) {
      query.type = typeFilter;
    }
    
    // Add search term if provided
    if (searchTerm) {
      query.$or = [
        { fileName: { $regex: searchTerm, $options: 'i' } },
        { 'extractedData.clientName': { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Count total documents matching query
    const total = await Document.countDocuments(query);
    
    // Fetch documents with pagination
    const documents = await Document.find(query)
      .populate('dealId', 'clientName status')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return with pagination info
    res.json({
      documents,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Rest of the controller methods (getDocumentById, getDocumentsByDealId, deleteDocument) remain unchanged
exports.getDocumentById = async (req, res) => {
  try {
    // Only fetch if document belongs to the current user
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('dealId');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
};

exports.getDocumentsByDealId = async (req, res) => {
  try {
    // Verify that the deal belongs to the user
    const dealExists = await Deal.exists({
      _id: req.params.dealId,
      user: req.user.id
    });
    
    if (!dealExists) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    const documents = await Document.find({ 
      dealId: req.params.dealId,
      userId: req.user.id
    }).sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents for deal:', error);
    res.status(500).json({ message: 'Error fetching documents for deal' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    // Only delete if document belongs to the current user
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Get filename from fileUrl
    const filename = document.fileUrl.split('/').pop();
    
    // Delete file from storage
    await fileService.deleteFile(filename);
    
    // Delete document from database
    await Document.findByIdAndDelete(document._id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};