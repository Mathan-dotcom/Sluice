"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ARC_TESTNET_CONFIG, DEFAULT_USAGE_VAULT_ADDRESS } from "@/lib/arc";

interface SellerDashboardProps {
  balance: string;
  currency: string;
  withdrawThreshold: string;
  canWithdraw: boolean;
  totalCalls: number;
  totalVolume: string;
  sellerAddress: string;
  vaultAddress: string;
  onRefresh: () => void;
}

export default function SellerDashboard({
  balance,
  currency,
  withdrawThreshold,
  canWithdraw,
  totalCalls,
  totalVolume,
  sellerAddress,
  vaultAddress,
  onRefresh,
}: SellerDashboardProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [newThresholdInput, setNewThresholdInput] = useState(withdrawThreshold);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);

  const balanceNum = parseFloat(balance) || 0;
  const thresholdNum = parseFloat(withdrawThreshold) || 0.2;
  const progressPercent = Math.min(100, Math.round((balanceNum / Math.max(thresholdNum, 0.01)) * 100));

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawMsg(null);

    try {
      const res = await fetch("/api/vault/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      const data = await res.json();

      if (res.ok) {
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
          });
        } catch {}

        setWithdrawMsg({
          text: `Withdrew ${data.withdrawnAmount} ${currency} on Arc Testnet! (Tx: ${data.txHash.slice(0, 10)}...)`,
          type: "success",
        });
        onRefresh();
      } else {
        setWithdrawMsg({ text: data.error || "Withdrawal failed", type: "error" });
      }
    } catch (err: any) {
      setWithdrawMsg({ text: err.message || "Network error", type: "error" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      const res = await fetch("/api/vault/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setThreshold",
          threshold: newThresholdInput,
        }),
      });
      if (res.ok) {
        setIsEditingThreshold(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Primary Vault Balance Mission Card */}
      <div
        className="neu-panel card-hover"
        style={{
          padding: "2.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <div className="neu-pill">
                <Wallet size={12} color="#ffffff" />
                <span>SELLER USAGE VAULT</span>
              </div>
              <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
                ARC TESTNET #{ARC_TESTNET_CONFIG.chainId}
              </span>
            </div>
            <h2 className="text-heading" style={{ color: "#ffffff" }}>
              Settled Treasury Balance
            </h2>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.25rem" }}>
              PAYOUT RULE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="text-data" style={{ color: "#ffffff", fontWeight: 600 }}>
                Min. {withdrawThreshold} {currency}
              </span>
              <button
                onClick={() => setIsEditingThreshold(!isEditingThreshold)}
                className="neu-button"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
              >
                <Sliders size={12} />
                Adjust
              </button>
            </div>
          </div>
        </div>

        {/* Editing Threshold Recessed Drawer */}
        {isEditingThreshold && (
          <div
            className="neu-well"
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="text-body" style={{ fontSize: "0.85rem", color: "#ffffff" }}>
                Target Threshold ({currency}):
              </span>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={newThresholdInput}
                onChange={(e) => setNewThresholdInput(e.target.value)}
                style={{
                  background: "var(--ink)",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "8px",
                  width: "100px",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.6)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleUpdateThreshold}
                className="neu-button-primary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}
              >
                Save On-Chain
              </button>
              <button
                onClick={() => setIsEditingThreshold(false)}
                className="neu-button"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Hero Number Display */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <div className="text-display-xl" style={{ color: "#ffffff" }}>
            {balance}
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.25rem",
              fontWeight: 500,
              color: "var(--zinc-muted)",
            }}
          >
            {currency}
          </span>
        </div>

        {/* Threshold Progress Bar */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              color: "var(--zinc-muted)",
              marginBottom: "0.5rem",
            }}
          >
            <span>Withdrawal Readiness</span>
            <span>
              {progressPercent}% ({balance} / {withdrawThreshold} {currency})
            </span>
          </div>
          <div
            className="neu-well"
            style={{
              padding: "3px",
              height: "12px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  progressPercent >= 100
                    ? "#ffffff"
                    : "linear-gradient(90deg, #71717a, #e4e4e7)",
                boxShadow:
                  progressPercent >= 100
                    ? "0 0 12px rgba(255, 255, 255, 0.7)"
                    : "none",
                transition: "width 0.4s ease-out",
              }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw || isWithdrawing}
            className={canWithdraw ? "neu-button-primary" : "neu-button"}
            style={{ padding: "0.85rem 1.75rem" }}
          >
            <ArrowUpRight size={18} />
            <span>
              {isWithdrawing
                ? "Settling on Arc..."
                : canWithdraw
                ? `Withdraw ${balance} ${currency} to Seller`
                : `Locked (Requires ≥ ${withdrawThreshold} ${currency})`}
            </span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--zinc-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>Seller:</span>
            <span style={{ color: "#ffffff" }}>
              {sellerAddress.slice(0, 8)}...{sellerAddress.slice(-6)}
            </span>
          </div>
        </div>

        {/* Status Alerts */}
        {withdrawMsg && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-pulse-sm)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              background:
                withdrawMsg.type === "success"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(161, 161, 170, 0.15)",
              color: "#ffffff",
              boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.4)",
            }}
          >
            {withdrawMsg.type === "success" ? (
              <CheckCircle2 size={16} color="#ffffff" />
            ) : (
              <AlertCircle size={16} color="#e4e4e7" />
            )}
            <span>{withdrawMsg.text}</span>
          </div>
        )}
      </div>

      {/* 3 Secondary Telemetry Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="neu-panel card-hover" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--zinc-muted)",
              marginBottom: "0.75rem",
            }}
          >
            <Zap size={16} />
            <span className="text-micro">All-Time Settled Calls</span>
          </div>
          <div
            className="text-display-md"
            style={{ color: "#ffffff", marginBottom: "0.25rem" }}
          >
            {totalCalls}
          </div>
          <p className="card-description text-body" style={{ fontSize: "0.8rem" }}>
            Direct autonomous agent calls verified via Arc x402 settlement.
          </p>
        </div>

        <div className="neu-panel card-hover" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--zinc-muted)",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={16} />
            <span className="text-micro">Cumulative Platform Revenue</span>
          </div>
          <div
            className="text-display-md"
            style={{ color: "#ffffff", marginBottom: "0.25rem" }}
          >
            {totalVolume} <span style={{ fontSize: "1rem", color: "var(--zinc-muted)" }}>{currency}</span>
          </div>
          <p className="card-description text-body" style={{ fontSize: "0.8rem" }}>
            100% on-chain auditability on UsageVault smart contract.
          </p>
        </div>

        <div className="neu-panel card-hover" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--zinc-muted)",
              marginBottom: "0.75rem",
            }}
          >
            <Layers size={16} />
            <span className="text-micro">Active Meter Rate</span>
          </div>
          <div
            className="text-display-md"
            style={{ color: "#ffffff", marginBottom: "0.25rem" }}
          >
            0.05 <span style={{ fontSize: "1rem", color: "var(--zinc-muted)" }}>USDC / call</span>
          </div>
          <p className="card-description text-body" style={{ fontSize: "0.8rem" }}>
            Instant HTTP 402 machine-settled access with zero subscription overhead.
          </p>
        </div>
      </div>
    </div>
  );
}
