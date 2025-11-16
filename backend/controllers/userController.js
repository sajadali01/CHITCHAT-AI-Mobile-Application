// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching users' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ message: '✅ Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: '❌ Error updating profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Check new password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    // Optionally: Add password strength validation here
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error changing password' });
  }
};

module.exports = {
  getUsers,
  getProfile,
  updateProfile,
  changePassword,
};
