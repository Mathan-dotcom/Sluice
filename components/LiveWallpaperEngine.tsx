"use client";

import React, { useEffect, useRef, useState } from "react";

export type WallpaperMode = "hydro" | "quantum" | "celestial";

interface LiveWallpaperEngineProps {
  mode?: WallpaperMode;
}

export default function LiveWallpaperEngine({ mode = "hydro" }: LiveWallpaperEngineProps) {
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

    // Stardust embers trail
    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }
    const embers: Ember[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;

      // Spawn subtle embers on movement
      if (Math.random() < 0.45) {
        embers.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.2,
          alpha: 0.6 + Math.random() * 0.3,
          size: Math.random() * 2 + 1,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // --- MODE 1: HYDRO SLUICE STREAMLINES ---
    const lineCount = 30;
    const streamlines = Array.from({ length: lineCount }, (_, i) => ({
      baseY: (i * height) / (lineCount - 2) - height * 0.1,
      amplitude: 24 + (i % 5) * 10,
      frequency: 0.0016 + (i % 4) * 0.0005,
      speed: 0.006 + (i % 3) * 0.003,
      phase: (i * Math.PI) / 6,
      width: i % 3 === 0 ? 1.3 : 0.8,
      alpha: i % 4 === 0 ? 0.14 : 0.06,
    }));

    const packets = Array.from({ length: 42 }, () => ({
      lineIndex: Math.floor(Math.random() * lineCount),
      progress: Math.random(),
      speed: 0.0009 + Math.random() * 0.0018,
      size: 1.5 + Math.random() * 2.2,
      glow: 0.5 + Math.random() * 0.5,
    }));

    // --- MODE 2: QUANTUM GRID (3D Iso Mesh) ---
    const gridCols = 24;
    const gridRows = 16;

    // --- MODE 3: CELESTIAL ARC (Constellation Orbit) ---
    const celestialNodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      time += 0.015;

      // --- RENDER SELECTED MODE ---
      if (mode === "hydro") {
        // Draw laminar streamlines
        for (let i = 0; i < streamlines.length; i++) {
          const line = streamlines[i];
          ctx.beginPath();
          const step = 20;
          let isFirst = true;

          for (let x = 0; x <= width + step; x += step) {
            const dx = x - mouseX;
            const dy = line.baseY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseDeflection =
              dist < 340 ? Math.cos((dist / 340) * (Math.PI / 2)) * 36 : 0;

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
            dist < 340 ? Math.cos((dist / 340) * (Math.PI / 2)) * 36 : 0;

          const wave =
            Math.sin(x * line.frequency + time * line.speed * 20 + line.phase) *
            line.amplitude;
          const harmonic =
            Math.cos(x * line.frequency * 1.8 - time * 0.15) *
            (line.amplitude * 0.35);
          const y = line.baseY + wave + harmonic - mouseDeflection * (dy < 0 ? -1 : 1);

          ctx.beginPath();
          ctx.arc(x, y, packet.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${packet.glow})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x - 16, y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${packet.glow * 0.45})`;
          ctx.lineWidth = packet.size * 0.8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (mode === "quantum") {
        // Undulating 3D cybernetic wireframe grid
        const colStep = width / (gridCols - 1);
        const rowStep = height / (gridRows - 1);

        for (let r = 0; r < gridRows; r++) {
          ctx.beginPath();
          for (let c = 0; c < gridCols; c++) {
            const x = c * colStep;
            const baseY = r * rowStep;
            const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(baseY - mouseY, 2));
            const mouseLift = dist < 280 ? Math.sin((1 - dist / 280) * Math.PI) * 28 : 0;
            const z = Math.sin(c * 0.4 + time * 1.5) * Math.cos(r * 0.4 + time * 1.2) * 16;
            const y = baseY + z - mouseLift;

            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + (r % 2) * 0.04})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        for (let c = 0; c < gridCols; c++) {
          ctx.beginPath();
          for (let r = 0; r < gridRows; r++) {
            const x = c * colStep;
            const baseY = r * rowStep;
            const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(baseY - mouseY, 2));
            const mouseLift = dist < 280 ? Math.sin((1 - dist / 280) * Math.PI) * 28 : 0;
            const z = Math.sin(c * 0.4 + time * 1.5) * Math.cos(r * 0.4 + time * 1.2) * 16;
            const y = baseY + z - mouseLift;

            if (r === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + (c % 2) * 0.03})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      } else if (mode === "celestial") {
        // Celestial Constellation with gravitational cursor attraction
        const maxDist = 130;
        for (let i = 0; i < celestialNodes.length; i++) {
          const nodeA = celestialNodes[i];
          nodeA.x += nodeA.vx;
          nodeA.y += nodeA.vy;

          if (nodeA.x < 0 || nodeA.x > width) nodeA.vx *= -1;
          if (nodeA.y < 0 || nodeA.y > height) nodeA.vy *= -1;

          // Gentle attraction toward mouse
          const mdx = mouseX - nodeA.x;
          const mdy = mouseY - nodeA.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 220 && mdist > 20) {
            nodeA.vx += (mdx / mdist) * 0.02;
            nodeA.vy += (mdy / mdist) * 0.02;
          }

          // Dampen speed
          nodeA.vx *= 0.99;
          nodeA.vy *= 0.99;

          nodeA.phase += 0.025;
          const currentAlpha = nodeA.baseAlpha + Math.sin(nodeA.phase) * 0.15;

          // Connect nearby nodes
          for (let j = i + 1; j < celestialNodes.length; j++) {
            const nodeB = celestialNodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              ctx.beginPath();
              ctx.moveTo(nodeA.x, nodeA.y);
              ctx.lineTo(nodeB.x, nodeB.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / maxDist) * 0.15})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, currentAlpha)})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // --- RENDER MOUSE STARDUST EMBERS (Active in all modes) ---
      for (let e = embers.length - 1; e >= 0; e--) {
        const ember = embers[e];
        ember.x += ember.vx;
        ember.y += ember.vy;
        ember.alpha -= 0.015;

        if (ember.alpha <= 0) {
          embers.splice(e, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ember.alpha})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 4;
        ctx.fill();
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
  }, [mode]);

  return (
    <>
      {/* 3D Volumetric Floating Atmospheric Nebula Orbs */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.035) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "floatSlow 24s infinite alternate ease-in-out",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-10%",
          right: "5%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(228, 228, 231, 0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "floatSlow 32s infinite alternate-reverse ease-in-out",
        }}
      />

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
          opacity: 0.95,
        }}
      />
    </>
  );
}
