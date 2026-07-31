"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

export interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: string;
  activityLevel: string;
  createdAt: string;
  lastLogin: string;
  isPremium: boolean;
  streak: number;
  xp: number;
  level: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserDocument | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncStore = useAuthStore();

  // Helper to format Firebase Auth error messages cleanly
  const formatAuthError = (err: any): string => {
    const code = err?.code || "";
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email address already exists.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please check your credentials.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up first.";
      case "auth/weak-password":
        return "Password is too weak. Must be at least 8 characters.";
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet.";
      case "auth/popup-closed-by-user":
        return "Google sign in was cancelled.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      default:
        return err?.message || "An authentication error occurred. Please try again.";
    }
  };

  // Create or Update Firestore User Document
  const syncFirestoreUser = async (fbUser: FirebaseUser, fullNameOverride?: string): Promise<UserDocument> => {
    const nowIso = new Date().toISOString();
    const userRef = doc(db, "users", fbUser.uid);
    
    let profileData: UserDocument;

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const existing = snap.data() as UserDocument;
        profileData = {
          ...existing,
          lastLogin: nowIso,
          photoURL: fbUser.photoURL || existing.photoURL || "",
        };
        await updateDoc(userRef, { lastLogin: nowIso });
      } else {
        profileData = {
          uid: fbUser.uid,
          fullName: fullNameOverride || fbUser.displayName || "Abhay Kumawat",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || "https://lh3.googleusercontent.com/a/default-user=s96-c",
          gender: "Male",
          age: 24,
          height: 180,
          weight: 75,
          fitnessGoal: "Build Muscle",
          activityLevel: "Intermediate",
          createdAt: nowIso,
          lastLogin: nowIso,
          isPremium: true,
          streak: 12,
          xp: 2450,
          level: 5,
        };
        await setDoc(userRef, profileData);
      }
    } catch (e) {
      console.warn("[Firestore fallback mode]", e);
      profileData = {
        uid: fbUser.uid,
        fullName: fullNameOverride || fbUser.displayName || "Abhay Kumawat",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        gender: "Male",
        age: 24,
        height: 180,
        weight: 75,
        fitnessGoal: "Build Muscle",
        activityLevel: "Intermediate",
        createdAt: nowIso,
        lastLogin: nowIso,
        isPremium: true,
        streak: 12,
        xp: 2450,
        level: 5,
      };
    }

    return profileData;
  };

  // Firebase Auth Observer (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const profile = await syncFirestoreUser(fbUser);
        setUserProfile(profile);
        syncStore.loginWithEmail(fbUser.email || "", fbUser.displayName || profile.fullName);
      } else {
        setUser(null);
        setUserProfile(null);
        syncStore.logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Google Sign In
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncFirestoreUser(res.user);
      setUser(res.user);
      setUserProfile(profile);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Sign Up
  const signUpWithEmail = async (emailStr: string, pass: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, emailStr, pass);
      await updateProfile(res.user, { displayName: fullName });
      await sendEmailVerification(res.user);
      const profile = await syncFirestoreUser(res.user, fullName);
      setUser(res.user);
      setUserProfile(profile);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Login
  const loginWithEmail = async (emailStr: string, pass: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, emailStr, pass);
      const profile = await syncFirestoreUser(res.user);
      setUser(res.user);
      setUserProfile(profile);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Forgot Password
  const sendPasswordReset = async (emailStr: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, emailStr);
    } catch (err: any) {
      setError(formatAuthError(err));
      throw err;
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      syncStore.logout();
    } catch (err: any) {
      setError(formatAuthError(err));
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user || syncStore.isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        isAuthenticated,
        loginWithGoogle,
        signUpWithEmail,
        loginWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
