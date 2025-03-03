// backend/routes/file.routes.js
const express = require('express');
const router = express.Router();
const fileService = require('../services/fileService');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/files/documents/:filename
 * @desc    Get document file
 * @access  Private
 */
router.get('/documents/:filename', auth, (req, res) => {
  const { filename } = req.params;
  
  try {
    // Stream file to response
    fileService.streamFileToResponse(filename, res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
});

module.exports = router;
