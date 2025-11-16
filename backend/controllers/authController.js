const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a strong secret in production!

// Email/password registration
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    user = await User.create({ name, email, password });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Email/password login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google registration (only on signup)
exports.googleRegister = async (req, res) => {
  try {
    const { uid, name, email, picture } = req.user;
    if (!email) {
      return res.status(400).json({ message: 'Invalid token: email missing' });
    }
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        name: req.body.name || name || 'Unnamed',
        email,
        profileImage: req.body.profileImage || picture || '',
      });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
    });
  } catch (error) {
    console.error('Google register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google login (only allow if user exists)
exports.googleLogin = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
