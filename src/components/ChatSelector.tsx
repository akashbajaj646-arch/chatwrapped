"use client";

import { GroupChat } from "@/types";

interface ChatSelectorProps {
  chats: GroupChat[];
  onSelect: (chatId: number) => void;
  isLoading: boolean;
}

export default function ChatSelector({ chats, onSelect, isLoading }: ChatSelectorProps) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>
        Select a group chat
      </h2>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 20 }}>
        Pick the group chat you want to wrap
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            onClick={() => !isLoading && onSelect(chat.chatId)}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 18px",
              cursor: isLoading ? "wait" : "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                {chat.displayName}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                {chat.participantCount + 1} members
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              {chat.messageCount.toLocaleString()} msgs
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
