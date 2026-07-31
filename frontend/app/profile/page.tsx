"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useUserStore } from "@/store/useUserStore";
import { MascotVector } from "@/components/atomic/MascotVector";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";
import { 
  Cpu, 
  Sliders, 
  Download, 
  ShieldCheck, 
  Dumbbell, 
  Sparkles, 
  X, 
  User, 
  Edit3, 
  RefreshCw, 
  AlertCircle,
  Flame,
  Award,
  HeartPulse,
  Scale,
  Ruler,
  Calendar,
  Activity,
  LogOut
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";

export default function ProfilePage() {
  const { userProfile, loading, error, updateUserProfile, refetchUserProfile } = useAuthContext();
  const { toggleInjury, toggleEquipment, profile: localStoreProfile } = useUserStore();
  
  const [mounted, setMounted] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    fitnessLevel: "",
    hrvScore: "",
  });

  const [simulatedSleep, setSimulatedSleep] = useState(8);
  const [simulatedVolume, setSimulatedVolume] = useState(100);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        fullName: userProfile.fullName || "",
        age: userProfile.age ? String(userProfile.age) : "",
        gender: userProfile.gender || "",
        weight: userProfile.weight ? String(userProfile.weight) : "",
        height: userProfile.height ? String(userProfile.height) : "",
        fitnessGoal: userProfile.fitnessGoal || "",
        fitnessLevel: userProfile.fitnessLevel || "",
        hrvScore: userProfile.hrvScore ? String(userProfile.hrvScore) : "",
      });
    }
  }, [userProfile]);

  const openEditModal = () => {
    soundscape.playTapSound();
    if (userProfile) {
      setEditForm({
        fullName: userProfile.fullName || "",
        age: userProfile.age ? String(userProfile.age) : "",
        gender: userProfile.gender || "",
        weight: userProfile.weight ? String(userProfile.weight) : "",
        height: userProfile.height ? String(userProfile.height) : "",
        fitnessGoal: userProfile.fitnessGoal || "",
        fitnessLevel: userProfile.fitnessLevel || "",
        hrvScore: userProfile.hrvScore ? String(userProfile.hrvScore) : "",
      });
    }
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playTapSound();
    setSaving(true);

    try {
      await updateUserProfile({
        fullName: editForm.fullName.trim() || userProfile?.fullName || "User",
        age: editForm.age ? Number(editForm.age) : undefined,
        gender: editForm.gender.trim() || undefined,
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        height: editForm.height ? Number(editForm.height) : undefined,
        fitnessGoal: editForm.fitnessGoal.trim() || undefined,
        fitnessLevel: editForm.fitnessLevel.trim() || undefined,
        hrvScore: editForm.hrvScore ? Number(editForm.hrvScore) : undefined,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const availableEquipment = ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar", "Kettlebell", "Resistance Bands"];
  const availableInjuries = ["Left Rotator Cuff", "Right Knee Patellar", "Lower Back Stiff", "Tennis Elbow"];

  const userEquipment = localStoreProfile?.equipment || ["Barbell", "Dumbbells", "Cable Machine", "Pull-Up Bar"];
  const userInjuries = localStoreProfile?.injuries || [];

  const handleExportJSON = () => {
    soundscape.playTapSound();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile || {}, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fitx_profile_${userProfile?.uid || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 1. Initial mounting spin
  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Loading Skeleton state
  if (loading) {
    return (
      <AuthGuard>
        <div className="flex flex-col gap-6 pb-28 animate-pulse">
          <div className="duo-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center gap-3">
            <div className="w-24 h-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-6 w-36 bg-slate-200 rounded-md animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-200">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="h-40 bg-white border border-slate-200 rounded-3xl animate-pulse p-5" />
          <div className="h-44 bg-white border border-slate-200 rounded-3xl animate-pulse p-5" />
        </div>
      </AuthGuard>
    );
  }

  // Helper renderer for missing fields
  const renderValue = (val: string | number | undefined, unit: string = "") => {
    if (val === undefined || val === null || val === "" || String(val).trim() === "") {
      return (
        <span className="inline-flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[11px] font-black border border-amber-200/80">
          Complete Your Profile
        </span>
      );
    }
    return <span className="font-black text-slate-900">{val} {unit}</span>;
  };

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6 pb-28 animate-smooth-reveal">
        {/* Firestore Error Alert with Retry Button */}
        {error && (
          <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                soundscape.playTapSound();
                refetchUserProfile();
              }}
              className="px-3 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Profile Header & Digital Twin Avatar */}
        <div className="duo-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-xs">
          <button
            onClick={openEditModal}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-2xl border border-slate-200 transition-all flex items-center gap-1 text-xs font-black"
            title="Edit Profile"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit Profile
          </button>

          {/* User Profile Photo or Mascot fallback */}
          <div className="relative">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black border-4 border-emerald-400 shadow-md">
                {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
              Lvl {userProfile?.level || 1}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              {userProfile?.fullName || "User"}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <PillBadge variant="green">
                Level {userProfile?.level || 1} ({userProfile?.xp || 100} XP)
              </PillBadge>
              <PillBadge variant="gold" icon={<Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}>
                {userProfile?.streak || 1} Day Streak
              </PillBadge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full pt-3 border-t border-slate-200 text-center font-mono">
            <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">Weight</span>
              <div className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                {renderValue(userProfile?.weight, "kg")}
              </div>
            </div>
            <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">Height</span>
              <div className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                {renderValue(userProfile?.height, "cm")}
              </div>
            </div>
            <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase truncate">HRV Score</span>
              <div className="text-xs sm:text-sm font-black text-emerald-600 truncate mt-0.5">
                {renderValue(userProfile?.hrvScore, "ms")}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Profile Card */}
        <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Authenticated Profile Card
            </h3>
            <button
              onClick={openEditModal}
              className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700 underline"
            >
              Update Info
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </span>
              <span className="font-black text-slate-900">{userProfile?.fullName || "User"}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Fitness Goal
              </span>
              {renderValue(userProfile?.fitnessGoal)}
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-500" /> Fitness Level
              </span>
              {renderValue(userProfile?.fitnessLevel)}
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Age
              </span>
              {renderValue(userProfile?.age, "yrs")}
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-500" /> Gender
              </span>
              {renderValue(userProfile?.gender)}
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> HRV Score
              </span>
              {renderValue(userProfile?.hrvScore, "ms")}
            </div>
          </div>
        </div>

        {/* Digital Twin 13-Layer Engine Hub */}
        <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" /> Digital Twin 13-Layer Engine
            </h3>
            <PillBadge variant="purple">Active Model</PillBadge>
          </div>

          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            Simulates metabolic burn, CNS fatigue, and tissue hypertrophy customized to your live profile telemetry.
          </p>

          <Button3D
            variant="blue"
            onClick={() => {
              soundscape.playTapSound();
              setShowSimulatorModal(true);
            }}
            className="text-xs py-2.5"
          >
            <Sliders className="w-4 h-4" /> Open "What-If" Scenario Simulator
          </Button3D>
        </div>

        {/* Biometrics & Equipment Manager */}
        <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-500" /> Equipment & Injury Checklist
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Available Gym Equipment</span>
            <div className="flex flex-wrap gap-1.5">
              {availableEquipment.map((eq) => {
                const active = userEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      if (toggleEquipment) toggleEquipment(eq);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {active ? "✓ " : "+ "}{eq}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Active Injury Shields</span>
            <div className="flex flex-wrap gap-1.5">
              {availableInjuries.map((inj) => {
                const active = userInjuries.includes(inj);
                return (
                  <button
                    key={inj}
                    type="button"
                    onClick={() => {
                      soundscape.playTapSound();
                      if (toggleInjury) toggleInjury(inj);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {active ? "🛡️ " : "+ "}{inj}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Settings & Gemini AI Status */}
        <div className="duo-card p-5 bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" /> System Settings & Gemini AI Status
          </h3>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-800">Gemini 3.6 Flash Engine</span>
            </div>
            <PillBadge variant="green">Online & Operational</PillBadge>
          </div>

          <Button3D variant="secondary" onClick={handleExportJSON} className="text-xs py-2.5">
            <Download className="w-4 h-4" /> Backup Profile Data (JSON)
          </Button3D>

          <button
            type="button"
            onClick={() => {
              soundscape.playTapSound();
              setShowLogoutModal(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Log Out Account</span>
          </button>
        </div>

        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
        />

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl relative animate-smooth-reveal max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                <Edit3 className="w-5 h-5 text-emerald-600" /> Edit Profile Biometrics
              </h3>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      placeholder="e.g. 75.0"
                      className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.height}
                      onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                      placeholder="e.g. 180"
                      className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Age (years)</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="e.g. 24"
                      className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">Fitness Goal</label>
                  <select
                    value={editForm.fitnessGoal}
                    onChange={(e) => setEditForm({ ...editForm, fitnessGoal: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Goal</option>
                    <option value="Build Muscle">Build Muscle</option>
                    <option value="Burn Fat">Burn Fat</option>
                    <option value="Build Habit">Build Habit</option>
                    <option value="Athletic Power">Athletic Power</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">Fitness Level</label>
                  <select
                    value={editForm.fitnessLevel}
                    onChange={(e) => setEditForm({ ...editForm, fitnessLevel: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Athlete">Athlete</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">HRV Score (ms)</label>
                  <input
                    type="number"
                    value={editForm.hrvScore}
                    onChange={(e) => setEditForm({ ...editForm, hrvScore: e.target.value })}
                    placeholder="e.g. 85"
                    className="p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Button3D
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button3D>
                  <Button3D
                    type="submit"
                    variant="green"
                    disabled={saving}
                    className="flex-1 text-xs"
                  >
                    {saving ? "Saving to Firestore..." : "Save Changes"}
                  </Button3D>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* What-If Scenario Simulator Modal */}
        {showSimulatorModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative animate-smooth-reveal">
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-600" /> "What-If" Scenario Simulator
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Simulated Night Sleep:</span>
                    <span className="text-sky-600 font-black">{simulatedSleep} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    value={simulatedSleep}
                    onChange={(e) => setSimulatedSleep(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Simulated Weekly Volume:</span>
                    <span className="text-emerald-600 font-black">{simulatedVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={simulatedVolume}
                    onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-extrabold text-slate-500 block uppercase">Projected Supercompensation</span>
                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                  +{Math.round((simulatedSleep * simulatedVolume) / 10)}% MPS Optimization
                </span>
              </div>

              <Button3D variant="blue" fullWidth onClick={() => setShowSimulatorModal(false)}>
                Apply Simulation Parameters
              </Button3D>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
