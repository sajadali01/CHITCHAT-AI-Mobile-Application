// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyBM0_ZBfs8RrSMW6NwfLvuqmKUs3oQfrK8",
//   authDomain: "chitchat-ai-2beed.firebaseapp.com",
//   projectId: "chitchat-ai-2beed",
//   storageBucket: "chitchat-ai-2beed.firebasestorage.app",
//   messagingSenderId: "838582514607",
//   appId: "1:838582514607:web:cf12873492c46370e4755a"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);


import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBM0_ZBfs8RrSMW6NwfLvuqmKUs3oQfrK8",
  authDomain: "chitchat-ai-2beed.firebaseapp.com",
  projectId: "chitchat-ai-2beed",
  storageBucket: "chitchat-ai-2beed.firebasestorage.app",
  messagingSenderId: "838582514607",
  appId: "1:838582514607:web:cf12873492c46370e4755a"
};

const FIREBASE_APP = initializeApp(firebaseConfig);

const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { FIREBASE_APP, FIREBASE_AUTH };