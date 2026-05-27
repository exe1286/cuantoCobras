'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { dataService, Profile } from '@/lib/data';
import { generateUsername } from '@/lib/usernames';

export type AppUser = SupabaseUser & {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
};

interface AuthContextType {
  user: AppUser | null;
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

function normalizeUser(user: SupabaseUser): AppUser {
  return {
    ...user,
    uid: user.id,
    displayName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      null,
    photoURL:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };
}

async function syncProfile(user: AppUser) {
  let userProfile = await dataService.getProfileByUid(user.uid);

  if (!userProfile) {
    userProfile = await dataService.createProfile({
      uid: user.uid,
      name: user.displayName || 'Usuario',
      username: generateUsername(),
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      role: 'user',
    });
  } else if (!userProfile.username) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        userProfile = await dataService.updateProfileUsername(user.uid, generateUsername()) || userProfile;
        break;
      } catch (error) {
        if (attempt === 2) console.error('Error assigning username', error);
      }
    }
  }

  return userProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    let isMounted = true;

    async function loadSession() {
      const { data } = await client.auth.getSession();
      const sessionUser = data.session?.user;

      if (!isMounted) return;

      if (sessionUser) {
        const appUser = normalizeUser(sessionUser);
        setUser(appUser);
        setProfile(await syncProfile(appUser));
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const appUser = normalizeUser(session.user);
        setUser(appUser);
        setProfile(await syncProfile(appUser));
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const logout = async () => {
    if (!supabase) return;

    setUser(null);
    setProfile(null);

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
