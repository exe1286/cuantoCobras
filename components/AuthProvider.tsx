'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { dataService, Profile } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync or register user in mock DB.
        // During real DB phase, you'd fetch from Firestore `users` collection.
        let userProfile = await dataService.getProfileByUid(currentUser.uid);
        if (!userProfile) {
          userProfile = await dataService.createProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Usuario',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || undefined,
            role: 'user', // Default role
          });
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
