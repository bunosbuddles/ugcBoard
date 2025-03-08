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
 * Parse date string in various formats
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} - Date object or null if invalid
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Remove any non-date characters
  dateStr = dateStr.trim().replace(/[^\d\/\-\.]/g, '');
  
  // Try different date formats
  const formats = [
    // MM/DD/YYYY
    (s) => {
      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
        return new Date(year, month, day);
      }
      return null;
    },
    // DD/MM/YYYY
    (s) => {
      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
        return new Date(year, month, day);
      }
      return null;
    },
    // YYYY/MM/DD
    (s) => {
      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        return new Date(year, month, day);
      }
      return null;
    }
  ];
  
  // Try each format until one works
  for (const format of formats) {
    const date = format(dateStr);
    if (date && !isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Fallback: try JavaScript's default date parsing
  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }
  
  return null;
};

/**
 * Extract key information from invoice text
 * @param {string} text - Extracted text from invoice
 * @returns {Object} - Extracted invoice data
 */
const extractInvoiceData = (text) => {
  // Normalize text: lowercase and remove extra whitespace
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Initialize extracted data object
  const data = {
    creatorName: null,
    clientName: null,
    amount: null,
    dueDate: null,
    videoCount: null
  };

  // Enhanced regular expressions for extracting information
  const creatorNamePatterns = [
    /(?:from|vendor|issued by|creator|billed from)[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /invoice\s+from[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /([A-Za-z0-9\s&.,'-]+?)(?:\r|\n)(?:invoice|bill)/i
  ];
  
  const clientNamePatterns = [
    /(?:to|client|billed to|customer)[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /bill\s+to[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /customer[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i
  ];
  
  const amountPatterns = [
    /(?:amount|total|sum|payment|grand total|total amount)[:\s]*[$£€]?(\d+(?:[,.]\d+)?)/i,
    /(?:total)[:\s]*[$£€]?(\d+(?:[,.]\d+)?)/i,
    /[$£€](\d+(?:[,.]\d+)?)[^0-9A-Za-z]*(?:total|amount|due)/i
  ];
  
  const dueDatePatterns = [
    /(?:due date|payment due|due by|pay by)[:\s]+([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i,
    /(?:due|payment due)[:\s]+([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i
  ];
  
  const videoCountPatterns = [
    /(?:videos|content items|deliverables|posts)[:\s]+(\d+)/i,
    /(\d+)(?:\s+)(?:videos|content items|deliverables|posts)/i,
    /quantity[:\s]+(\d+)/i
  ];

  // Try each pattern until a match is found
  for (const pattern of creatorNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.creatorName = match[1].trim();
      break;
    }
  }
  
  for (const pattern of clientNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.clientName = match[1].trim();
      break;
    }
  }
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/,/g, '');
      data.amount = parseFloat(amountStr);
      break;
    }
  }
  
  for (const pattern of dueDatePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.dueDate = parseDate(match[1].trim());
      break;
    }
  }
  
  for (const pattern of videoCountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.videoCount = parseInt(match[1]);
      break;
    }
  }

  // Fallback strategies for missing data
  
  // If client name is missing, look for company names followed by "Inc", "LLC", etc.
  if (!data.clientName) {
    const companyMatch = text.match(/([A-Za-z0-9\s&.,'-]+?)(?:Inc|LLC|Ltd|Corp|Company)/i);
    if (companyMatch && companyMatch[1]) {
      data.clientName = (companyMatch[1] + companyMatch[0].substring(companyMatch[1].length)).trim();
    }
  }
  
  // If amount is missing, look for dollar amounts
  if (!data.amount) {
    const dollarMatch = text.match(/[$£€]\s*(\d+(?:[,.]\d+)?)/i);
    if (dollarMatch && dollarMatch[1]) {
      data.amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
    }
  }
  
  // If due date is missing, look for any dates
  if (!data.dueDate) {
    const dateMatch = text.match(/(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
    if (dateMatch && dateMatch[1]) {
      data.dueDate = parseDate(dateMatch[1]);
    }
  }

  return data;
};

/**
 * Extract key information from contract text
 * @param {string} text - Extracted text from contract
 * @returns {Object} - Extracted contract data
 */
const extractContractData = (text) => {
  // Normalize text: lowercase and remove extra whitespace
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Initialize extracted data object
  const data = {
    creatorName: null,
    clientName: null,
    amount: null,
    startDate: null,
    endDate: null,
    videoCount: null
  };

  // Enhanced regular expressions for extracting information
  const creatorNamePatterns = [
    /(?:creator|talent|influencer|contractor|party|service provider)[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /(?:between|agreement between)[:\s]+([A-Za-z0-9\s&.,'-]+?)\s+and/i,
    /([A-Za-z0-9\s&.,'-]+?)(?:\s+)(?:hereinafter|referred to as)(?:\s+)(?:the creator|the talent|the influencer)/i
  ];
  
  const clientNamePatterns = [
    /(?:client|company|brand|second party|customer)[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i,
    /and[:\s]+([A-Za-z0-9\s&.,'-]+?)(?:\s+)(?:hereinafter|referred to as)(?:\s+)(?:the client|the company|the brand)/i,
    /agreement between(?:.*?)and(?:\s+)([A-Za-z0-9\s&.,'-]+?)(?:\r|\n|$|,)/i
  ];
  
  const amountPatterns = [
    /(?:compensation|payment|fee|amount|consideration)[:\s]*[$£€]?(\d+(?:[,.]\d+)?)/i,
    /payment[:\s]+(?:of|in the amount of)(?:\s+)[$£€]?(\d+(?:[,.]\d+)?)/i,
    /[$£€](\d+(?:[,.]\d+)?)[^0-9A-Za-z]*(?:compensation|payment|fee)/i
  ];
  
  const startDatePatterns = [
    /(?:start date|commencement date|effective date|begins on)[:\s]+([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i,
    /(?:agreement|contract)(?:\s+)(?:is effective|commences|begins|starts)(?:\s+)(?:on|as of)(?:\s+)([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i
  ];
  
  const endDatePatterns = [
    /(?:end date|termination date|expiration date|concludes on)[:\s]+([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i,
    /(?:shall|will)(?:\s+)(?:terminate|end|expire|conclude)(?:\s+)(?:on|as of)(?:\s+)([A-Za-z0-9\s,\.\/\-]+?)(?:\r|\n|$|,)/i
  ];
  
  const videoCountPatterns = [
    /(?:videos|content items|deliverables|posts|reels)[:\s]+(\d+)/i,
    /(\d+)(?:\s+)(?:videos|content items|deliverables|posts|reels)/i,
    /(?:produce|create|deliver)[:\s]+(\d+)(?:\s+)(?:videos|posts|reels|content pieces)/i
  ];

  // Try each pattern until a match is found
  for (const pattern of creatorNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.creatorName = match[1].trim();
      break;
    }
  }
  
  for (const pattern of clientNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.clientName = match[1].trim();
      break;
    }
  }
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/,/g, '');
      data.amount = parseFloat(amountStr);
      break;
    }
  }
  
  for (const pattern of startDatePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.startDate = parseDate(match[1].trim());
      break;
    }
  }
  
  for (const pattern of endDatePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.endDate = parseDate(match[1].trim());
      break;
    }
  }
  
  for (const pattern of videoCountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.videoCount = parseInt(match[1]);
      break;
    }
  }

  // Fallback strategies for missing data
  
  // If client name is missing, look for company names followed by "Inc", "LLC", etc.
  if (!data.clientName) {
    const companyMatch = text.match(/([A-Za-z0-9\s&.,'-]+?)(?:Inc|LLC|Ltd|Corp|Company)/i);
    if (companyMatch && companyMatch[1]) {
      data.clientName = (companyMatch[1] + companyMatch[0].substring(companyMatch[1].length)).trim();
    }
  }
  
  // If amount is missing, look for dollar amounts
  if (!data.amount) {
    const dollarMatch = text.match(/[$£€]\s*(\d+(?:[,.]\d+)?)/i);
    if (dollarMatch && dollarMatch[1]) {
      data.amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
    }
  }
  
  // If dates are missing, try to find any dates in the document
  if (!data.startDate || !data.endDate) {
    const dateMatches = text.match(/(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/g);
    if (dateMatches && dateMatches.length >= 2) {
      if (!data.startDate) {
        data.startDate = parseDate(dateMatches[0]);
      }
      if (!data.endDate) {
        data.endDate = parseDate(dateMatches[1]);
      }
    } else if (dateMatches && dateMatches.length === 1) {
      if (!data.startDate) {
        data.startDate = parseDate(dateMatches[0]);
        // Set end date to 30 days after start date
        if (data.startDate) {
          const endDate = new Date(data.startDate);
          endDate.setDate(endDate.getDate() + 30);
          data.endDate = endDate;
        }
      }
    }
  }

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
    // Return empty data structure instead of throwing error
    if (documentType === 'Invoice') {
      return {
        creatorName: null,
        clientName: null,
        amount: null,
        dueDate: null,
        videoCount: null
      };
    } else {
      return {
        creatorName: null,
        clientName: null,
        amount: null,
        startDate: null,
        endDate: null,
        videoCount: null
      };
    }
  }
};

module.exports = {
  processPdfDocument
};