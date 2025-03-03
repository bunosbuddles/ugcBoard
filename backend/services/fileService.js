// backend/services/fileService.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Base path for uploads
const uploadDir = path.join(__dirname, '../uploads');
const documentsDir = path.join(uploadDir, 'documents');

/**
 * Get file path from filename
 * @param {string} filename - Filename
 * @returns {string} Full file path
 */
const getFilePath = (filename) => {
  return path.join(documentsDir, filename);
};

/**
 * Get file URL (for API response)
 * @param {string} filename - Filename
 * @returns {string} File URL
 */
const getFileUrl = (filename) => {
  return `/api/files/documents/${filename}`;
};

/**
 * Delete file from storage
 * @param {string} filename - Filename to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filename) => {
  try {
    const filePath = getFilePath(filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Check if file exists
 * @param {string} filename - Filename to check
 * @returns {boolean} Whether file exists
 */
const fileExists = (filename) => {
  return fs.existsSync(getFilePath(filename));
};

/**
 * Stream file to response
 * @param {string} filename - Filename to stream
 * @param {Object} res - Express response object
 */
const streamFileToResponse = (filename, res) => {
  const filePath = getFilePath(filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Set content type
  res.contentType('application/pdf');
  
  // Create read stream and pipe to response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

module.exports = {
  getFilePath,
  getFileUrl,
  deleteFile,
  fileExists,
  streamFileToResponse
};
