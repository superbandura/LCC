import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { createUserProfile, getUserProfile, updateUserLastLogin, checkIfUsersExist } from '../firestoreService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const signupInProgressRef = useRef(false);

  const signup = async (email: string, password: string, displayName: string) => {
    // Set flag to prevent onAuthStateChanged from auto-creating profile
    signupInProgressRef.current = true;

    try {
      // Create Firebase Auth user FIRST
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name in Firebase Auth
      await updateProfile(userCredential.user, { displayName });

      // Check if other users exist (NOW user is authenticated)
      // This is safe to call after authentication
      const usersExist = await checkIfUsersExist();

      // Create user profile in Firestore
      // First user gets 'admin' role, subsequent users get 'user' role
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: usersExist ? 'user' : 'admin', // First user is admin
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await createUserProfile(userProfile);

      // Manually set AuthContext state since onAuthStateChanged will skip due to flag
      setCurrentUser(userCredential.user);
      setUserProfile(userProfile);
      setLoading(false);
    } finally {
      // Always clear the flag, even if an error occurs
      signupInProgressRef.current = false;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Skip profile loading during signup - signup() handles it directly
        if (signupInProgressRef.current) {
          console.log('[AuthContext] Signup in progress - skipping profile load');
          return;
        }

        try {
          // Load user profile from Firestore
          let profile = await getUserProfile(user.uid);

          if (profile) {
            // Update last login timestamp
            await updateUserLastLogin(user.uid);
            // Set user and profile TOGETHER, then mark as loaded
            setCurrentUser(user);
            setUserProfile(profile);
            setLoading(false);
          } else {
            console.warn('[AuthContext] User profile not found - creating automatically');

            // Try to create profile automatically from Firebase Auth data
            const displayName = user.displayName || user.email?.split('@')[0] || 'User';
            const email = user.email || '';

            // Check if any users exist to determine if this should be admin
            const usersExist = await checkIfUsersExist();

            const newProfile: UserProfile = {
              uid: user.uid,
              email: email,
              displayName: displayName,
              role: usersExist ? 'user' : 'admin',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };

            await createUserProfile(newProfile);
            console.log('[AuthContext] User profile created:', displayName, `(${usersExist ? 'user' : 'admin'})`);
            // Set user and profile TOGETHER, then mark as loaded
            setCurrentUser(user);
            setUserProfile(newProfile);
            setLoading(false);
          }
        } catch (error) {
          console.error('[AuthContext] Error loading/creating user profile:', error);
          setCurrentUser(user);
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
