const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin.model'); // Adjust path as needed

// Function to manually register an admin
async function manualRegisterAdmin() {
  try {
    // Database connection (replace with your MongoDB connection string)
    await mongoose.connect('mongodb+srv://projectclaude312:dingusbingus5000@ugc-board.mpjt6.mongodb.net/?retryWrites=true&w=majority&appName=ugc-board', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Admin details to register
    const adminData = {
      username: 'projectclaude312',
      email: 'projectclaude312@gmail.com',
      password: 'dingusbingus5000'
    };

    // Check if admin already exists
    let existingAdmin = await Admin.findOne({ 
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('Admin already exists with this email or username');
      await mongoose.connection.close();
      return;
    }

    // Create new admin
    const admin = new Admin(adminData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(adminData.password, salt);

    // Save admin
    await admin.save();

    console.log('Admin registered successfully!');
    console.log('Admin ID:', admin._id);

    // Close database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error registering admin:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

// Run the registration function
manualRegisterAdmin();