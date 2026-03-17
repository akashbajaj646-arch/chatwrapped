"use client";

import { useCallback, useState } from "react";
import SetupGuide from "@/components/SetupGuide";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileSelected, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px solid #a78bfa" : "2px dashed rgba(255,255,255,0.15)",
          borderRadius: 20,
          padding: "48px 24px",
          textAlign: "center",
          background: isDragging ? "rgba(167,139,250,0.05)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
          cursor: isLoading ? "wait" : "pointer",
        }}
        onClick={() => { if (!isLoading) document.getElementById("file-input")?.click(); }}
      >
        <input
          id="file-input"
          type="file"
          accept=".db,.sqlite,.sqlite3"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        {isLoading ? (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{String.fromCharCode(9203)}</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600 }}>
              Reading your messages database...
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 8 }}>
              This happens entirely in your browser. Nothing is uploaded.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{String.fromCharCode(128203)}</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600 }}>
              Drop your chat.db file here
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 8 }}>
              or click to browse
            </p>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setShowGuide(true); }}
        style={{
          display: "block",
          margin: "16px auto 0",
          background: "none",
          border: "none",
          color: "#a78bfa",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        How do I find my file?
      </button>

      <SetupGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
