import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { FIREBASE_APP } from '@/firebaseConfig';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Use your client ID from Firebase → Google Sign-in → Web client (for OAuth)
    clientId: '238379754741-1k9fm9kmjl9eqhnnkpbo9g93almqugnv.apps.googleusercontent.com',
    // Optionally add androidClientId / iosClientId for native
  });

  const auth = getAuth(FIREBASE_APP);

  useEffect(() => {
    if (response?.type === 'success') {
      const { idToken } = response.authentication ?? {};
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential)
          .then((userCredential) => {
            console.log('Signed in!', userCredential.user);
            // Optionally: call your backend to store user info
          })
          .catch((error) => {
            console.error('Firebase Google sign-in error:', error);
          });
      }
    }
  }, [response]);

  return { promptAsync, request };
}
