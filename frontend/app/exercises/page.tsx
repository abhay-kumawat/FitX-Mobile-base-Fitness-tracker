"use client";

import React, { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  X
} from "lucide-react";
import { PillBadge } from "@/components/atomic/PillBadge";
import { Button3D } from "@/components/atomic/Button3D";
import { soundscape } from "@/lib/soundscapeEngine";

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscles: string[];
  movement_pattern: string;
  equipment: string;
  difficulty: string;
  skill_level: string;
  instructions: string[];
  common_mistakes: string[];
  safety_tips: string[];
  alternatives: string[];
  progressions: string[];
  regressions?: string[];
  estimated_calories_per_min: number;
  typical_rpe: number;
  typical_rest_sec: number;
  tempo: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories = [
    "all", "chest", "back", "shoulders", "biceps", "triceps", "core", "quads", "hamstrings"
  ];

  const defaultExercises: Exercise[] = [
    {
      id: 1,
      name: "Incline Dumbbell Press",
      category: "chest",
      primary_muscle: "Upper Chest",
      secondary_muscles: ["Front Delts", "Triceps"],
      movement_pattern: "push",
      equipment: "dumbbell",
      difficulty: "intermediate",
      skill_level: "intermediate",
      instructions: [
        "Set bench to 30-45 degree incline",
        "Press dumbbells upward in a smooth arc",
        "Lower with control until upper chest stretch"
      ],
      common_mistakes: ["Flaring elbows to 90 degrees", "Setting bench too steep"],
      safety_tips: ["Tuck elbows 45 degrees to protect rotator cuff"],
      alternatives: ["Incline Barbell Press", "Low-to-High Cable Flyes"],
      progressions: ["Pause Incline DB Press"],
      regressions: ["Flat Dumbbell Press"],
      estimated_calories_per_min: 6.8,
      typical_rpe: 8.0,
      typical_rest_sec: 90,
      tempo: "2-1-1-0"
    },
    {
      id: 2,
      name: "Barbell Back Squat",
      category: "quads",
      primary_muscle: "Quads",
      secondary_muscles: ["Glutes", "Hamstrings", "Core"],
      movement_pattern: "squat",
      equipment: "barbell",
      difficulty: "advanced",
      skill_level: "advanced",
      instructions: [
        "Position bar on upper traps",
        "Unrack with shoulder-width stance",
        "Squat to parallel or lower and drive upwards"
      ],
      common_mistakes: ["Knees caving inwards", "Heels lifting"],
      safety_tips: ["Maintain core bracing throughout movement"],
      alternatives: ["Goblet Squat", "Leg Press"],
      progressions: ["Pause Squats"],
      regressions: ["Bodyweight Squats"],
      estimated_calories_per_min: 9.0,
      typical_rpe: 8.5,
      typical_rest_sec: 180,
      tempo: "3-1-1-0"
    },
    {
      id: 3,
      name: "Lat Pulldown (Wide Grip)",
      category: "back",
      primary_muscle: "Lats",
      secondary_muscles: ["Biceps", "Rear Delts"],
      movement_pattern: "pull",
      equipment: "cable",
      difficulty: "beginner",
      skill_level: "beginner",
      instructions: [
        "Grasp bar wider than shoulder width",
        "Drive elbows down and back to upper chest",
        "Squeeze lats at bottom and control return"
      ],
      common_mistakes: ["Leaning back excessively", "Pulling behind neck"],
      safety_tips: ["Keep chest elevated and shoulders depressed"],
      alternatives: ["Pull-Ups", "Single Arm Cable Pulldown"],
      progressions: ["Weighted Pull-Ups"],
      regressions: ["Band Pulldown"],
      estimated_calories_per_min: 6.0,
      typical_rpe: 7.5,
      typical_rest_sec: 90,
      tempo: "2-0-1-1"
    },
    {
      id: 4,
      name: "Dumbbell Lateral Raise",
      category: "shoulders",
      primary_muscle: "Side Delts",
      secondary_muscles: ["Traps"],
      movement_pattern: "isolation",
      equipment: "dumbbell",
      difficulty: "beginner",
      skill_level: "beginner",
      instructions: [
        "Stand tall with dumbbells at sides",
        "Raise arms out to 90 degrees in scapular plane",
        "Pause at top and lower smoothly"
      ],
      common_mistakes: ["Shrugging shoulders", "Swinging body"],
      safety_tips: ["Keep thumbs slightly higher than pinkies"],
      alternatives: ["Cable Lateral Raise"],
      progressions: ["Lean-Away Cable Raise"],
      regressions: ["Band Lateral Raise"],
      estimated_calories_per_min: 5.0,
      typical_rpe: 8.5,
      typical_rest_sec: 60,
      tempo: "2-1-1-0"
    }
  ];

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/exercises/search")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExercises(data);
        } else {
          setExercises(defaultExercises);
        }
      })
      .catch(() => setExercises(defaultExercises));
  }, []);

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = activeCategory === "all" || ex.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === "" || ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.primary_muscle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 animate-smooth-reveal">
      {/* Header Banner */}
      <div className="duo-card p-5 bg-white border border-slate-200 space-y-2 relative shadow-sm">
        <div className="flex items-center justify-between">
          <PillBadge variant="green" icon={<Sparkles className="w-3 h-3" />}>
            Master Exercise Database
          </PillBadge>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {filteredExercises.length} Exercises Available
          </span>
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Exercise Library & Taxonomy
        </h2>
        <p className="text-xs font-semibold text-slate-600">
          Biomimetically mapped muscle targets, joint safety rules, and progression trees.
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search exercises by name or muscle (e.g. Chest, Squat)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundscape.playTapSound();
              setActiveCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id || ex.name}
            onClick={() => {
              soundscape.playTapSound();
              setSelectedExercise(ex);
            }}
            className="duo-card p-4 rounded-3xl bg-white border border-slate-200 space-y-3 cursor-pointer hover:border-emerald-500 transition-all touch-target active:scale-[0.98] shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center">
                  <Dumbbell className="w-4 h-4 mr-2 text-emerald-600 shrink-0" /> {ex.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <PillBadge variant="green">
                    {ex.primary_muscle}
                  </PillBadge>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 capitalize border border-slate-200">
                    {ex.equipment}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* AI Safety Rule Preview */}
            {ex.safety_tips && ex.safety_tips.length > 0 && (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] text-amber-900 leading-tight truncate">
                  <strong>Safety:</strong> {ex.safety_tips[0]}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-2 font-extrabold">
              <span>Tempo: <strong className="text-slate-900">{ex.tempo || "2-0-1-0"}</strong></span>
              <span>Rest: <strong className="text-slate-900">{ex.typical_rest_sec || 90}s</strong></span>
              <span>Calories: <strong className="text-slate-900">{ex.estimated_calories_per_min || 6.5} / min</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 border border-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                  {selectedExercise.category} • {selectedExercise.primary_muscle}
                </span>
                <h3 className="text-base font-black text-slate-900 flex items-center mt-0.5">
                  <Dumbbell className="w-4 h-4 mr-2 text-emerald-600" /> {selectedExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Step-by-Step Instructions</h4>
              <ul className="space-y-1.5">
                {selectedExercise.instructions?.map((inst, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-700 flex items-start">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Tips & Common Mistakes */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
              <span className="font-black text-amber-900 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Common Mistakes to Avoid
              </span>
              <ul className="list-disc list-inside text-slate-700 text-[11px] font-semibold space-y-0.5">
                {selectedExercise.common_mistakes?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Alternatives & Progressions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-black text-sky-700 block mb-1">Alternatives</span>
                <p className="text-[11px] font-bold text-slate-700">{selectedExercise.alternatives?.join(", ") || "Dumbbell Press"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-black text-emerald-700 block mb-1">Progressions</span>
                <p className="text-[11px] font-bold text-slate-700">{selectedExercise.progressions?.join(", ") || "Pause reps"}</p>
              </div>
            </div>

            <Button3D
              variant="green"
              fullWidth
              onClick={() => setSelectedExercise(null)}
            >
              Close Exercise Detail
            </Button3D>
          </div>
        </div>
      )}
    </div>
  );
}
