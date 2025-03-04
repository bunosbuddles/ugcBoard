// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/backend-config-file.js');

/**
 * Register a new user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with user token
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, name, phone, socialHandles } = req.body;

    // Check if user with email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if user with username already exists
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this username' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      name: name || username, // Use name if provided, otherwise use username
      phone,
      socialHandles
    });

    // Save user to database
    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '7d' }, // Longer expiry for better user experience
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with user token
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with user data
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // Get user from database (exclude password)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated user data
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, socialHandles } = req.body;
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        phone,
        socialHandles,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change password
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with success message
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};