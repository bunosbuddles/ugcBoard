// backend/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const config = require('../config/backend-config-file.js');

/**
 * Register a new admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with admin token
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin with email already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Check if admin with username already exists
    admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists with this username' });
    }

    // Create new admin
    admin = new Admin({
      username,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin to database
    await admin.save();

    // Create and return JWT token
    const payload = {
      admin: {
        id: admin.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login an admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with admin token
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      admin: {
        id: admin.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current admin information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with admin data
 */
exports.getCurrentAdmin = async (req, res) => {
  try {
    // Get admin from database (exclude password)
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Error in getCurrentAdmin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
