"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  ShieldCheck, 
  KeyRound, 
  X, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  QrCode, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const { 
    isAuthenticated, 
    user, 
    requires2FA, 
    loginWithGoogle, 
    loginWithEmail, 
    verify2FA, 
    logout 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"google" | "email" | "2fa">("google");
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""]);
  const [emailInput, setEmailInput] = useState("abhaykumawat@gmail.com");
  const [nameInput, setNameInput] = useState("Abhay Kumawat");
  const [passwordInput, setPasswordInput] = useState("••••••••");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(24);

  // Synchronize 2FA step if required
  useEffect(() => {
    if (requires2FA) {
      setActiveTab("2fa");
    }
  }, [requires2FA]);

  // 30-second TOTP Countdown Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    soundscape.playTapSound();
    setIsVerifying(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsVerifying(false);
      loginWithGoogle({
        email: "abhaykumawat@gmail.com",
        name: "Abhay Kumawat",
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      });
      setActiveTab("2fa");
      soundscape.playSuccessSound();
    }, 900);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    if (!emailInput.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    loginWithEmail(emailInput, nameInput);
    setSuccessMessage("Logged in successfully!");
    soundscape.playSuccessSound();
    setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 800);
  };

  const handleTotpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...totpCode];
    newCode[index] = val.slice(-1);
    setTotpCode(newCode);

    // Auto-advance focus
    if (val && index < 5) {
      const nextInput = document.getElementById(`totp-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify2FA = () => {
    soundscape.playTapSound();
    const fullCode = totpCode.join("");
    if (fullCode.length < 6) {
      setErrorMessage("Enter all 6 digits from Google Authenticator");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    setTimeout(() => {
      const success = verify2FA(fullCode);
      setIsVerifying(false);
      if (success) {
        setSuccessMessage("Google Authenticator verified!");
        soundscape.playVictoryFanfare();
        setTimeout(() => {
          onClose();
          setSuccessMessage("");
          setTotpCode(["", "", "", "", "", ""]);
        }, 900);
      } else {
        setErrorMessage("Invalid code. Enter 123456 or any 6-digit code.");
      }
    }, 600);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-smooth-reveal">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
              FitX Authentication
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Google 2FA
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Secure single sign-on & Authenticator TOTP
            </p>
          </div>
        </div>

        {/* User Logged In Card if already active */}
        {isAuthenticated && user && !requires2FA && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  {user.name}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">{user.email}</p>
                <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 uppercase bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                  Google Authenticator Protected
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                soundscape.playTapSound();
              }}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        {!requires2FA && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab("google");
                soundscape.playTapSound();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === "google"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>Google Sign-In</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("2fa");
                soundscape.playTapSound();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === "2fa"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google 2FA PIN</span>
            </button>
          </div>
        )}

        {/* Tab 1: Google OAuth Direct Sign-In */}
        {activeTab === "google" && !requires2FA && (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Instant Google Sign-In
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate securely using your Google Account with end-to-end encryption.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Connecting to Google OAuth...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as Abhay Kumawat</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">
                or sign in with email
              </span>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-98"
              >
                Sign In with Email
              </button>
            </form>
          </div>
        )}

        {/* Tab 2 / Step 2: Google Authenticator 2FA Code Input */}
        {activeTab === "2fa" && (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    Google Authenticator 2FA
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span>{timerSeconds}s</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                Enter the 6-digit verification code from your **Google Authenticator** app.
              </p>

              {/* 6-Digit PIN Inputs */}
              <div className="flex justify-between gap-1.5 py-1">
                {totpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`totp-pin-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && idx > 0) {
                        const prev = document.getElementById(`totp-pin-${idx - 1}`);
                        prev?.focus();
                      }
                    }}
                    className="w-11 h-13 text-center text-lg font-mono font-black rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerify2FA}
                disabled={isVerifying}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Verify Authenticator PIN</span>
                  </>
                )}
              </button>
            </div>

            {/* Secret key & Quick Demo Help */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-emerald-600" /> TOTP Secret Key:
                </span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy Key"}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800">
                <span>JBSWY3DPEHPK3PXP</span>
                <span className="text-[10px] text-slate-400 font-sans">Demo PIN: 123456</span>
              </div>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
