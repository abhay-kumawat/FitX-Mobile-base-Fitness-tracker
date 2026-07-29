"use client";

import React, { useState } from "react";
import { User, Target, Flame, Globe, Check } from "lucide-react";

export default function UserSwitcher() {
  const [goal, setGoal] = useState("hypertrophy");
  const [targetCalories, setTargetCalories] = useState(2400);
  const [region, setRegion] = useState("North America");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-fitx-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
          <User className="w-4 h-4 mr-1.5 text-fitx-cyan" /> Profile & Environment Switcher
        </h3>
        {saved && (
          <span className="text-xs text-emerald-400 font-bold flex items-center">
            <Check className="w-3.5 h-3.5 mr-1" /> Saved!
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="text-gray-400 block mb-1 font-semibold flex items-center">
            <Target className="w-3.5 h-3.5 mr-1 text-fitx-purple" /> Primary Fitness Goal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-fitx-card border border-fitx-border rounded-xl p-2.5 text-white focus:border-fitx-cyan focus:outline-none touch-target"
          >
            <option value="hypertrophy">Muscle Hypertrophy</option>
            <option value="strength">Maximum Strength</option>
            <option value="fat_loss">Fat Loss & Conditioning</option>
            <option value="endurance">Endurance & Stamina</option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 block mb-1 font-semibold flex items-center">
            <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" /> Target Daily Calories (kcal)
          </label>
          <input
            type="number"
            value={targetCalories}
            onChange={(e) => setTargetCalories(Number(e.target.value))}
            className="w-full bg-fitx-card border border-fitx-border rounded-xl p-2.5 text-white focus:border-fitx-cyan focus:outline-none touch-target"
          />
        </div>

        <div>
          <label className="text-gray-400 block mb-1 font-semibold flex items-center">
            <Globe className="w-3.5 h-3.5 mr-1 text-fitx-cyan" /> Geographic Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-fitx-card border border-fitx-border rounded-xl p-2.5 text-white focus:border-fitx-cyan focus:outline-none touch-target"
          >
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="South Asia">South Asia</option>
            <option value="Global">Global</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-fitx-cyan to-fitx-purple text-black font-extrabold uppercase tracking-wider touch-target hover:opacity-95"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
