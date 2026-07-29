"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Repeat,
  Bell,
  CheckSquare,
  FileText,
  Utensils,
  X,
  Sparkles,
  ChevronDown,
  Layers,
  Pill,
} from "lucide-react";
import { useDietStore, MealCategory } from "@/store/useDietStore";
import { soundscape } from "@/lib/soundscapeEngine";

interface MealEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  defaultCategory?: MealCategory;
}

export const MealEventModal: React.FC<MealEventModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  defaultCategory = "Breakfast",
}) => {
  const { scheduleMealEvent } = useDietStore();

  const [name, setName] = useState("High Protein Bowl");
  const [mealCategory, setMealCategory] = useState<MealCategory>(defaultCategory);
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [scheduledDate, setScheduledDate] = useState(dateStr);

  const [calories, setCalories] = useState(550);
  const [protein, setProtein] = useState(42);
  const [carbs, setCarbs] = useState(58);
  const [fat, setFat] = useState(14);
  const [badgeEmoji, setBadgeEmoji] = useState("🥗");

  const [frequency, setFrequency] = useState<string>("DAILY");
  const [interval, setInterval] = useState(1);
  const [byWeekday, setByWeekday] = useState<string[]>([]);
  const [endCondition, setEndCondition] = useState<string>("NEVER");
  const [untilDate, setUntilDate] = useState<string>("");
  const [occurrencesCount, setOccurrencesCount] = useState<number>(30);

  const [reminderOffset, setReminderOffset] = useState<number>(15);
  const [priority, setPriority] = useState<string>("MEDIUM");

  const [copyNutrition, setCopyNutrition] = useState(true);
  const [copyIngredients, setCopyIngredients] = useState(true);
  const [copyRecipe, setCopyRecipe] = useState(true);
  const [copySupplements, setCopySupplements] = useState(true);

  const [notes, setNotes] = useState("");
  const [linkedSupplementsStr, setLinkedSupplementsStr] = useState("Creatine, Omega-3");
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleWeekdayToggle = (day: string) => {
    soundscape.playTapSound();
    if (byWeekday.includes(day)) {
      setByWeekday(byWeekday.filter((d) => d !== day));
    } else {
      setByWeekday([...byWeekday, day]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    soundscape.playSuccessSound();

    const linkedSupps = linkedSupplementsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name,
      meal_category: mealCategory,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      badge_emoji: badgeEmoji,
      notes: notes || undefined,
      recurrence: {
        frequency,
        interval: Number(interval),
        by_weekday: byWeekday,
        end_condition: endCondition,
        until_date: untilDate || undefined,
        count: endCondition === "AFTER_OCCURRENCES" ? Number(occurrencesCount) : undefined,
      },
      reminder_offset_minutes: reminderOffset === 0 ? null : Number(reminderOffset),
      priority,
      auto_copy_flags: {
        copy_nutrition: copyNutrition,
        copy_ingredients: copyIngredients,
        copy_recipe: copyRecipe,
        copy_supplements: copySupplements,
      },
      linked_supplements: linkedSupps,
    };

    await scheduleMealEvent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-6 my-auto max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-snug">Create Schedulable Meal Event</h2>
              <p className="text-xs text-slate-500">Google Calendar & Habit Engine integrated meal scheduler</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundscape.playTapSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Meal Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Meal Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oatmeal & Protein Shake"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Category</label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Breakfast">🌅 Breakfast</option>
                <option value="Lunch">🥗 Lunch</option>
                <option value="Dinner">🍲 Dinner</option>
                <option value="Snacks">🍎 Snacks</option>
              </select>
            </div>
          </div>

          {/* Time & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Scheduled Time
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Scheduled Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Macros input grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nutrition Targets</span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Calories</span>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border rounded-xl text-xs font-bold text-slate-900 text-center"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 block">Protein (g)</span>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border rounded-xl text-xs font-bold text-slate-900 text-center"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 block">Carbs (g)</span>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border rounded-xl text-xs font-bold text-slate-900 text-center"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-600 block">Fat (g)</span>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border rounded-xl text-xs font-bold text-slate-900 text-center"
                />
              </div>
            </div>
          </div>

          {/* Recurrence Rule Section */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center">
                <Repeat className="w-4 h-4 mr-1.5 text-indigo-600" /> Recurrence Pattern (Repeat)
              </span>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                TES Rule
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 focus:outline-none"
              >
                <option value="NEVER">○ Never (One-time Event)</option>
                <option value="DAILY">🔁 Daily</option>
                <option value="WEEKDAYS">💼 Weekdays (Mon-Fri)</option>
                <option value="WEEKENDS">🏖️ Weekends (Sat-Sun)</option>
                <option value="EVERY_MONDAY">📅 Every Monday</option>
                <option value="EVERY_TUE_THU">⚡ Every Tue / Thu</option>
                <option value="MONTHLY">🗓️ Monthly</option>
                <option value="EVERY_X_DAYS">⏳ Every X Days</option>
                <option value="CUSTOM">⚙️ Custom Days</option>
              </select>

              {frequency === "EVERY_X_DAYS" && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Every</span>
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-16 p-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-600">days</span>
                </div>
              )}
            </div>

            {/* Custom Weekday Selector */}
            {frequency === "CUSTOM" && (
              <div className="flex items-center justify-between gap-1 pt-1">
                {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => {
                  const active = byWeekday.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWeekdayToggle(day)}
                      className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            {/* End Condition */}
            {frequency !== "NEVER" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-indigo-100">
                <div>
                  <span className="text-[11px] font-bold text-indigo-900 block mb-1">End Recurrence</span>
                  <select
                    value={endCondition}
                    onChange={(e) => setEndCondition(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="NEVER">Never</option>
                    <option value="ON_DATE">On Specific Date</option>
                    <option value="AFTER_OCCURRENCES">After N Occurrences</option>
                  </select>
                </div>

                {endCondition === "ON_DATE" && (
                  <div>
                    <span className="text-[11px] font-bold text-indigo-900 block mb-1">End Date</span>
                    <input
                      type="date"
                      value={untilDate}
                      onChange={(e) => setUntilDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}

                {endCondition === "AFTER_OCCURRENCES" && (
                  <div>
                    <span className="text-[11px] font-bold text-indigo-900 block mb-1">Number of Occurrences</span>
                    <input
                      type="number"
                      min="1"
                      value={occurrencesCount}
                      onChange={(e) => setOccurrencesCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reminders & Notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <Bell className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Notification Alert
              </label>
              <select
                value={reminderOffset}
                onChange={(e) => setReminderOffset(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900"
              >
                <option value={15}>🔔 15 minutes before</option>
                <option value={30}>🔔 30 minutes before</option>
                <option value={0}>⏰ At scheduled time</option>
                <option value={-1}>🔕 Off (No reminder)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900"
              >
                <option value="LOW">🔵 Low</option>
                <option value="MEDIUM">🟢 Medium</option>
                <option value="HIGH">🟡 High</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Auto Copy Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Auto Copy Rules</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyNutrition}
                  onChange={(e) => setCopyNutrition(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>☑ Copy nutrition</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyIngredients}
                  onChange={(e) => setCopyIngredients(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>☑ Copy ingredients</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyRecipe}
                  onChange={(e) => setCopyRecipe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>☑ Copy recipe</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copySupplements}
                  onChange={(e) => setCopySupplements(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>☑ Copy supplements</span>
              </label>
            </div>
          </div>

          {/* Expandable Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-extrabold text-indigo-600 flex items-center space-x-1 hover:underline"
            >
              <span>{showAdvanced ? "Hide Advanced Event Properties" : "+ Show Linked Supplements & Notes"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 flex items-center">
                    <Pill className="w-3.5 h-3.5 mr-1 text-purple-600" /> Linked Supplements (comma separated)
                  </label>
                  <input
                    type="text"
                    value={linkedSupplementsStr}
                    onChange={(e) => setLinkedSupplementsStr(e.target.value)}
                    placeholder="Creatine Monohydrate, Omega-3"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-slate-600" /> Notes & Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Preparation notes or coaching instructions..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Meal Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
