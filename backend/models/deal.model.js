const mongoose = require('mongoose');

// Deal Schema
const dealSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Active', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  contractAmount: {
    type: Number,
    required: true
  },
  videosRequired: {
    type: Number,
    required: true
  },
  videosDelivered: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentDueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deal', dealSchema);
