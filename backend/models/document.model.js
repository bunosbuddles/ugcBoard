const mongoose = require('mongoose');

// Document Schema (for Invoices and Contracts)
const documentSchema = new mongoose.Schema({
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator'
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
    creatorName: String,
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
  }
});

module.exports = mongoose.model('Document', documentSchema);
