import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import axios from 'axios';
import { FIREBASE_APP } from '@/firebaseConfig';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth(onSuccess: () => void, onError: () => void) {
  const auth = getAuth(FIREBASE_APP);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: '238379754741-1k9fm9kmjl9eqhnnkpbo9g93almqugnv.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === 'success') {
        const { idToken } = response.authentication || {};
        if (idToken) {
          try {
            // Sign in to Firebase
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Get Firebase token to use as auth on backend
            const firebaseToken = await user.getIdToken();

            // Call your backend to create/sync user and get user info
            const res = await axios.post('http://10.138.62.96:5000/api/auth/google-login', {}, {
              headers: { Authorization: `Bearer ${firebaseToken}` }
            });
            const userData = res.data;
            // Store user and token in SecureStore
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            await SecureStore.setItemAsync('userToken', firebaseToken);

            onSuccess();
          } catch (error) {
            console.error('Google login error:', error);
            onError();
          }
        }
      }
    };
    handleGoogleLogin();
  }, [response]);

  return { promptAsync, request };
}

