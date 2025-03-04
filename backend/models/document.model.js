// models/document.model.js
const mongoose = require('mongoose');

// Document Schema (for Invoices and Contracts)
const documentSchema = new mongoose.Schema({
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Invoice', 'Contract']
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  extractedData: {
    clientName: String,
    amount: Number,
    dueDate: Date,
    videoCount: Number,
    startDate: Date,
    endDate: Date
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Document', documentSchema);