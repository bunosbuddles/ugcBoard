// backend/controllers/document.controller.js
const Document = require('../models/document.model');
const Creator = require('../models/creator.model');
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

    // If creator name is found, try to find matching creator
    let creator = null;
    if (extractedData.creatorName) {
      creator = await Creator.findOne({
        name: { $regex: new RegExp(extractedData.creatorName, 'i') }
      });
    }

    // Return extracted data with creator info if found
    res.json({
      ...extractedData,
      creatorId: creator ? creator._id : null
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
      extractedData: parsedData
    };

    // If deal ID provided, associate with deal
    if (dealId) {
      // Check if deal exists
      const dealExists = await Deal.exists({ _id: dealId });
      if (!dealExists) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      documentData.dealId = dealId;
    } else {
      // Create a new deal if needed
      if (type === 'Contract' && parsedData.creatorId && parsedData.clientName) {
        // Check if creator exists
        const creatorExists = await Creator.exists({ _id: parsedData.creatorId });
        if (!creatorExists) {
          return res.status(404).json({ message: 'Creator not found' });
        }

        // Create new deal
        const newDeal = new Deal({
          creator: parsedData.creatorId,
          clientName: parsedData.clientName,
          contractAmount: parsedData.amount || 0,
          videosRequired: parsedData.videoCount || 0,
          startDate: parsedData.startDate || new Date(),
          endDate: parsedData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
        });

        const savedDeal = await newDeal.save();
        documentData.dealId = savedDeal._id;
        documentData.creatorId = parsedData.creatorId;
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
    const documents = await Document.find()
      .populate('dealId', 'clientName status')
      .populate('creatorId', 'name')
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

/**
 * Get document by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('dealId')
      .populate('creatorId', 'name');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
};

/**
 * Get documents by deal ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDocumentsByDealId = async (req, res) => {
  try {
    const documents = await Document.find({ dealId: req.params.dealId })
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents for deal:', error);
    res.status(500).json({ message: 'Error fetching documents for deal' });
  }
};

/**
 * Delete document
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Get filename from fileUrl
    const filename = document.fileUrl.split('/').pop();
    
    // Delete file from storage
    await fileService.deleteFile(filename);
    
    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};
