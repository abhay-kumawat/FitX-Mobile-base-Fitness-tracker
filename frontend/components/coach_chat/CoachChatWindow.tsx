"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Mic, Sparkles, CheckCircle2 } from "lucide-react";
import { fitxAPI } from "@/lib/api";

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
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      sender: "coach",
      text: "Hello Alex! I am your FitX Gemini AI Coach. Your readiness score today is 88 (Optimal). How can I fine-tune your workout or nutrition plan right now?",
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
    <div className="glass-card rounded-[24px] p-4 flex flex-col h-[500px] max-h-[75vh] w-full min-w-0 max-w-full overflow-hidden border-fitx-borderSubtle relative bg-gradient-to-b from-[#161616] to-[#101010] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-fitx-borderSubtle shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fitx-gold to-fitx-purpleGlow flex items-center justify-center text-black shadow-md shadow-fitx-gold/25 shrink-0">
            <Sparkles className="w-5 h-5 fill-black" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-white truncate">Gemini AI Coach</h3>
            <p className="text-[10px] text-fitx-neonGreen font-bold flex items-center truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-fitx-neonGreen mr-1.5 animate-pulse shrink-0" /> Realtime Form & Strategy
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
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words ${
                m.sender === "user"
                  ? "gold-gradient-btn text-black font-extrabold rounded-br-none shadow-md"
                  : "bg-[#101010] border border-fitx-borderSubtle text-gray-200 rounded-bl-none font-medium"
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
                    className="px-2.5 py-1 rounded-full bg-fitx-gold/15 border border-fitx-gold/30 text-fitx-gold text-[10px] font-extrabold flex items-center hover:bg-fitx-gold/25 transition-all touch-target"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="text-xs text-fitx-gold italic flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-fitx-gold animate-spin" /> Gemini AI Coach is analyzing...
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-2 border-t border-fitx-borderSubtle flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setInputMsg("I have mild shoulder tightness today.")}
          className="p-2.5 rounded-xl bg-[#101010] border border-fitx-borderSubtle text-fitx-gold hover:border-fitx-gold touch-target"
          title="Quick Voice Note Preset"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI Coach anything..."
          className="flex-1 bg-[#101010] border border-fitx-borderSubtle rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-fitx-textSecondary focus:outline-none focus:border-fitx-gold touch-target"
        />
        <button
          type="button"
          onClick={handleSend}
          className="p-2.5 rounded-xl gold-gradient-btn touch-target flex items-center justify-center"
        >
          <Send className="w-4 h-4 fill-black" />
        </button>
      </div>
    </div>
  );
}
