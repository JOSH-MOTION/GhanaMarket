import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { Database } from '../lib/database.types';
import type { FirebaseError } from 'firebase/app';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: {
      full_name: string;
      phone: string;
      role: 'buyer' | 'seller';
      avatar_url?: string | null;
      // Seller-only extras
      store_name?: string;
      store_logo_url?: string | null;
    }
  ) => Promise<{ error: FirebaseError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: FirebaseError | Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const snap = await getDoc(doc(db, 'profiles', userId));
      if (snap.exists()) {
        const data = snap.data() as Profile;
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch {
      // Ignore fetch errors for now; keep profile null
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp: AuthContextType['signUp'] = async (email, password, userData) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const profilePayload: Profile = {
        id: uid,
        role: userData.role,
        full_name: userData.full_name,
        phone: userData.phone,
        phone_verified_at: null,
        avatar_url: userData.avatar_url ?? null,
        location_lat: null,
        location_lon: null,
        city: null,
        region: null,
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'profiles', uid), profilePayload);

      if (userData.role === 'seller' && userData.store_name) {
        const slug = userData.store_name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        const sellerProfile: Database['public']['Tables']['seller_profiles']['Insert'] = {
          user_id: uid,
          store_name: userData.store_name,
          store_slug: slug,
          logo_url: userData.store_logo_url ?? null,
          bio: null,
          business_doc_url: null,
          verification_status: 'pending',
          verified_at: null,
          rating_avg: 0,
          rating_count: 0,
          total_sales: 0,
          followers_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Use seller_profiles doc with id=uid for simplicity
        await setDoc(doc(db, 'seller_profiles', uid), sellerProfile as unknown as Database['public']['Tables']['seller_profiles']['Insert']);
      }

      // Populate local state
      setUser(cred.user);
      setProfile(profilePayload);
      return { error: null };
    } catch (error: unknown) {
      return { error: (error as Error) };
    }
  };

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: unknown) {
      return { error: (error as Error) };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
