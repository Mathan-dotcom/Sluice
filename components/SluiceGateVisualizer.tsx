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
  Cpu,
  Database,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SluiceGateVisualizerProps {
  initialState?: "LOCKED" | "SETTLING" | "UNLOCKED";
}

export default function SluiceGateVisualizer({
  initialState = "LOCKED",
}: SluiceGateVisualizerProps) {
  const [gateState, setGateState] = useState<"LOCKED" | "SETTLING" | "UNLOCKED">(initialState);
  const [energyPackets, setEnergyPackets] = useState<number[]>([]);

  const handleSimulateCycle = () => {
    // 1. Settle
    setGateState("SETTLING");
    setEnergyPackets([1, 2, 3]);

    setTimeout(() => {
      // 2. Unlock with confetti & pulse
      setGateState("UNLOCKED");

      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.55 },
          colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
        });
      } catch {}

      // 3. Reset after 7 seconds
      setTimeout(() => {
        setGateState("LOCKED");
        setEnergyPackets([]);
      }, 7000);
    }, 1400);
  };

  return (
    <div
      className={`neu-panel ${gateState === "UNLOCKED" ? "animate-exhale" : ""}`}
      style={{
        padding: "2.25rem",
        position: "relative",
        overflow: "hidden",
        boxShadow:
          gateState === "UNLOCKED"
            ? "8px 8px 24px var(--neu-shadow-dark), -6px -6px 20px var(--neu-shadow-light), 0 0 45px rgba(255,255,255,0.12)"
            : undefined,
        transition: "box-shadow 0.6s ease",
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            gateState === "UNLOCKED"
              ? "radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, transparent 65%)"
              : gateState === "SETTLING"
              ? "radial-gradient(circle, rgba(228, 228, 231, 0.07) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(161, 161, 170, 0.035) 0%, transparent 65%)",
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
              <span>KINETIC APERTURE TELEMETRY</span>
            </div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              SUB-SECOND LIQUIDITY GATE
            </span>
          </div>
          <h3
            className="text-heading"
            style={{
              color: "#ffffff",
              fontSize: "1.45rem",
              letterSpacing: "-0.01em",
            }}
          >
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
            className="neu-button-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: gateState === "SETTLING" ? "spin 1s linear infinite" : "none",
              }}
            />
            <span>Simulate Micro-Flow</span>
          </button>
        </div>
      </div>

      {/* Cybernetic Pipeline with Connecting Conduits */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr auto 1.1fr",
          alignItems: "center",
          gap: "1.5rem",
          padding: "2.5rem 1rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Left Side: Autonomous AI Agent Inflow */}
        <div
          className="neu-well card-hover"
          style={{
            padding: "1.75rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--neu-base-raised)",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.68rem",
              fontFamily: "var(--font-mono)",
              color: "var(--zinc-muted)",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
            }}
          >
            CALLER NODE
          </div>

          <div
            style={{
              width: "44px",
              height: "44px",
              margin: "0 auto",
              borderRadius: "12px",
              background: "var(--neu-base-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "4px 4px 10px var(--neu-shadow-dark), -3px -3px 8px var(--neu-shadow-light)",
            }}
          >
            <Cpu size={22} color="#ffffff" />
          </div>

          <div>
            <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "1.15rem" }}>
              Autonomous AI Agent
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a1a1aa", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              POST /api/gate/summarize
            </div>
          </div>

          <div
            className="neu-pill"
            style={{
              margin: "0 auto",
              fontSize: "0.72rem",
              background: "var(--ink)",
              color: "#ffffff",
            }}
          >
            <span>Payload: Unlocked Neural Request</span>
          </div>
        </div>

        {/* Center: The Concentric Sluice Aperture */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Animated Stream Pulses */}
          <svg
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {/* Left Conduit */}
            <line
              x1="-40"
              y1="100"
              x2="40"
              y2="100"
              stroke={gateState === "UNLOCKED" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)"}
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            {/* Right Conduit */}
            <line
              x1="160"
              y1="100"
              x2="240"
              y2="100"
              stroke={gateState === "UNLOCKED" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)"}
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Concentric Outer Gear Ring with HUD Notches */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px dashed rgba(255, 255, 255, 0.16)",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)",
              animation:
                gateState === "SETTLING"
                  ? "spin 1.8s linear infinite"
                  : "spin 32s linear infinite",
              transition: "animation 0.3s ease",
            }}
          />

          {/* Middle Ring with Rune Ticks */}
          <div
            style={{
              position: "absolute",
              width: "148px",
              height: "148px",
              borderRadius: "50%",
              border:
                gateState === "UNLOCKED"
                  ? "2px solid rgba(255, 255, 255, 0.75)"
                  : "2px solid rgba(255, 255, 255, 0.1)",
              boxShadow:
                gateState === "UNLOCKED"
                  ? "0 0 35px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.25)"
                  : "inset 6px 6px 14px rgba(0,0,0,0.7)",
              transition: "all 0.5s ease",
              animation:
                gateState === "SETTLING"
                  ? "spin 1.2s reverse linear infinite"
                  : "none",
            }}
          />

          {/* Center Aperture Iris Core */}
          <div
            className="neu-panel-raised"
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                gateState === "UNLOCKED"
                  ? "0 0 45px rgba(255, 255, 255, 0.7), 10px 10px 22px var(--neu-shadow-dark)"
                  : "8px 8px 20px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light)",
              transform:
                gateState === "UNLOCKED"
                  ? "scale(1.18)"
                  : gateState === "SETTLING"
                  ? "scale(0.92)"
                  : "scale(1)",
              transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease",
            }}
          >
            {gateState === "UNLOCKED" ? (
              <Unlock size={32} color="#ffffff" />
            ) : (
              <Lock size={32} color={gateState === "SETTLING" ? "#ffffff" : "#a1a1aa"} />
            )}
          </div>
        </div>

        {/* Right Side: UsageVault On-Chain Settlement */}
        <div
          className="neu-well card-hover"
          style={{
            padding: "1.75rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--neu-base-raised)",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.68rem",
              fontFamily: "var(--font-mono)",
              color: "#ffffff",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
            }}
          >
            SMART CONTRACT
          </div>

          <div
            style={{
              width: "44px",
              height: "44px",
              margin: "0 auto",
              borderRadius: "12px",
              background: "var(--neu-base-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "4px 4px 10px var(--neu-shadow-dark), -3px -3px 8px var(--neu-shadow-light)",
            }}
          >
            <Database size={22} color="#ffffff" />
          </div>

          <div>
            <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "1.15rem" }}>
              UsageVault.sol
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a1a1aa", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              Rate: 0.05 USDC / call
            </div>
          </div>

          <div
            className="neu-pill"
            style={{
              margin: "0 auto",
              fontSize: "0.72rem",
              background: "var(--ink)",
              color: gateState === "UNLOCKED" ? "#ffffff" : "var(--zinc-muted)",
              fontWeight: gateState === "UNLOCKED" ? 600 : 400,
            }}
          >
            {gateState === "UNLOCKED" ? "Verified On-Chain on Arc" : "Arc Testnet #5042002"}
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "1.25rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "0.82rem",
          color: "var(--zinc-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={15} color="#ffffff" />
          <span>
            Pipeline Status:{" "}
            <strong style={{ color: "#ffffff" }}>
              {gateState === "UNLOCKED"
                ? "APERTURE ACTIVE (200 OK STREAMING)"
                : gateState === "SETTLING"
                ? "MINING BLOCK CONFIRMATION..."
                : "AWAITING INBOUND MACHINE PAYLOAD"}
            </strong>
          </span>
        </div>
        <div>Arc Finality: ~120ms</div>
      </div>
    </div>
  );
}
