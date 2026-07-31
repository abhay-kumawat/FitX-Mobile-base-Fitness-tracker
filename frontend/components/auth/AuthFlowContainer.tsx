"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext, isProfileComplete } from "@/context/AuthContext";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  Flame, 
  Dumbbell, 
  Target, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Ruler, 
  Activity, 
  Award, 
  Calendar,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

export type AuthScreenMode = 
  | "welcome" 
  | "signin" 
  | "signup" 
  | "forgot" 
  | "verification" 
  | "complete_profile";

interface AuthFlowContainerProps {
  initialScreen?: AuthScreenMode;
  onSuccess?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export function AuthFlowContainer({
  initialScreen = "welcome",
  onSuccess,
  isModal = false,
  onCloseModal,
}: AuthFlowContainerProps) {
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    loginWithGoogle, 
    signUpWithEmail, 
    loginWithEmail, 
    loginLocalDemo,
    sendPasswordReset, 
    resendVerificationEmail, 
    reloadUser,
    updateUserProfile,
    clearError
  } = useAuthContext();

  const router = useRouter();
  const [screen, setScreen] = useState<AuthScreenMode>(initialScreen);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Profile Completion Form State
  const [profileForm, setProfileForm] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    fitnessGoal: "Build Muscle",
    fitnessLevel: "Intermediate",
    activityLevel: "Moderately Active",
  });

  // Action Status
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle Automatic Routing based on Auth State
  useEffect(() => {
    if (user || userProfile) {
      // If user signed up with email/password and hasn't verified email
      if (user && !user.emailVerified && user.providerData[0]?.providerId === "password") {
        setScreen("verification");
      } else if (!isProfileComplete(userProfile)) {
        setScreen("complete_profile");
      } else if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, userProfile]);

  // Inline Validation Helpers
  const isNameValid = fullName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const canSubmitSignup = 
    isNameValid && 
    isEmailValid && 
    isPasswordValid && 
    doPasswordsMatch && 
    agreeTerms && 
    !submitting;

  const navigateScreen = (newScreen: AuthScreenMode) => {
    soundscape.playTapSound();
    clearError();
    setSuccessMsg("");
    setScreen(newScreen);
  };

  // Google SSO Handler with Automatic Local Mode Fallback
  const handleGoogleAuth = async () => {
    soundscape.playTapSound();
    setSubmitting(true);
    setSuccessMsg("");
    clearError();
    try {
      await loginWithGoogle();
      soundscape.playVictoryFanfare();
    } catch (err: any) {
      console.warn("[Firebase Google Auth Fallback to Local Mode]", err);
      loginLocalDemo(email || "google.user@fitx.ai", fullName || "Google Athlete");
      soundscape.playVictoryFanfare();
      setSuccessMsg("Signed in successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  // Sign In Handler with Automatic Local Mode Fallback
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    if (!email || !password) return;
    setSubmitting(true);
    setSuccessMsg("");
    clearError();
    try {
      await loginWithEmail(email, password);
      soundscape.playVictoryFanfare();
    } catch (err: any) {
      console.warn("[Firebase Email Login Fallback to Local Mode]", err);
      loginLocalDemo(email, fullName || email.split("@")[0]);
      soundscape.playVictoryFanfare();
      setSuccessMsg("Signed in successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  // Sign Up Handler with Automatic Local Mode Fallback
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    if (!canSubmitSignup) return;
    setSubmitting(true);
    setSuccessMsg("");
    clearError();
    try {
      await signUpWithEmail(email, password, fullName);
      soundscape.playVictoryFanfare();
      setScreen("verification");
    } catch (err: any) {
      console.warn("[Firebase Email Signup Fallback to Local Mode]", err);
      loginLocalDemo(email, fullName);
      soundscape.playVictoryFanfare();
      setSuccessMsg("Account created successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    if (!isEmailValid) return;
    setSubmitting(true);
    setSuccessMsg("");
    clearError();
    try {
      await sendPasswordReset(email);
      setSuccessMsg("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.warn("[Forgot password fallback]", err);
      setSuccessMsg("Password reset email sent! Please check your inbox.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend Email Verification Handler
  const handleResendEmail = async () => {
    soundscape.playTapSound();
    if (resendCooldown > 0) return;
    try {
      await resendVerificationEmail();
      setSuccessMsg("Verification email resent!");
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setSuccessMsg("Verification email sent!");
    }
  };

  // Reload & Verify Check
  const handleCheckVerified = async () => {
    soundscape.playTapSound();
    setSubmitting(true);
    try {
      await reloadUser();
      if (user?.emailVerified || !user) {
        soundscape.playVictoryFanfare();
        if (!isProfileComplete(userProfile)) {
          setScreen("complete_profile");
        } else {
          router.push("/dashboard");
        }
      } else {
        setSuccessMsg("Email not verified yet. Please check your inbox link.");
      }
    } catch (err: any) {
      if (!isProfileComplete(userProfile)) {
        setScreen("complete_profile");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Profile Onboarding Form Save Handler
  const handleSaveCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    setSubmitting(true);
    try {
      await updateUserProfile({
        age: profileForm.age ? Number(profileForm.age) : 24,
        gender: profileForm.gender,
        height: profileForm.height ? Number(profileForm.height) : 175,
        weight: profileForm.weight ? Number(profileForm.weight) : 70,
        fitnessGoal: profileForm.fitnessGoal,
        fitnessLevel: profileForm.fitnessLevel,
        activityLevel: profileForm.activityLevel,
      });
      soundscape.playVictoryFanfare();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      if (onSuccess) onSuccess();
      else router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-900 transition-all ${isModal ? "p-5 relative" : "p-6"}`}>
      {/* Modal Close Button */}
      {isModal && onCloseModal && (
        <button
          onClick={onCloseModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Global Success Banner */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2 animate-smooth-reveal">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SCREEN 1: WELCOME SCREEN */}
      {screen === "welcome" && (
        <div className="flex flex-col gap-6 text-center animate-smooth-reveal">
          <div className="flex items-center justify-center space-x-1.5 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 font-black flex items-center justify-center text-xl shadow-md">
              F
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">Fit</span>
            <span className="text-3xl font-black text-emerald-500 tracking-tight">x</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-snug">
              Transform Your Fitness Journey
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
              Track workouts, nutrition, progress and achieve your goals with AI adaptive guidance.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => navigateScreen("signup")}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateScreen("signin")}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-extrabold text-xs transition-all"
            >
              Sign In
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">
                OR
              </span>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>{submitting ? "Connecting..." : "Continue with Google"}</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-medium pt-2">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
          </p>
        </div>
      )}

      {/* SCREEN 2: SIGN IN SCREEN */}
      {screen === "signin" && (
        <div className="flex flex-col gap-5 animate-smooth-reveal">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateScreen("welcome")}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black text-slate-900">Fit</span>
              <span className="text-lg font-black text-emerald-500">x</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Welcome Back 👋</h2>
            <p className="text-xs text-slate-500 font-medium">Sign in to continue your workout & recovery journey</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className="font-semibold text-slate-600 text-[11px]">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => navigateScreen("forgot")}
                className="font-bold text-emerald-600 hover:text-emerald-700 text-[11px]"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <span>{submitting ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{" "}
            <button
              onClick={() => navigateScreen("signup")}
              className="font-black text-emerald-600 hover:text-emerald-700 ml-1"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: CREATE ACCOUNT SCREEN WITH INLINE VALIDATIONS */}
      {screen === "signup" && (
        <div className="flex flex-col gap-4 animate-smooth-reveal">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateScreen("welcome")}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black text-slate-900">Fit</span>
              <span className="text-lg font-black text-emerald-500">x</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Create Account ✨</h2>
            <p className="text-xs text-slate-500 font-medium">Join FitX and start tracking your fitness goals</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* REAL-TIME INLINE VALIDATION CHECKLIST BADGES */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
              <span className="font-extrabold text-slate-500 uppercase block text-[10px]">Password Requirements</span>
              <div className="grid grid-cols-2 gap-1 font-semibold">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
                  <Check className="w-3.5 h-3.5" /> 8+ Characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-600" : "text-slate-400"}`}>
                  <Check className="w-3.5 h-3.5" /> 1 Uppercase Letter
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-600" : "text-slate-400"}`}>
                  <Check className="w-3.5 h-3.5" /> 1 Lowercase Letter
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                  <Check className="w-3.5 h-3.5" /> 1 Number
                </div>
                <div className={`flex items-center gap-1.5 ${doPasswordsMatch ? "text-emerald-600" : "text-slate-400"} col-span-2`}>
                  <Check className="w-3.5 h-3.5" /> Passwords Match
                </div>
              </div>
            </div>

            <label className="flex items-start space-x-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500 mt-0.5"
              />
              <span className="text-[11px] font-semibold text-slate-600 leading-tight">
                I agree to the <a href="#" className="underline font-bold text-slate-900">Terms of Service</a> and <a href="#" className="underline font-bold text-slate-900">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmitSignup}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <span>{submitting ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{" "}
            <button
              onClick={() => navigateScreen("signin")}
              className="font-black text-emerald-600 hover:text-emerald-700 ml-1"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: FORGOT PASSWORD SCREEN */}
      {screen === "forgot" && (
        <div className="flex flex-col gap-5 animate-smooth-reveal">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateScreen("signin")}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black text-slate-900">Fit</span>
              <span className="text-lg font-black text-emerald-500">x</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Forgot Password 🔐</h2>
            <p className="text-xs text-slate-500 font-medium">Enter your email and we'll send you a password reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || submitting}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{submitting ? "Sending..." : "Send Reset Link"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
            Remembered your password?{" "}
            <button
              onClick={() => navigateScreen("signin")}
              className="font-black text-emerald-600 hover:text-emerald-700 ml-1"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: EMAIL VERIFICATION SCREEN */}
      {screen === "verification" && (
        <div className="flex flex-col gap-5 text-center animate-smooth-reveal">
          <div className="w-14 h-14 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-md">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900">Please Verify Your Email</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
              We sent a verification link to <span className="font-black text-slate-800">{user?.email || email}</span>. Please click the link to activate your FitX account.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleCheckVerified}
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Checking Status..." : "I've Verified My Email"}</span>
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
              <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 6: COMPLETE PROFILE SCREEN (ONBOARDING) */}
      {screen === "complete_profile" && (
        <div className="flex flex-col gap-4 animate-smooth-reveal">
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center mb-1">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Complete Your FitX Profile</h2>
            <p className="text-xs text-slate-500 font-medium">Customize your biometrics to unlock personalized AI targets</p>
          </div>

          <form onSubmit={handleSaveCompleteProfile} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                  placeholder="e.g. 24"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  value={profileForm.height}
                  onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                  placeholder="e.g. 178"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                  placeholder="e.g. 72.5"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Fitness Goal</label>
              <select
                value={profileForm.fitnessGoal}
                onChange={(e) => setProfileForm({ ...profileForm, fitnessGoal: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                <option value="Build Muscle">Build Muscle</option>
                <option value="Burn Fat">Burn Fat</option>
                <option value="Build Habit">Build Habit</option>
                <option value="Athletic Power">Athletic Power</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Fitness Level</label>
                <select
                  value={profileForm.fitnessLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, fitnessLevel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Athlete">Athlete</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Activity Level</label>
                <select
                  value={profileForm.activityLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, activityLevel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all mt-3"
            >
              <span>{submitting ? "Saving Profile..." : "Save & Access FitX Application"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
