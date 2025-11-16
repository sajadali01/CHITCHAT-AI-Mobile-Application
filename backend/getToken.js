// getToken.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getIdToken } = require('firebase/auth');

// Replace with your Firebase Web SDK config (from Project Settings > General)
const firebaseConfig = {
  apiKey: "AIzaSyBM0_ZBfs8RrSMW6NwfLvuqmKUs3oQfrK8",
  authDomain: "chitchat-ai-2beed.firebaseapp.com",
  projectId: "chitchat-ai-2beed",
  storageBucket: "chitchat-ai-2beed.firebasestorage.app",
  messagingSenderId: "838582514607",
  appId: "1:838582514607:web:cf12873492c46370e4755a"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Replace these with the test user credentials
const email = 'testuser@example.com';
const password = '123456';

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    const token = await user.getIdToken();
    console.log('✅ Firebse Token:\n', token);
    process.exit();a
  })
  .catch((error) => {
    console.error('❌ Error signing in:', error.message);
    process.exit(1);
  });
