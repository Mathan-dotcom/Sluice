"use client";

import React, { useEffect, useState } from "react";
import { Activity, Radio, Cpu, CheckCircle2 } from "lucide-react";
import { ARC_TESTNET_CONFIG } from "@/lib/arc";

export default function ArcOscilloscope() {
  const [points, setPoints] = useState<number[]>([20, 35, 18, 42, 28, 55, 30, 48, 60, 45, 38, 50, 65, 40]);
  const [latency, setLatency] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => {
        const nextVal = Math.floor(20 + Math.random() * 45);
        return [...prev.slice(1), nextVal];
      });
      setLatency(Math.floor(42 + Math.random() * 15));
    }, 900);

    return () => clearInterval(interval);
  }, []);

  // Build SVG path
  const svgWidth = 260;
  const svgHeight = 60;
  const step = svgWidth / (points.length - 1);
  const pathD = points
    .map((val, idx) => {
      const x = idx * step;
      const y = svgHeight - (val / 70) * svgHeight;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div
      className="neu-panel card-hover"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio size={14} color="#ffffff" />
          <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
            ARC L1 HEARTBEAT
          </span>
        </div>
        <div className="neu-pill" style={{ fontSize: "0.68rem", padding: "0.2rem 0.55rem" }}>
          <span className="beacon-dot" style={{ width: "5px", height: "5px" }} />
          <span>{latency}ms</span>
        </div>
      </div>

      {/* Oscilloscope SVG */}
      <div
        className="neu-well"
        style={{
          padding: "0.5rem",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGleam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#waveGleam)"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))",
              transition: "d 0.3s ease",
            }}
          />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--zinc-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>Gas: Native USDC</span>
        <span style={{ color: "#ffffff" }}>Chain #5042002</span>
      </div>
    </div>
  );
}
