"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ChatSelector from "@/components/ChatSelector";
import NameAssigner from "@/components/NameAssigner";
import WrappedExperience from "@/components/WrappedExperience";
import {
  loadDatabase,
  closeDatabase,
  getGroupChats,
  getParticipants,
  getMessageCounts,
  getReactionStats,
  getLaughConnections,
} from "@/lib/parser";
import { buildWrappedData } from "@/lib/stats";
import { GroupChat, Participant, WrappedData } from "@/types";

type AppState = "upload" | "select" | "name" | "wrapped";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setIsLoading(true);
    setError(null);
    try {
      await loadDatabase(file);
      const groupChats = getGroupChats();
      if (groupChats.length === 0) {
        setError("No group chats found in this database.");
        setIsLoading(false);
        return;
      }
      setChats(groupChats);
      setState("select");
    } catch (err) {
      setError("Could not read this file. Make sure it is a valid chat.db file.");
      console.error(err);
    }
    setIsLoading(false);
  }

  function handleChatSelected(chatId: number) {
    setError(null);
    try {
      const p = getParticipants(chatId);
      setParticipants(p);
      setSelectedChatId(chatId);
      setState("name");
    } catch (err) {
      setError("Something went wrong reading participants.");
      console.error(err);
    }
  }

  function handleNamesComplete(updatedParticipants: Participant[]) {
    setIsLoading(true);
    setError(null);
    try {
      const chatId = selectedChatId!;
      const chat = chats.find((c) => c.chatId === chatId);
      const messageCounts = getMessageCounts(chatId);
      const reactionStats = getReactionStats(chatId);
      const laughConnections = getLaughConnections(chatId);

      const data = buildWrappedData(
        chat?.displayName || "Group Chat",
        updatedParticipants,
        messageCounts,
        reactionStats,
        laughConnections
      );

      setWrappedData(data);
      setState("wrapped");
      closeDatabase();
    } catch (err) {
      setError("Something went wrong analyzing this chat.");
      console.error(err);
    }
    setIsLoading(false);
  }

  function handleReset() {
    closeDatabase();
    setState("upload");
    setChats([]);
    setSelectedChatId(null);
    setParticipants([]);
    setWrappedData(null);
    setError(null);
  }

  const selectedChat = chats.find((c) => c.chatId === selectedChatId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #08080d 0%, #0f0f17 50%, #08080d 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {state !== "wrapped" && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
              Chat
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Wrapped
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, marginTop: 6 }}>
              Your iMessage group chat, unwrapped
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
            {error}
          </div>
        )}

        {state === "upload" && (
          <FileUploader onFileSelected={handleFileSelected} isLoading={isLoading} />
        )}

        {state === "select" && (
          <ChatSelector chats={chats} onSelect={handleChatSelected} isLoading={isLoading} />
        )}

        {state === "name" && (
          <NameAssigner
            participants={participants}
            chatName={selectedChat?.displayName || "Group Chat"}
            onComplete={handleNamesComplete}
          />
        )}

        {state === "wrapped" && wrappedData && (
          <WrappedExperience data={wrappedData} />
        )}

        {state !== "upload" && (
          <button
            onClick={handleReset}
            style={{ display: "block", margin: "24px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer" }}
          >
            Start over
          </button>
        )}

        <div style={{ textAlign: "center", marginTop: 32, padding: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>
            Your file is processed entirely in your browser.<br />
            Nothing is uploaded to any server. Ever.
          </p>
        </div>
      </div>
    </div>
  );
}
