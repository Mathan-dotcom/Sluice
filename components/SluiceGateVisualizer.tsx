"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Zap,
  ArrowRight,
  Shield,
  Activity,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SluiceGateVisualizerProps {
  initialState?: "LOCKED" | "SETTLING" | "UNLOCKED";
  onTriggerDemo?: () => void;
}

export default function SluiceGateVisualizer({
  initialState = "LOCKED",
}: SluiceGateVisualizerProps) {
  const [gateState, setGateState] = useState<"LOCKED" | "SETTLING" | "UNLOCKED">(initialState);
  const [pulseRipples, setPulseRipples] = useState<number[]>([]);

  const handleSimulateCycle = () => {
    // 1. Settle
    setGateState("SETTLING");
    setTimeout(() => {
      // 2. Unlock with confetti & pulse
      setGateState("UNLOCKED");
      setPulseRipples((prev) => [...prev, Date.now()]);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
        });
      } catch {}

      // 3. Reset after 6 seconds
      setTimeout(() => {
        setGateState("LOCKED");
      }, 6000);
    }, 1400);
  };

  return (
    <div
      className={`neu-panel ${gateState === "UNLOCKED" ? "animate-exhale" : ""}`}
      style={{
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient gleam */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background:
            gateState === "UNLOCKED"
              ? "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)"
              : gateState === "SETTLING"
              ? "radial-gradient(circle, rgba(228, 228, 231, 0.06) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(161, 161, 170, 0.03) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <div className="neu-pill">
              <Zap size={12} color="#ffffff" />
              <span>KINETIC VALVE TELEMETRY</span>
            </div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              SUB-SECOND APERTURE
            </span>
          </div>
          <h3 className="text-heading" style={{ color: "#ffffff" }}>
            Cryptographic Sluice Gate Aperture
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            className="neu-pill"
            style={{
              color:
                gateState === "UNLOCKED"
                  ? "#ffffff"
                  : gateState === "SETTLING"
                  ? "#e4e4e7"
                  : "#a1a1aa",
              boxShadow:
                gateState === "UNLOCKED"
                  ? "0 0 16px rgba(255, 255, 255, 0.35)"
                  : undefined,
            }}
          >
            <span
              className="beacon-dot"
              style={{
                background:
                  gateState === "UNLOCKED"
                    ? "#ffffff"
                    : gateState === "SETTLING"
                    ? "#e4e4e7"
                    : "#71717a",
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {gateState === "UNLOCKED"
                ? "GATE OPEN (200 OK)"
                : gateState === "SETTLING"
                ? "SETTLING (ARC L1)"
                : "GATE CLOSED (402 PAYMENT REQUIRED)"}
            </span>
          </div>

          <button
            onClick={handleSimulateCycle}
            disabled={gateState === "SETTLING"}
            className="neu-button"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: gateState === "SETTLING" ? "spin 1s linear infinite" : "none",
              }}
            />
            Simulate Flow
          </button>
        </div>
      </div>

      {/* Interactive Visual Canal / Pipeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "1.5rem",
          padding: "2rem 1rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Left Side: Autonomous AI Agent Inflow */}
        <div
          className="neu-well"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            textAlign: "center",
          }}
        >
          <div className="text-micro" style={{ color: "var(--zinc-muted)" }}>
            INBOUND CLIENT
          </div>
          <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "1.1rem" }}>
            Autonomous AI Agent
          </div>
          <div style={{ fontSize: "0.78rem", color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
            POST /api/gate/summarize
          </div>
          <div
            className="neu-pill"
            style={{
              margin: "0 auto",
              fontSize: "0.72rem",
              background: "var(--ink)",
            }}
          >
            Payload: 1,420 bytes
          </div>
        </div>

        {/* Center: The Kinetic Cybernetic Sluice Aperture */}
        <div
          style={{
            position: "relative",
            width: "160px",
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Rotating Outer Ring */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px dashed rgba(255, 255, 255, 0.12)",
              animation:
                gateState === "SETTLING"
                  ? "spin 1.5s linear infinite"
                  : "spin 24s linear infinite",
              transition: "animation 0.3s ease",
            }}
          />

          {/* Middle Concentric Ring */}
          <div
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border:
                gateState === "UNLOCKED"
                  ? "2px solid rgba(255, 255, 255, 0.6)"
                  : "2px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                gateState === "UNLOCKED"
                  ? "0 0 24px rgba(255, 255, 255, 0.45), inset 0 0 16px rgba(255, 255, 255, 0.2)"
                  : "inset 4px 4px 10px rgba(0,0,0,0.6)",
              transition: "all 0.4s ease",
              animation:
                gateState === "SETTLING"
                  ? "spin 1s reverse linear infinite"
                  : "none",
            }}
          />

          {/* Center Aperture Core */}
          <div
            className="neu-panel-raised"
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                gateState === "UNLOCKED"
                  ? "0 0 30px rgba(255, 255, 255, 0.6), 6px 6px 16px var(--neu-shadow-dark)"
                  : "8px 8px 18px var(--neu-shadow-dark), -6px -6px 14px var(--neu-shadow-light)",
              transform:
                gateState === "UNLOCKED"
                  ? "scale(1.15)"
                  : gateState === "SETTLING"
                  ? "scale(0.95)"
                  : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
            }}
          >
            {gateState === "UNLOCKED" ? (
              <Unlock size={28} color="#ffffff" />
            ) : (
              <Lock size={28} color={gateState === "SETTLING" ? "#ffffff" : "#a1a1aa"} />
            )}
          </div>
        </div>

        {/* Right Side: UsageVault On-Chain Settlement */}
        <div
          className="neu-well"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            textAlign: "center",
          }}
        >
          <div className="text-micro" style={{ color: "var(--zinc-muted)" }}>
            ARC SETTLEMENT VAULT
          </div>
          <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "1.1rem" }}>
            UsageVault.sol
          </div>
          <div style={{ fontSize: "0.78rem", color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
            Rate: 0.05 USDC / call
          </div>
          <div
            className="neu-pill"
            style={{
              margin: "0 auto",
              fontSize: "0.72rem",
              background: "var(--ink)",
              color: gateState === "UNLOCKED" ? "#ffffff" : "var(--zinc-muted)",
            }}
          >
            {gateState === "UNLOCKED" ? "Verified on Arcscan" : "Chain #5042002"}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          fontSize: "0.78rem",
          color: "var(--zinc-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>
          Current Flow State:{" "}
          <strong style={{ color: "#ffffff" }}>
            {gateState === "UNLOCKED"
              ? "COMPLETED (Sub-second finality)"
              : gateState === "SETTLING"
              ? "MINING BLOCK ON ARC TESTNET..."
              : "READY (Awaiting Machine Caller Request)"}
          </strong>
        </span>
        <span>Latency: ~120ms</span>
      </div>
    </div>
  );
}
