// utils/firebaseAdmin.js
const admin = require('firebase-admin');

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(require('../firebaseServiceKey.json')),
  });
} else {
  app = admin.app(); // Reuse the existing initialized app
}

module.exports = admin;
