// scripts/create-test-user.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const config = require('../config/backend-config-file.js');

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    
    if (existingUser) {
      console.log('Test user already exists');
      mongoose.disconnect();
      return;
    }
    
    // Create a new test user
    const newUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '123-456-7890',
      socialHandles: {
        instagram: 'testuser',
        tiktok: 'testuser',
        youtube: 'testuser'
      }
    });
    
    await newUser.save();
    console.log('Test user created successfully');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating test user:', err);
    mongoose.disconnect();
  }
}

createTestUser();