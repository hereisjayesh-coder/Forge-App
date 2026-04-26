import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
         setUser(firebaseUser);
         setLoading(false);
      });
      return unsubscribe;
   }, []);

   const signInWithGoogle = async () => {
      try {
         const result = await signInWithPopup(auth, googleProvider);
         const credential = GoogleAuthProvider.credentialFromResult(result);
         if (credential && credential.accessToken) {
            localStorage.setItem('google_oauth_token', credential.accessToken);
         }
         return result;
      } catch (error) {
         console.error('Google sign-in failed:', error);
         throw error;
      }
   };

   const signOut = async () => {
      try {
         await firebaseSignOut(auth);
         localStorage.removeItem('google_oauth_token');
      } catch (error) {
         console.error('Sign out failed:', error);
      }
   };

   return (
      <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const context = useContext(AuthContext);
   if (!context) throw new Error('useAuth must be used within AuthProvider');
   return context;
}

export default AuthContext;
