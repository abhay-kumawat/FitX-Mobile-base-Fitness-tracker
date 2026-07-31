"use client";

import React, { useState } from "react";
import {
  Trophy,
  Flame,
  Award,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X
} from "lucide-react";
import ConfettiBurst from "@/components/ConfettiBurst";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";
import { useAuthContext } from "@/context/AuthContext";

export default function CommunityPage() {
  const [kudosGiven, setKudosGiven] = useState<Record<number, number>>({ 1: 14, 2: 9, 3: 21 });
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard" | "prs">("feed");
  const [leaderboardFilter, setLeaderboardFilter] = useState<"global" | "friends">("global");
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [xpConfetti, setXpConfetti] = useState(false);

  const handleKudos = (postId: number) => {
    soundscape.playTapSound();
    setKudosGiven((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  const handleLevelUpSim = () => {
    soundscape.playVictoryFanfare();
    setXpConfetti(true);
  };

  const { userProfile } = useAuthContext();
  const currentUserName = userProfile?.fullName ? `${userProfile.fullName} (You)` : "You";

  const globalLeaderboards = [
    { rank: 1, name: "Jordan Miller", xp: 9850, volume: "24.5k kg", streak: "28d 🔥", badge: "🥇 Alpha Athlete" },
    { rank: 2, name: "Sarah Chen", xp: 8420, volume: "19.2k kg", streak: "19d 🔥", badge: "🥈 Squat Queen" },
    { rank: 3, name: currentUserName, xp: userProfile?.xp || 4450, volume: "14.5k kg", streak: `${userProfile?.streak || 12}d 🔥`, badge: "🥉 Iron Titan" },
    { rank: 4, name: "Marcus Vance", xp: 3900, volume: "12.8k kg", streak: "8d 🔥", badge: "Hypertrophy Beast" },
    { rank: 5, name: "Elena Rostova", xp: 3100, volume: "11.0k kg", streak: "5d 🔥", badge: "Consistent Lifter" },
  ];

  const friendsLeaderboards = [
    { rank: 1, name: currentUserName, xp: userProfile?.xp || 4450, volume: "14.5k kg", streak: `${userProfile?.streak || 12}d 🔥`, badge: "🥇 Iron Titan" },
    { rank: 2, name: "Marcus Vance", xp: 3900, volume: "12.8k kg", streak: "8d 🔥", badge: "🥈 Hypertrophy Beast" },
    { rank: 3, name: "Elena Rostova", xp: 3100, volume: "11.0k kg", streak: "5d 🔥", badge: "🥉 Consistent Lifter" },
  ];

  const activeLeaderboard = leaderboardFilter === "global" ? globalLeaderboards : friendsLeaderboards;

  const prs = [
    { exercise: "Barbell Bench Press", record: "102.5 kg", type: "Estimated 1RM", date: "2 days ago", icon: "🏋️‍♂️" },
    { exercise: "Barbell Back Squat", record: "140.0 kg", type: "Estimated 1RM", date: "5 days ago", icon: "🦵" },
    { exercise: "Incline DB Press", record: "34.0 kg x 8", type: "Max Weight Reps", date: "1 week ago", icon: "💪" },
    { exercise: "Plank Hold", record: "3m 15s", type: "Max Duration", date: "2 weeks ago", icon: "⏱️" },
  ];

  const feedPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      type: "New Personal Record",
      title: "Crushed a new PR on Back Squats! 🏋️‍♀️",
      content: "Hit 110kg x 5 on Back Squat at RPE 8. Feeling super strong today!",
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "Jordan Miller",
      type: "Workout Completed",
      title: "Hypertrophy Push Session Complete 💥",
      content: "18 total working sets in 52 minutes. Target chest & shoulder volume reached.",
      time: "5 hours ago",
    },
    {
      id: 3,
      author: "FitX AI Bot",
      type: "Milestone Reached",
      title: "Level 4 Iron Titan Unlocked! 🎉",
      content: "Congratulations! You accumulated over 4,000 lifetime XP points this week.",
      time: "1 day ago",
    },
  ];

  const achievementBadges = [
    { name: "Iron Titan", desc: "Reach Level 4 in XP Progression", unlocked: true, icon: "🛡️" },
    { name: "Centurion Lifter", desc: "Log over 100 working sets", unlocked: true, icon: "🏋️" },
    { name: "7-Day Streak Master", desc: "Maintain a 7-day workout streak", unlocked: true, icon: "🔥" },
    { name: "Zero-Waste Gourmet", desc: "Hit 90%+ grocery efficiency", unlocked: true, icon: "🥦" },
    { name: "PR Crusher", desc: "Log 5 new personal records", unlocked: false, icon: "⚡" },
    { name: "Century Club Bench", desc: "Bench Press over 100 kg", unlocked: true, icon: "🥇" },
  ];

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      <ConfettiBurst trigger={xpConfetti} onComplete={() => setXpConfetti(false)} />

      {/* Achievement Showcase Modal Drawer */}
      {badgesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center">
                <Award className="w-4 h-4 mr-1.5 text-amber-500" /> Unlocked Achievement Showcase
              </h3>
              <button onClick={() => setBadgesOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {achievementBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border space-y-1 ${
                    badge.unlocked
                      ? "bg-amber-50 border-amber-300 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{badge.icon}</span>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-black">{badge.name}</h4>
                  <p className="text-[9px] text-slate-600 font-bold leading-tight">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gamification & XP Progress Banner */}
      <div className="duo-card p-5 bg-white border border-slate-200 space-y-4 relative shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLevelUpSim}
            className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
            title="Tap to trigger Level Up Celebration!"
          >
            <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" /> Level 4 • Iron Titan
          </button>
          <PillBadge variant="gold" icon={<Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}>
            12 Day Streak
          </PillBadge>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <h2 className="text-xl font-black text-slate-900">1,450 / 4,000 XP</h2>
              <p className="text-[11px] font-bold text-slate-500">2,550 XP needed for Level 5 Titan</p>
            </div>
            <span className="text-sm font-mono font-black text-emerald-600">36.2%</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: "36.2%" }}
            />
          </div>
        </div>

        {/* Streak Freeze Shield & Badges Showcase */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono">
          <div className="flex items-center space-x-1 text-emerald-700 font-extrabold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2 Streak Freezes Token</span>
          </div>
          <button
            onClick={() => {
              soundscape.playTapSound();
              setBadgesOpen(true);
            }}
            className="text-amber-700 font-black hover:underline flex items-center"
          >
            🏆 5 Badges Unlocked
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        {(["feed", "leaderboard", "prs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              soundscape.playTapSound();
              setActiveTab(tab);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black capitalize transition-all active:scale-95 ${
              activeTab === tab
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "feed" ? "Social Feed" : tab === "leaderboard" ? "Leaderboard" : "PR Wall of Fame"}
          </button>
        ))}
      </div>

      {/* Tab 1: Social Activity Feed */}
      {activeTab === "feed" && (
        <div className="space-y-3">
          {feedPosts.map((post) => (
            <div key={post.id} className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-emerald-400 transition-all shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {post.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{post.author}</h4>
                    <span className="text-[10px] text-slate-500 font-bold">{post.time}</span>
                  </div>
                </div>
                <PillBadge variant="green">{post.type}</PillBadge>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 mb-1">{post.title}</h3>
                <p className="text-xs font-bold text-slate-600 leading-snug">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleKudos(post.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-black active:scale-95 transition-all shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{kudosGiven[post.id] || 0} Kudos</span>
                </button>

                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-black border border-slate-200">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Global & Friends Leaderboard Podium */}
      {activeTab === "leaderboard" && (
        <div className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Athletes Leaderboard
            </h3>
            
            {/* Global vs Friends Switcher */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLeaderboardFilter("global")}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black ${
                  leaderboardFilter === "global" ? "bg-emerald-500 text-white" : "text-slate-600"
                }`}
              >
                Global
              </button>
              <button
                onClick={() => setLeaderboardFilter("friends")}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black ${
                  leaderboardFilter === "friends" ? "bg-emerald-500 text-white" : "text-slate-600"
                }`}
              >
                Friends
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {activeLeaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  user.name.includes("You")
                    ? "bg-emerald-50 border-emerald-300 shadow-xs"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      user.rank === 1
                        ? "bg-amber-400 text-slate-900"
                        : user.rank === 2
                        ? "bg-slate-300 text-slate-900"
                        : user.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    #{user.rank}
                  </span>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center">
                      {user.name}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">{user.badge}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-black text-amber-600 block">{user.xp} XP</span>
                  <span className="text-[10px] text-slate-500 font-bold">{user.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: PR Wall of Fame */}
      {activeTab === "prs" && (
        <div className="grid grid-cols-2 gap-3">
          {prs.map((pr, idx) => (
            <div key={idx} className="duo-card p-3.5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="text-2xl">{pr.icon}</div>
              <div>
                <span className="text-[9px] text-emerald-700 font-mono font-bold uppercase block">{pr.type}</span>
                <h4 className="text-xs font-black text-slate-900 leading-tight">{pr.exercise}</h4>
              </div>

              <div className="pt-1 border-t border-slate-200 flex items-center justify-between font-mono">
                <span className="text-sm font-black text-emerald-600">{pr.record}</span>
                <span className="text-[9px] text-slate-500 font-bold">{pr.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
