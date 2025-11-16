// // firebase/firebaseConfig.js
// const admin = require('firebase-admin');

// if (!process.env.FIREBASE_SERVICE_KEY) {
//   throw new Error('FIREBASE_SERVICE_KEY environment variable is not set');
// }

// // Parse the JSON from the environment variable
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// module.exports = admin;

