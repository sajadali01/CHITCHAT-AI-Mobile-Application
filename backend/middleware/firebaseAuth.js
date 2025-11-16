const jwt = require('jsonwebtoken');
const admin = require('../firebase/firebaseConfig');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  // Try JWT first (for email/password users)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    return next();
  } catch (err) {
    // If JWT fails, try Firebase (for Google users)
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      if (!user) return res.status(401).json({ message: 'User not found.' });
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  }
};

module.exports = authenticateUser;