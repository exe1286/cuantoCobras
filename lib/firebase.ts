import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0289893911",
  appId: "1:914220604122:web:7a0ee10523b4e6613223e3",
  apiKey: "AIzaSyATd-_E_Hr2FhVVfX5qBLBDSezFKQgjTTE",
  authDomain: "gen-lang-client-0289893911.firebaseapp.com",
  storageBucket: "gen-lang-client-0289893911.firebasestorage.app",
  messagingSenderId: "914220604122",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signOut };
