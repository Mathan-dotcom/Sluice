"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";

interface ConfidenceGaugeProps {
  score?: number; // 0.00 to 1.00
  statusText?: string;
}

export default function ConfidenceGauge({
  score = 0.96,
  statusText = "AUTONOMOUS CLEARING TIER",
}: ConfidenceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(start + (score - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - animatedScore * circumference;
  const isAutonomous = animatedScore >= 0.7;

  return (
    <div
      className="neu-panel card-hover"
      style={{
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <span className="beacon-dot" />
        <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
          BAYESIAN AUTONOMY GATE
        </span>
      </div>

      {/* Circular SVG Gauge */}
      <div style={{ position: "relative", width: "140px", height: "140px" }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          {/* Background Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Meter Stroke */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={isAutonomous ? "#ffffff" : "#a1a1aa"}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.1s ease, stroke 0.3s ease",
              filter: isAutonomous
                ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))"
                : "none",
            }}
          />
        </svg>

        {/* Center Percentage & Label */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="text-display-md"
            style={{
              fontSize: "1.75rem",
              lineHeight: 1,
              color: "#ffffff",
              fontWeight: 500,
            }}
          >
            {Math.round(animatedScore * 100)}%
          </div>
          <span
            className="text-micro"
            style={{
              fontSize: "0.65rem",
              color: "var(--zinc-muted)",
              marginTop: "2px",
            }}
          >
            CONFIDENCE
          </span>
        </div>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <div
          className="neu-pill"
          style={{
            background: isAutonomous
              ? "rgba(255, 255, 255, 0.08)"
              : "var(--neu-base)",
            color: "#ffffff",
            fontSize: "0.72rem",
            padding: "0.35rem 0.85rem",
          }}
        >
          <ShieldCheck size={12} color="#ffffff" />
          <span>{statusText}</span>
        </div>
        <p
          className="card-description text-body"
          style={{
            fontSize: "0.78rem",
            color: "var(--zinc-muted)",
            marginTop: "0.5rem",
            maxWidth: "220px",
          }}
        >
          Bayesian execution gate satisfied (≥ 0.70). Autonomous verification approved on Arc.
        </p>
      </div>
    </div>
  );
}
