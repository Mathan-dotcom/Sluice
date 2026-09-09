"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, ChevronUp, ChevronDown, Cpu, Sparkles, ExternalLink } from "lucide-react";

interface StreamEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  amount: string;
  latency: number;
  status: "verified" | "routing" | "settling";
  txSnippet: string;
}

const INITIAL_EVENTS: StreamEvent[] = [
  {
    id: "ev-1",
    timestamp: "10s ago",
    agent: "0xa9c9...833e",
    action: "Gemini 3.6 Flash Autonomous Synthesis",
    amount: "0.05 USDC",
    latency: 412,
    status: "verified",
    txSnippet: "0x49dc...6c55",
  },
  {
    id: "ev-2",
    timestamp: "24s ago",
    agent: "0x78f2...104b",
    action: "DeFi Cross-L1 Risk Arbitration",
    amount: "0.05 USDC",
    latency: 388,
    status: "verified",
    txSnippet: "0x0868...ae24",
  },
  {
    id: "ev-3",
    timestamp: "48s ago",
    agent: "0x33e1...b901",
    action: "Smart Contract Bytecode Heuristics",
    amount: "0.05 USDC",
    latency: 440,
    status: "verified",
    txSnippet: "0x2fb7...d890",
  },
];

const AGENT_TEMPLATES = [
  { agent: "0x91a2...c44d", action: "Neural Tokenomics Vector Scan" },
  { agent: "0x42df...882e", action: "Gemini Autonomous Market Audit" },
  { agent: "0x88c1...902a", action: "L1 Mempool Arbitrage Sentiment" },
  { agent: "0x15bf...330d", action: "Multi-Agent Protocol Verification" },
  { agent: "0x63ca...771e", action: "Arc Zero-Latency Settlement Audit" },
];

export default function LiveAgentStream() {
  const [events, setEvents] = useState<StreamEvent[]>(INITIAL_EVENTS);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeCount, setActiveCount] = useState<number>(3);

  useEffect(() => {
    // Periodically add a new autonomous agent event every 9 seconds
    const timer = setInterval(() => {
      const template = AGENT_TEMPLATES[Math.floor(Math.random() * AGENT_TEMPLATES.length)];
      const randHex = Math.random().toString(16).substring(2, 6);
      const newEv: StreamEvent = {
        id: "ev-" + Date.now(),
        timestamp: "just now",
        agent: template.agent,
        action: template.action,
        amount: "0.05 USDC",
        latency: 320 + Math.floor(Math.random() * 160),
        status: "verified",
        txSnippet: `0x${randHex}...${Math.random().toString(16).substring(2, 6)}`,
      };

      setEvents((prev) => [newEv, ...prev.slice(0, 7)]);
      setActiveCount((c) => c + 1);
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  const latest = events[0];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 50,
        maxWidth: isExpanded ? "380px" : "340px",
        width: "100%",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="neu-panel"
        style={{
          padding: "0.85rem 1.1rem",
          background: "var(--neu-base-raised)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 14px 38px rgba(0, 0, 0, 0.8), -6px -6px 16px rgba(255, 255, 255, 0.03)",
        }}
      >
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <span className="beacon-dot" style={{ width: "6px", height: "6px" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              AUTONOMOUS AGENT STREAM
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              className="neu-pill"
              style={{
                fontSize: "0.65rem",
                padding: "0.15rem 0.45rem",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
              }}
            >
              {activeCount} Pings
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--zinc-muted)",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>

        {/* Latest Activity Preview (When collapsed) */}
        {!isExpanded && latest && (
          <div
            style={{
              marginTop: "0.6rem",
              paddingTop: "0.6rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Cpu size={12} color="#ffffff" />
              <span style={{ color: "#ffffff" }}>{latest.agent}</span>
              <span style={{ color: "var(--zinc-muted)" }}>• {latest.latency}ms</span>
            </div>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>+{latest.amount}</span>
          </div>
        )}

        {/* Expanded Feed */}
        {isExpanded && (
          <div
            style={{
              marginTop: "0.85rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {events.map((ev) => (
              <div
                key={ev.id}
                className="neu-well"
                style={{
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{ev.agent}</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{ev.amount}</span>
                </div>
                <div style={{ color: "var(--zinc-muted)", fontSize: "0.68rem" }}>
                  {ev.action}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.15rem",
                    color: "var(--zinc-muted)",
                    fontSize: "0.64rem",
                  }}
                >
                  <span>Settled in {ev.latency}ms</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>{ev.txSnippet}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
