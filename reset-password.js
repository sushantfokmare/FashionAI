// Quick script to reset password for sushantfokmare@gmail.com
require('dotenv').config({ path: './project/backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NEW_PASSWORD = 'Sushant@123'; // Change this to whatever you want

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      avatar: String,
    }));
    
    const user = await User.findOne({ email: 'sushantfokmare@gmail.com' });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password reset successful!');
    console.log('Email:', 'sushantfokmare@gmail.com');
    console.log('New Password:', NEW_PASSWORD);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
