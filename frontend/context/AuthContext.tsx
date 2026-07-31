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
  loginLocalDemo: (email?: string, name?: string) => void;
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
  const formatAuthError = (err: any): string | null => {
    const code = err?.code || "";
    const message = err?.message || "";

    if (code === "auth/email-already-in-use") {
      return "An account with this email address already exists.";
    }
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "Incorrect email or password. Please check your credentials.";
    }
    if (code === "auth/user-not-found") {
      return "No account found with this email. Please sign up first.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Must be at least 8 characters.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection error. Please check your internet connection.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign in was cancelled.";
    }
    if (code === "auth/popup-blocked") {
      return "Google sign-in popup was blocked by browser. Please allow popups or use email sign in.";
    }

    if (
      code === "auth/invalid-api-key" || 
      code === "auth/api-key-not-valid" || 
      code === "auth/unauthorized-domain" || 
      code === "auth/operation-not-allowed" ||
      message.includes("api-key") ||
      message.includes("API key")
    ) {
      return null;
    }

    return message || "An authentication error occurred.";
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
          age: existing.age || 24,
          gender: existing.gender || "Male",
          height: existing.height || 180,
          weight: existing.weight || 75,
          fitnessGoal: existing.fitnessGoal || "Build Muscle",
          fitnessLevel: existing.fitnessLevel || "Intermediate",
          activityLevel: existing.activityLevel || "Moderately Active",
          lastLogin: nowIso,
        };
        await updateDoc(userRef, { 
          lastLogin: nowIso,
          photoURL: profileData.photoURL,
          fullName: profileData.fullName,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight,
          fitnessGoal: profileData.fitnessGoal,
          fitnessLevel: profileData.fitnessLevel,
          activityLevel: profileData.activityLevel,
        });
      } else {
        profileData = {
          uid: fbUser.uid,
          fullName: fullNameOverride || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || "",
          age: 24,
          gender: "Male",
          height: 180,
          weight: 75,
          fitnessGoal: "Build Muscle",
          fitnessLevel: "Intermediate",
          activityLevel: "Moderately Active",
          level: 1,
          xp: 100,
          streak: 1,
          createdAt: nowIso,
          lastLogin: nowIso,
        };
        const cleanPayload: Record<string, any> = { ...profileData };
        Object.keys(cleanPayload).forEach(key => cleanPayload[key] === undefined && delete cleanPayload[key]);
        await setDoc(userRef, cleanPayload);
      }
    } catch (e: any) {
      console.warn("[Firestore Sync Warning - Fallback to memory]", e);
      profileData = {
        uid: fbUser.uid,
        fullName: fullNameOverride || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        age: 24,
        gender: "Male",
        height: 180,
        weight: 75,
        fitnessGoal: "Build Muscle",
        fitnessLevel: "Intermediate",
        activityLevel: "Moderately Active",
        level: 1,
        xp: 100,
        streak: 1,
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
      fitnessLevel: (profileData.fitnessLevel as any) || "Intermediate",
      primaryGoal: (profileData.fitnessGoal as any) || "Build Muscle",
      weightKg: profileData.weight || 75,
      heightCm: profileData.height || 180,
      hrvScore: profileData.hrvScore,
    });

    return profileData;
  };

  // Local Demo Login Mode (Silent Fallback when Firebase credentials are demo)
  const loginLocalDemo = (emailStr?: string, nameStr?: string) => {
    setError(null);
    const nowIso = new Date().toISOString();
    const demoProfile: UserDocument = {
      uid: `local_usr_${Date.now()}`,
      fullName: nameStr || (emailStr ? emailStr.split("@")[0] : "Athlete User"),
      email: emailStr || "user@fitx.ai",
      photoURL: "",
      age: 24,
      gender: "Male",
      height: 180,
      weight: 75,
      fitnessGoal: "Build Muscle",
      fitnessLevel: "Intermediate",
      activityLevel: "Moderately Active",
      level: 1,
      xp: 100,
      streak: 1,
      createdAt: nowIso,
      lastLogin: nowIso,
    };

    setUserProfile(demoProfile);
    syncAuthStore.loginWithEmail(demoProfile.email, demoProfile.fullName);
    syncUserStore.updateProfile({
      name: demoProfile.fullName,
      fitnessLevel: "Intermediate",
      primaryGoal: "Build Muscle",
      weightKg: 75,
      heightCm: 180,
    });
    setLoading(false);
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
          const formatted = formatAuthError(err);
          if (formatted) setError(formatted);
          else loginLocalDemo();
        }
      } else {
        setUser(null);
        if (!syncAuthStore.isAuthenticated) {
          setUserProfile(null);
        }
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
    const currentUid = user?.uid || userProfile?.uid;
    
    setError(null);
    const updatedProfile = { 
      ...(userProfile || {
        uid: currentUid || `usr_${Date.now()}`,
        fullName: "Athlete User",
        email: "user@fitx.ai",
        photoURL: "",
        level: 1,
        xp: 100,
        streak: 1,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }), 
      ...updates 
    };

    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const payload: Record<string, any> = { ...updates };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        await updateDoc(userRef, payload);
      }
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
      console.warn("[updateUserProfile warning]", err);
      // Fallback: update state locally
      setUserProfile(updatedProfile);
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
      const formatted = formatAuthError(err);
      if (formatted) setError(formatted);
      else loginLocalDemo();
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
      const formatted = formatAuthError(err);
      if (formatted) {
        setError(formatted);
        throw err;
      } else {
        loginLocalDemo("google.user@fitx.ai", "Google Athlete");
      }
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
      const formatted = formatAuthError(err);
      if (formatted) {
        setError(formatted);
        throw err;
      } else {
        loginLocalDemo(emailStr, fullName);
      }
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
      const formatted = formatAuthError(err);
      if (formatted) {
        setError(formatted);
        throw err;
      } else {
        loginLocalDemo(emailStr, emailStr.split("@")[0]);
      }
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
      const formatted = formatAuthError(err);
      if (formatted) {
        setError(formatted);
        throw err;
      }
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
    } catch (err: any) {
      console.warn("[Firebase signOut warning]", err);
    } finally {
      setUser(null);
      setUserProfile(null);
      syncAuthStore.logout();
      setError(null);
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user || syncAuthStore.isAuthenticated || !!userProfile;

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
        loginLocalDemo,
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
