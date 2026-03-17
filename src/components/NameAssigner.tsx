"use client";

import { useState } from "react";
import { Participant } from "@/types";

interface NameAssignerProps {
  participants: Participant[];
  chatName: string;
  onComplete: (updated: Participant[]) => void;
}

export default function NameAssigner({ participants, chatName, onComplete }: NameAssignerProps) {
  const [names, setNames] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    participants.forEach((p) => {
      initial[p.handleId] = p.displayName;
    });
    return initial;
  });

  function handleChange(handleId: number, value: string) {
    setNames((prev) => ({ ...prev, [handleId]: value }));
  }

  function handleSubmit() {
    const updated = participants.map((p) => ({
      ...p,
      displayName: names[p.handleId]?.trim() || p.maskedNumber,
    }));
    onComplete(updated);
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
        Name your crew
      </h2>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24 }}>
        Give everyone in <strong style={{ color: "rgba(255,255,255,0.6)" }}>{chatName}</strong> a name for the leaderboard
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {participants.map((p) => (
          <div
            key={p.handleId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "12px 16px",
            }}
          >
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                {p.maskedNumber}
              </div>
            </div>
            <input
              type="text"
              value={names[p.handleId] || ""}
              onChange={(e) => handleChange(p.handleId, e.target.value)}
              placeholder="Enter name"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          marginTop: 24,
          padding: "14px 0",
          background: "linear-gradient(90deg, #a78bfa, #ec4899)",
          border: "none",
          borderRadius: 14,
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        Generate my Wrapped
      </button>
    </div>
  );
}
