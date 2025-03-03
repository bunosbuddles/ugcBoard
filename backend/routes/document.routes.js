const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Multer middleware for file uploads

// Document routes
router.post('/upload', auth, upload.single('document'), documentController.uploadDocument);
router.post('/extract', auth, upload.single('document'), documentController.extractDocumentData);
router.get('/', auth, documentController.getAllDocuments);
router.get('/:id', auth, documentController.getDocumentById);
router.get('/deal/:dealId', auth, documentController.getDocumentsByDealId);
router.delete('/:id', auth, documentController.deleteDocument);

module.exports = router;
