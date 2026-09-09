"use client";

import React, { useEffect, useRef } from "react";

interface Streamline {
  baseY: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  width: number;
  alpha: number;
}

interface PulsePacket {
  lineIndex: number;
  progress: number;
  speed: number;
  size: number;
  glow: number;
}

export default function SluiceFlow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Generate laminar sluice streamlines
    const lineCount = 28;
    const streamlines: Streamline[] = [];
    const spacing = height / (lineCount - 2);

    for (let i = 0; i < lineCount; i++) {
      streamlines.push({
        baseY: i * spacing - spacing * 0.5,
        amplitude: 22 + (i % 5) * 8,
        frequency: 0.0018 + (i % 4) * 0.0006,
        speed: 0.006 + (i % 3) * 0.003,
        phase: (i * Math.PI) / 6,
        width: i % 3 === 0 ? 1.2 : 0.75,
        alpha: i % 4 === 0 ? 0.12 : 0.05,
      });
    }

    // Generate traveling telemetry packets (representing micropayments flowing through sluice channels)
    const packets: PulsePacket[] = [];
    const packetCount = 38;

    for (let i = 0; i < packetCount; i++) {
      packets.push({
        lineIndex: Math.floor(Math.random() * lineCount),
        progress: Math.random(),
        speed: 0.0008 + Math.random() * 0.0016,
        size: 1.5 + Math.random() * 2,
        glow: 0.4 + Math.random() * 0.5,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      time += 0.015;

      // Draw each laminar streamline
      for (let i = 0; i < streamlines.length; i++) {
        const line = streamlines[i];
        ctx.beginPath();

        const step = 20;
        let isFirst = true;

        for (let x = 0; x <= width + step; x += step) {
          // Distance from mouse for curvature deflection
          const dx = x - mouseX;
          const dy = line.baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseDeflection =
            dist < 320 ? Math.cos((dist / 320) * (Math.PI / 2)) * 32 : 0;

          const wave =
            Math.sin(x * line.frequency + time * line.speed * 20 + line.phase) *
            line.amplitude;

          const harmonic =
            Math.cos(x * line.frequency * 1.8 - time * 0.15) *
            (line.amplitude * 0.35);

          const y = line.baseY + wave + harmonic - mouseDeflection * (dy < 0 ? -1 : 1);

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
        ctx.lineWidth = line.width;
        ctx.stroke();
      }

      // Draw and advance traveling payment packets
      for (let p = 0; p < packets.length; p++) {
        const packet = packets[p];
        packet.progress += packet.speed;
        if (packet.progress > 1) {
          packet.progress = 0;
          packet.lineIndex = Math.floor(Math.random() * lineCount);
        }

        const line = streamlines[packet.lineIndex];
        if (!line) continue;

        const x = packet.progress * width;

        const dx = x - mouseX;
        const dy = line.baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseDeflection =
          dist < 320 ? Math.cos((dist / 320) * (Math.PI / 2)) * 32 : 0;

        const wave =
          Math.sin(x * line.frequency + time * line.speed * 20 + line.phase) *
          line.amplitude;

        const harmonic =
          Math.cos(x * line.frequency * 1.8 - time * 0.15) *
          (line.amplitude * 0.35);

        const y = line.baseY + wave + harmonic - mouseDeflection * (dy < 0 ? -1 : 1);

        // Draw light packet
        ctx.beginPath();
        ctx.arc(x, y, packet.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${packet.glow})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
        ctx.shadowBlur = 8;
        ctx.fill();

        // Subtle trail
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${packet.glow * 0.4})`;
        ctx.lineWidth = packet.size * 0.8;
        ctx.stroke();

        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}
