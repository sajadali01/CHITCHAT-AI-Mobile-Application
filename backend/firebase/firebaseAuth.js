const admin = require('firebase-admin');

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '❌ Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Put basic info in req.user
    req.user = {
      uid: decodedToken.uid,
      name: decodedToken.name || '',
      email: decodedToken.email || '',
      picture: decodedToken.picture || '',
    };

    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({ message: '❌ Invalid or expired token' });
  }
}

module.exports = authenticateUser;
