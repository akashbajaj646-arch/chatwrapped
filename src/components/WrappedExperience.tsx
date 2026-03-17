"use client";

import { useState } from "react";
import { WrappedData, PersonStats } from "@/types";

interface WrappedExperienceProps {
  data: WrappedData;
}

function sorted(stats: PersonStats[], key: keyof PersonStats, dir: "desc" | "asc" = "desc"): PersonStats[] {
  return [...stats].sort((a, b) => {
    const av = a[key] as number;
    const bv = b[key] as number;
    return dir === "desc" ? bv - av : av - bv;
  });
}

function Bar({ person, value, maxValue, rank, suffix }: { person: PersonStats; value: number; maxValue: number; rank: number; suffix?: string }) {
  const pct = Math.max((value / maxValue) * 100, 15);
  const display = typeof value === "number" && value % 1 !== 0 ? String(value) : value.toLocaleString();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 20, textAlign: "right", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>#{rank}</div>
      <div style={{ width: 60, textAlign: "right", fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.displayName}</div>
      <div style={{ flex: 1, height: 30, background: "rgba(255,255,255,0.08)", borderRadius: 15, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10, width: pct + "%", backgroundColor: person.color, transition: "width 0.6s ease" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>{display}{suffix || ""}</span>
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ title, stats, valueKey, suffix, note }: { title: string; stats: PersonStats[]; valueKey: keyof PersonStats; suffix?: string; note?: string }) {
  const s = sorted(stats, valueKey);
  const maxVal = s[0][valueKey] as number;
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 14, marginTop: 0 }}>{title}</h3>
      {s.map((p, i) => (
        <Bar key={p.handleId} person={p} value={p[valueKey] as number} maxValue={maxVal} rank={i + 1} suffix={suffix} />
      ))}
      {note && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>{note}</p>}
    </div>
  );
}

function SupCard({ emoji, label, name, color, detail }: { emoji: string; label: string; name: string; color: string; detail: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{name}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{detail}</div>
    </div>
  );
}

export default function WrappedExperience({ data }: WrappedExperienceProps) {
  const [current, setCurrent] = useState(0);
  const { personStats: stats, laughConnections, totalMessages, totalLaughs, chatName } = data;

  const stingy = sorted(stats, "laughRate", "asc");
  const funniest = sorted(stats, "laughsReceived")[0];
  const hypeMachine = sorted(stats, "laughsGiven")[0];
  const mostActive = sorted(stats, "messagesSent")[0];
  const mostGenerous = sorted(stats, "allReactionsGiven")[0];
  const bestHitRate = sorted(stats, "laughRate")[0];

  // Build laugh matrix
  const laughMatrix: Record<number, Record<number, number>> = {};
  laughConnections.forEach((lc) => {
    if (!laughMatrix[lc.reactorHandleId]) laughMatrix[lc.reactorHandleId] = {};
    laughMatrix[lc.reactorHandleId][lc.targetHandleId] = lc.count;
  });

  // Build biggest fan
  const biggestFan: Record<number, { target: PersonStats; count: number }> = {};
  stats.forEach((p) => {
    const connections = laughConnections
      .filter((lc) => lc.reactorHandleId === p.handleId)
      .sort((a, b) => b.count - a.count);
    if (connections.length > 0) {
      const targetPerson = stats.find((s) => s.handleId === connections[0].targetHandleId);
      if (targetPerson) {
        biggestFan[p.handleId] = { target: targetPerson, count: connections[0].count };
      }
    }
  });

  function matrixSlide() {
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4, marginTop: 0 }}>Who Laughs at Who</h3>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Row laughed at Column</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 4 }}></th>
                {stats.map((p) => (
                  <th key={p.handleId} style={{ padding: 4, textAlign: "center", fontWeight: 700, color: p.color, fontSize: 9 }}>
                    {p.displayName.slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((reactor) => {
                const vals = stats.map((t) => (laughMatrix[reactor.handleId]?.[t.handleId]) || 0).filter((_, i) => stats[i].handleId !== reactor.handleId);
                const mx = Math.max(...vals);
                return (
                  <tr key={reactor.handleId} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: 4, fontWeight: 700, color: reactor.color, fontSize: 10 }}>{reactor.displayName.slice(0, 6)}</td>
                    {stats.map((target) => {
                      if (reactor.handleId === target.handleId) {
                        return <td key={target.handleId} style={{ padding: 4, textAlign: "center", color: "rgba(255,255,255,0.12)" }}>-</td>;
                      }
                      const v = laughMatrix[reactor.handleId]?.[target.handleId] || 0;
                      const isMax = v === mx && v > 0;
                      return (
                        <td key={target.handleId} style={{ padding: 4, textAlign: "center", fontWeight: isMax ? 700 : 400, color: isMax ? "#fff" : "rgba(255,255,255,0.45)" }}>
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function fanSlide() {
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 14, marginTop: 0 }}>Everyone&apos;s #1 Fan</h3>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Who each person laughs at the most</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.map((p) => {
            const fan = biggestFan[p.handleId];
            if (!fan) return null;
            return (
              <div key={p.handleId} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: p.color, width: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.displayName}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>{"\u2192"}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: fan.target.color }}>{fan.target.displayName}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginLeft: "auto" }}>{fan.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const slides = [
    // Hero
    () => (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 8 }}>Your group chat sent</p>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{totalMessages.toLocaleString()}</div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "8px 0 28px" }}>messages</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 8 }}>and laughed</p>
        <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, background: "linear-gradient(90deg, #fde68a, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {totalLaughs.toLocaleString()}
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 8 }}>times</p>
        {totalLaughs > 0 && (
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 24 }}>
            That&apos;s a laugh every {Math.round(totalMessages / totalLaughs)} messages
          </p>
        )}
      </div>
    ),
    // Superlatives
    () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <SupCard emoji="👑" label="Funniest" name={funniest.displayName} color={funniest.color} detail={funniest.laughsReceived.toLocaleString() + " laughs"} />
        <SupCard emoji="😂" label="Hype Machine" name={hypeMachine.displayName} color={hypeMachine.color} detail={hypeMachine.laughsGiven.toLocaleString() + " given"} />
        <SupCard emoji="🤐" label="Stingiest" name={stingy[0].displayName} color={stingy[0].color} detail={stingy[0].laughRate + "% laugh rate"} />
        <SupCard emoji="🎯" label="Best Hit Rate" name={bestHitRate.displayName} color={bestHitRate.color} detail={bestHitRate.laughRate + "% get laughs"} />
        <SupCard emoji="💬" label="Most Active" name={mostActive.displayName} color={mostActive.color} detail={mostActive.messagesSent.toLocaleString() + " msgs"} />
        <SupCard emoji="🫡" label="Most Generous" name={mostGenerous.displayName} color={mostGenerous.color} detail={mostGenerous.allReactionsGiven.toLocaleString() + " reactions"} />
      </div>
    ),
    // Leaderboards
    () => <Leaderboard title="Messages Sent" stats={stats} valueKey="messagesSent" />,
    () => <Leaderboard title="😂 Laughs Received" stats={stats} valueKey="laughsReceived" />,
    () => <Leaderboard title="😂 Laughs Given" stats={stats} valueKey="laughsGiven" />,
    () => <Leaderboard title="Laugh ROI (Received / Given)" stats={stats} valueKey="laughRatio" suffix="x" note="Above 1.0x = getting more laughs than you give" />,
    () => <Leaderboard title="Hit Rate (% of msgs getting laughs)" stats={stats} valueKey="laughRate" suffix="%" note="What % of your messages make someone laugh?" />,
    () => <Leaderboard title="❤️ Hearts Received" stats={stats} valueKey="heartsReceived" />,
    () => <Leaderboard title="👍 Thumbs Up Received" stats={stats} valueKey="thumbsUpReceived" />,
    () => <Leaderboard title="👎 Thumbs Down Received" stats={stats} valueKey="thumbsDownReceived" />,
    () => <Leaderboard title="‼️ Emphasized Received" stats={stats} valueKey="emphasizedReceived" />,
    () => <Leaderboard title="❓ Questioned Received" stats={stats} valueKey="questionedReceived" />,
    // Matrix
    matrixSlide,
    // Biggest fan
    fanSlide,
    // Finale
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{chatName}</h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 8 }}>
          {totalMessages.toLocaleString()} messages. {totalLaughs.toLocaleString()} laughs.<br />Endless memories.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 20 }}>
          {stats.map((p) => (
            <div key={p.handleId} style={{ fontSize: 12, fontWeight: 700, color: p.color, textAlign: "center" }}>
              {p.displayName}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", marginTop: 28 }}>ChatWrapped</p>
      </div>
    ),
  ];

  const next = () => setCurrent((c) => Math.min(c + 1, slides.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>
          Chat<span style={{ background: "linear-gradient(90deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wrapped</span>
        </h1>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{chatName}</p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 22, minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {slides[current]()}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "0 4px" }}>
        <button onClick={prev} disabled={current === 0} style={{ fontSize: 13, fontWeight: 600, background: "none", border: "none", padding: "8px 14px", cursor: current === 0 ? "default" : "pointer", color: current === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.4)" }}>
          Back
        </button>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ height: 6, width: i === current ? 20 : 6, borderRadius: 3, border: "none", cursor: "pointer", background: i === current ? "#fff" : "rgba(255,255,255,0.12)", padding: 0, transition: "all 0.3s" }} />
          ))}
        </div>
        <button onClick={next} disabled={current === slides.length - 1} style={{ fontSize: 13, fontWeight: 600, background: "none", border: "none", padding: "8px 14px", cursor: current === slides.length - 1 ? "default" : "pointer", color: current === slides.length - 1 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.4)" }}>
          Next
        </button>
      </div>
    </div>
  );
}
