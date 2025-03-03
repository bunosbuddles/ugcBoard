// services/pdfProcessor.js
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text content from PDF file
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPdf = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract key information from invoice text
 * @param {string} text - Extracted text from invoice
 * @returns {Object} - Extracted invoice data
 */
const extractInvoiceData = (text) => {
  // Initialize extracted data object
  const data = {
    creatorName: null,
    clientName: null,
    amount: null,
    dueDate: null,
    videoCount: null
  };

  // Regular expressions for extracting information
  const creatorNameRegex = /(?:from|vendor|issued by|creator)[:\s]+([A-Za-z\s]+)/i;
  const clientNameRegex = /(?:to|client|billed to)[:\s]+([A-Za-z\s]+)/i;
  const amountRegex = /(?:amount|total|sum|payment)[:\s]*[$£€]?(\d+(?:[,.]\d+)?)/i;
  const dueDateRegex = /(?:due date|payment due|due by)[:\s]+(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i;
  const videoCountRegex = /(?:videos|content items|deliverables)[:\s]+(\d+)/i;

  // Extract data using regex
  const creatorMatch = text.match(creatorNameRegex);
  const clientMatch = text.match(clientNameRegex);
  const amountMatch = text.match(amountRegex);
  const dueDateMatch = text.match(dueDateRegex);
  const videoCountMatch = text.match(videoCountRegex);

  // Assign extracted values if matches found
  if (creatorMatch && creatorMatch[1]) data.creatorName = creatorMatch[1].trim();
  if (clientMatch && clientMatch[1]) data.clientName = clientMatch[1].trim();
  if (amountMatch && amountMatch[1]) {
    // Convert amount string to number, handling different formats
    const amountStr = amountMatch[1].replace(/,/g, '');
    data.amount = parseFloat(amountStr);
  }
  if (dueDateMatch && dueDateMatch[1]) {
    // Convert date string to Date object
    const dateStr = dueDateMatch[1];
    // Handle different date formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
    const dateParts = dateStr.split(/[-\/\.]/);
    if (dateParts.length === 3) {
      // Assume MM/DD/YYYY format for simplicity
      // In a real app, you'd need more sophisticated date parsing
      const month = parseInt(dateParts[0]) - 1;
      const day = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]) < 100 
        ? 2000 + parseInt(dateParts[2]) 
        : parseInt(dateParts[2]);
      data.dueDate = new Date(year, month, day);
    }
  }
  if (videoCountMatch && videoCountMatch[1]) data.videoCount = parseInt(videoCountMatch[1]);

  return data;
};

/**
 * Extract key information from contract text
 * @param {string} text - Extracted text from contract
 * @returns {Object} - Extracted contract data
 */
const extractContractData = (text) => {
  // Initialize extracted data object
  const data = {
    creatorName: null,
    clientName: null,
    amount: null,
    startDate: null,
    endDate: null,
    videoCount: null
  };

  // Regular expressions for extracting information
  const creatorNameRegex = /(?:creator|talent|influencer|contractor|party)[:\s]+([A-Za-z\s]+)/i;
  const clientNameRegex = /(?:client|company|brand|second party)[:\s]+([A-Za-z\s]+)/i;
  const amountRegex = /(?:compensation|payment|fee|amount)[:\s]*[$£€]?(\d+(?:[,.]\d+)?)/i;
  const startDateRegex = /(?:start date|commencement date|effective date)[:\s]+(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i;
  const endDateRegex = /(?:end date|termination date|expiration date)[:\s]+(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i;
  const videoCountRegex = /(?:videos|content items|deliverables)[:\s]+(\d+)/i;

  // Extract data using regex
  const creatorMatch = text.match(creatorNameRegex);
  const clientMatch = text.match(clientNameRegex);
  const amountMatch = text.match(amountRegex);
  const startDateMatch = text.match(startDateRegex);
  const endDateMatch = text.match(endDateRegex);
  const videoCountMatch = text.match(videoCountRegex);

  // Assign extracted values if matches found
  if (creatorMatch && creatorMatch[1]) data.creatorName = creatorMatch[1].trim();
  if (clientMatch && clientMatch[1]) data.clientName = clientMatch[1].trim();
  if (amountMatch && amountMatch[1]) {
    const amountStr = amountMatch[1].replace(/,/g, '');
    data.amount = parseFloat(amountStr);
  }
  if (startDateMatch && startDateMatch[1]) {
    const dateStr = startDateMatch[1];
    const dateParts = dateStr.split(/[-\/\.]/);
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[0]) - 1;
      const day = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]) < 100 
        ? 2000 + parseInt(dateParts[2]) 
        : parseInt(dateParts[2]);
      data.startDate = new Date(year, month, day);
    }
  }
  if (endDateMatch && endDateMatch[1]) {
    const dateStr = endDateMatch[1];
    const dateParts = dateStr.split(/[-\/\.]/);
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[0]) - 1;
      const day = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]) < 100 
        ? 2000 + parseInt(dateParts[2]) 
        : parseInt(dateParts[2]);
      data.endDate = new Date(year, month, day);
    }
  }
  if (videoCountMatch && videoCountMatch[1]) data.videoCount = parseInt(videoCountMatch[1]);

  return data;
};

/**
 * Process PDF document and extract relevant data
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} documentType - Type of document ('Invoice' or 'Contract')
 * @returns {Promise<Object>} - Extracted data
 */
const processPdfDocument = async (fileBuffer, documentType) => {
  try {
    const text = await extractTextFromPdf(fileBuffer);
    
    if (documentType === 'Invoice') {
      return extractInvoiceData(text);
    } else if (documentType === 'Contract') {
      return extractContractData(text);
    } else {
      throw new Error('Invalid document type. Must be "Invoice" or "Contract"');
    }
  } catch (error) {
    console.error('Error processing PDF document:', error);
    throw error;
  }
};

module.exports = {
  processPdfDocument
};
