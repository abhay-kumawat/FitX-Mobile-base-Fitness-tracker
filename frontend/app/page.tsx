"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleAuthModal } from "@/components/GoogleAuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  Flame, 
  Dumbbell, 
  Zap, 
  Target,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Check, 
  Sparkles,
  LayoutDashboard
} from "lucide-react";

export default function WebsiteLandingPage() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user, logout, loginWithEmail, loginWithGoogle } = useAuthStore();

  // Form State
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("abhaykumawat@gmail.com");
  const [name, setName] = useState("Abhay Kumawat");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleOpenAuthModal = () => {
    soundscape.playTapSound();
    setAuthModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    setIsSubmitting(true);
    setStatusMessage("");

    setTimeout(() => {
      setIsSubmitting(false);
      loginWithEmail(email, mode === "signup" ? name : undefined);
      soundscape.playVictoryFanfare();
      setStatusMessage(mode === "signup" ? "Account Created! Redirecting..." : "Welcome Back! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }, 600);
  };

  const handleStartMission = () => {
    soundscape.playTapSound();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      router.push("/workout");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF8] text-slate-900 font-sans p-3 sm:p-6 flex flex-col justify-between max-w-6xl mx-auto space-y-8 animate-smooth-reveal">
      <GoogleAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Main Grid: Left Showcase & Right Auth Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Hero Showcase & Mission Card */}
        <div className="md:col-span-6 lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
          {/* Logo Header & Quick Badges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Fit</span>
                <span className="text-2xl font-black text-emerald-500 tracking-tight">x</span>
              </div>
              
              {isAuthenticated && user && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Hi, {user.name}</span>
                  <button
                    onClick={() => {
                      soundscape.playTapSound();
                      logout();
                    }}
                    className="text-[11px] font-extrabold text-rose-600 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-tight">
                Stronger Today, <br />
                <span className="text-emerald-500">Better Tomorrow.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                Track your workouts, follow plans and achieve your fitness goals.
              </p>
            </div>

            {/* Target & Streak Badges */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today's Primary Target</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>12 Day Streak</span>
              </div>
            </div>
          </div>

          {/* Athlete Hero Graphic & Overlay Mission Card */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-xl min-h-[380px] flex flex-col justify-end p-4 sm:p-5 group">
            {/* Athlete Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/hero_athlete.png"
                alt="Fitness Athlete"
                className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            </div>

            {/* Floating Mission Overlay Box */}
            <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl space-y-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-950">
                  Upper Body Hypertrophy Phase 2
                </h3>
                <p className="text-[11px] text-slate-600 font-medium leading-snug mt-0.5">
                  Focus: Incline Barbell Bench, Chest Dips & Cable Lateral Raises (45 min)
                </p>
              </div>

              {/* 3 Metric Stat Pills */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/80">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">EST. VOLUME</span>
                  <span className="text-xs font-black text-emerald-600 mt-0.5 block">4,250 kg</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/80">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">TARGET XP</span>
                  <span className="text-xs font-black text-amber-600 mt-0.5 block">+450 XP</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/80">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">REST WINDOW</span>
                  <span className="text-xs font-black text-sky-600 mt-0.5 block">90s / set</span>
                </div>
              </div>

              {/* Start Mission Button */}
              <button
                type="button"
                onClick={handleStartMission}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Dumbbell className="w-4 h-4" />
                <span>START MISSION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Clean Authentication Card */}
        <div className="md:col-span-6 lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {mode === "signin" ? "Welcome Back! 👋" : "Create Account 👋"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {mode === "signin"
                  ? "Sign in to continue your fitness journey"
                  : "Join 45,000+ athletes leveling up their performance"}
              </p>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <div className="relative">
                    <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className="font-semibold text-slate-600">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    soundscape.playTapSound();
                    setStatusMessage("Password reset link sent to your email!");
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Status Toast Message */}
              {statusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold flex items-center justify-center gap-1.5 animate-smooth-reveal">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Primary Green Sign In / Sign Up Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">
                OR
              </span>
            </div>

            {/* Social Authentication Buttons */}
            <div className="space-y-2.5">
              {/* Continue with Google (triggers Google 2FA Modal) */}
              <button
                type="button"
                onClick={handleOpenAuthModal}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2.5 transition-all active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue with Apple */}
              <button
                type="button"
                onClick={() => {
                  soundscape.playTapSound();
                  setStatusMessage("Connecting to Apple Single Sign-On...");
                  setTimeout(() => {
                    loginWithEmail("abhaykumawat@icloud.com", "Abhay Kumawat");
                    router.push("/dashboard");
                  }, 800);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2.5 transition-all active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.02.12-9.88-1.99-14.59-6.35-3.17-2.75-7.07-7.46-11.68-14.13-7.53-10.74-13.43-22.95-17.71-36.63-4.28-13.68-6.42-26.65-6.42-38.9 0-14.71 3.59-27.1 10.77-37.16 7.18-10.07 16.48-15.19 27.9-15.36 4.9.06 10.05 1.25 15.46 3.58 5.4 2.33 9.38 3.54 11.95 3.63 2.12-.12 6.16-1.36 12.13-3.74 5.96-2.38 10.96-3.52 15.01-3.41 12.73.59 22.84 5.25 30.34 13.98-11.26 6.81-16.76 16.29-16.5 28.43.26 9.61 3.99 17.58 11.19 23.91 7.2 6.33 15.66 9.87 25.38 10.62-2.52 7.54-6.02 15.82-10.51 24.84zM119.22 31.8c0-7.39 2.72-14.47 8.16-21.23 5.44-6.76 12.28-10.57 20.52-11.43.26.94.39 1.88.39 2.82 0 7.33-2.73 14.5-8.19 21.52-5.46 7.02-12.39 10.87-20.79 11.55-.09-1.07-.13-2.15-.09-3.23z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Toggle Sign In / Sign Up Footer */}
            <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      setMode("signup");
                      setStatusMessage("");
                    }}
                    className="font-black text-emerald-600 hover:text-emerald-700 ml-1"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      setMode("signin");
                      setStatusMessage("");
                    }}
                    className="font-black text-emerald-600 hover:text-emerald-700 ml-1"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Terms & Privacy */}
            <p className="text-[10px] text-center text-slate-400 font-medium leading-tight">
              By continuing, you agree to our{" "}
              <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
              <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
            </p>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-semibold gap-2">
        <div>
          © 2026 <span className="font-black text-slate-900">Fit</span> <span className="font-black text-emerald-500">x</span>
        </div>
        <div>
          Train Smart. Stay Consistent. <span className="text-emerald-600 font-bold">Get Results.</span>
        </div>
      </footer>
    </div>
  );
}
