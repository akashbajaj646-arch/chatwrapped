"use client";

import { useState } from "react";

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupGuide({ isOpen, onClose }: SetupGuideProps) {
  const [tab, setTab] = useState<"shortcut" | "terminal">("shortcut");
  const [copied, setCopied] = useState(false);
  const [permExpanded, setPermExpanded] = useState(false);

  if (!isOpen) return null;

  const command = "cp ~/Library/Messages/chat.db ~/Desktop/chat.db";

  function handleCopy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Get Your chat.db File</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("shortcut")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "shortcut"
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            ⚡ Quick Setup
          </button>
          <button
            onClick={() => setTab("terminal")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "terminal"
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            💻 Terminal
          </button>
        </div>

        {/* Quick Setup Tab */}
        {tab === "shortcut" && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm leading-relaxed">
              We built a one-tap Apple Shortcut that copies your{" "}
              <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded text-xs">
                chat.db
              </code>{" "}
              to your Desktop. No Terminal needed.
            </p>

            <a
              href="https://www.icloud.com/shortcuts/dc464227f658408f9fc5de4baae068f5"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Download Shortcut →
            </a>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-2">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                How it works
              </p>
              <ol className="text-white/50 text-sm space-y-1.5 list-decimal list-inside">
                <li>Download and add the shortcut above</li>
                <li>Run it from the Shortcuts app</li>
                <li>
                  Find{" "}
                  <code className="text-white/70 bg-white/10 px-1 py-0.5 rounded text-xs">
                    chat.db
                  </code>{" "}
                  on your Desktop and upload it here
                </li>
              </ol>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-300/80 text-xs font-semibold mb-1">
                Permission Required
              </p>
              <p className="text-amber-200/50 text-xs leading-relaxed">
                If the shortcut fails, open{" "}
                <strong className="text-amber-200/70">System Settings</strong> →{" "}
                Privacy &amp; Security → Full Disk Access and enable the{" "}
                <strong className="text-amber-200/70">Shortcuts</strong> app.
                The shortcut will open this page for you automatically.
              </p>
            </div>
          </div>
        )}

        {/* Terminal Tab */}
        {tab === "terminal" && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm leading-relaxed">
              Open Terminal (press{" "}
              <kbd className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded text-xs">
                ⌘ Space
              </kbd>{" "}
              and search &ldquo;Terminal&rdquo;) and run this command:
            </p>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
              <code className="text-green-400 text-xs break-all">{command}</code>
              <button
                onClick={handleCopy}
                className="shrink-0 text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <p className="text-white/40 text-xs">
              This copies your iMessage database to your Desktop so you can upload it
              here.
            </p>

            {/* Expandable permission error section */}
            <div className="border border-white/[0.07] rounded-xl overflow-hidden">
              <button
                onClick={() => setPermExpanded(!permExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                <span>Getting a permission error?</span>
                <span className="text-xs">{permExpanded ? "▲" : "▼"}</span>
              </button>
              {permExpanded && (
                <div className="px-4 pb-4 space-y-2 text-xs text-white/40 leading-relaxed border-t border-white/[0.07] pt-3">
                  <p>
                    macOS protects your Messages folder. To grant access, open:
                  </p>
                  <p className="text-white/60 font-medium">
                    System Settings → Privacy &amp; Security → Full Disk Access
                  </p>
                  <p>
                    Enable <strong className="text-white/60">Terminal</strong>, then
                    re-run the command above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy note */}
        <p className="text-white/20 text-xs text-center mt-5 leading-relaxed">
          🔒 Your messages never leave your computer. ChatWrapped reads reaction
          metadata only — we never see your message content.
        </p>
      </div>
    </div>
  );
}
