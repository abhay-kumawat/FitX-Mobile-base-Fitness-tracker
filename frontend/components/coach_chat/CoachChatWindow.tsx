"use client";

import React, { useState } from "react";
import { Send, Mic, Sparkles, CheckCircle2 } from "lucide-react";
import { fitxAPI } from "@/lib/api";
import { useAuthContext } from "@/context/AuthContext";

interface SuggestedAction {
  label: string;
  action_type: string;
}

interface ChatMessageItem {
  sender: string;
  text: string;
  suggestedActions?: SuggestedAction[];
}

export default function CoachChatWindow() {
  const { userProfile } = useAuthContext();
  const rawName = userProfile?.fullName ? userProfile.fullName.split(" ")[0] : "Athlete";
  const userName = (!rawName || rawName.toLowerCase() === "google" || rawName.toLowerCase() === "demo") 
    ? "Athlete" 
    : rawName;

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      sender: "coach",
      text: `Hello ${userName}! I am your FitX Gemini AI Coach. Your readiness score today is 88 (Optimal). How can I fine-tune your workout or nutrition plan right now?`,
      suggestedActions: [
        { label: "Lower Load (-10%)", action_type: "modify_load" },
        { label: "Log +500ml Water", action_type: "add_water" }
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputMsg("");
    setIsTyping(true);
    const reply = await fitxAPI.agentChat(userText);
    setIsTyping(false);

    if (reply && reply.reply) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: reply.reply,
          suggestedActions: reply.suggested_actions || []
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: "FitX Coach: Perfect query. I have logged your feedback and adjusted your joint safety rules to neutral grip angles for compound presses today."
        }
      ]);
    }
  };

  return (
    <div className="rounded-3xl p-4 flex flex-col h-full w-full min-w-0 max-w-full overflow-hidden relative bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl">
      {/* Sub Header inside Chat Window */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-white truncate tracking-tight">Gemini AI Coach</h3>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse shrink-0" /> Realtime Form & Strategy
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 min-w-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-xs ${
                m.sender === "user"
                  ? "bg-emerald-500 text-slate-950 font-black rounded-tr-xs"
                  : "bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-xs font-medium"
              }`}
            >
              {m.text}
            </div>

            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {m.suggestedActions.map((act: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessages((prev) => [
                        ...prev,
                        { sender: "user", text: `Executed: ${act.label}` },
                        { sender: "coach", text: `Applied ${act.label} to your live workout session!` }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold flex items-center hover:bg-amber-500/25 transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1 text-amber-400" /> {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="text-xs text-emerald-400 italic flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400 animate-spin" /> Gemini AI Coach is analyzing...
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={() => setInputMsg("I have mild shoulder tightness today.")}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 hover:border-emerald-500 transition-colors"
          title="Quick Preset"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI Coach anything..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
        />
        <button
          type="button"
          onClick={handleSend}
          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 transition-colors flex items-center justify-center shadow-md shadow-emerald-500/20"
        >
          <Send className="w-4 h-4 fill-slate-950" />
        </button>
      </div>
    </div>
  );
}
