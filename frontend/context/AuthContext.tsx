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
  updateProfile,
  reload
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";

export interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  fitnessLevel?: string;
  activityLevel?: string;
  level: number;
  xp: number;
  streak: number;
  hrvScore?: number;
  createdAt: string;
  lastLogin: string;
}

export function isProfileComplete(profile: UserDocument | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.age &&
    profile.gender &&
    profile.height &&
    profile.weight &&
    profile.fitnessGoal &&
    profile.fitnessLevel
  );
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
  reloadUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserDocument>) => Promise<void>;
  refetchUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncAuthStore = useAuthStore();
  const syncUserStore = useUserStore();

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
        return "Network connection error. Please check your internet connection.";
      case "auth/popup-closed-by-user":
        return "Google sign in was cancelled.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      default:
        return err?.message || "An authentication error occurred. Please try again.";
    }
  };

  // Create or Sync Firestore User Document
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
          fullName: existing.fullName || fullNameOverride || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          photoURL: fbUser.photoURL || existing.photoURL || "",
          lastLogin: nowIso,
        };
        await updateDoc(userRef, { 
          lastLogin: nowIso,
          photoURL: profileData.photoURL,
          fullName: profileData.fullName,
        });
      } else {
        profileData = {
          uid: fbUser.uid,
          fullName: fullNameOverride || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || "",
          level: 1,
          xp: 0,
          streak: 0,
          createdAt: nowIso,
          lastLogin: nowIso,
        };
        // Omit undefined values when saving to Firestore
        const cleanPayload: Record<string, any> = { ...profileData };
        Object.keys(cleanPayload).forEach(key => cleanPayload[key] === undefined && delete cleanPayload[key]);
        await setDoc(userRef, cleanPayload);
      }
    } catch (e: any) {
      console.warn("[Firestore Sync Warning]", e);
      // Fallback local memory profile if offline
      profileData = {
        uid: fbUser.uid,
        fullName: fullNameOverride || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        level: 1,
        xp: 0,
        streak: 0,
        createdAt: nowIso,
        lastLogin: nowIso,
      };
    }

    // Sync Zustand stores
    syncAuthStore.loginWithGoogle({
      email: profileData.email,
      name: profileData.fullName,
      avatar: profileData.photoURL,
    });
    syncUserStore.updateProfile({
      name: profileData.fullName,
      fitnessLevel: (profileData.fitnessLevel as any) || undefined,
      primaryGoal: (profileData.fitnessGoal as any) || undefined,
      weightKg: profileData.weight,
      heightCm: profileData.height,
      hrvScore: profileData.hrvScore,
    });

    return profileData;
  };

  // Firebase Auth Observer (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setError(null);
      if (fbUser) {
        setUser(fbUser);
        try {
          const profile = await syncFirestoreUser(fbUser);
          setUserProfile(profile);
        } catch (err: any) {
          setError("Failed to load user profile from Firestore. Please click retry.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
        syncAuthStore.logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reload user object (used to check email verification status)
  const reloadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setUser({ ...auth.currentUser });
    }
  };

  // Update User Profile in Firestore and State Immediately
  const updateUserProfile = async (updates: Partial<UserDocument>) => {
    if (!user || !userProfile) {
      throw new Error("No authenticated user to update.");
    }
    
    setError(null);
    const updatedProfile = { ...userProfile, ...updates };
    const userRef = doc(db, "users", user.uid);

    try {
      // Clean undefined keys before Firestore write
      const payload: Record<string, any> = { ...updates };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      await updateDoc(userRef, payload);
      setUserProfile(updatedProfile);

      // Sync Zustand user store
      syncUserStore.updateProfile({
        name: updatedProfile.fullName,
        fitnessLevel: (updatedProfile.fitnessLevel as any) || undefined,
        primaryGoal: (updatedProfile.fitnessGoal as any) || undefined,
        weightKg: updatedProfile.weight,
        heightCm: updatedProfile.height,
        hrvScore: updatedProfile.hrvScore,
      });
    } catch (err: any) {
      console.error("[updateUserProfile error]", err);
      // Fallback: update state locally even if Firestore connection fails
      setUserProfile(updatedProfile);
      setError("Profile updated locally: " + formatAuthError(err));
    }
  };

  // Manual Retry / Refetch Profile
  const refetchUserProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await syncFirestoreUser(user);
      setUserProfile(profile);
    } catch (err: any) {
      setError("Failed to fetch user profile: " + formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

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
      syncAuthStore.logout();
    } catch (err: any) {
      setError(formatAuthError(err));
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user || syncAuthStore.isAuthenticated;

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
        reloadUser,
        updateUserProfile,
        refetchUserProfile,
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
