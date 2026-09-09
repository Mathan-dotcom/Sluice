"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Layers,
  Terminal,
  Cpu,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import PulseField from "@/components/PulseField";
import SellerDashboard from "@/components/SellerDashboard";
import ApiPlayground from "@/components/ApiPlayground";
import AuditTrail from "@/components/AuditTrail";
import ArchitectureModal from "@/components/ArchitectureModal";
import {
  ARC_TESTNET_CONFIG,
  DEFAULT_SELLER_ADDRESS,
  DEFAULT_USAGE_VAULT_ADDRESS,
  UsageReceipt,
} from "@/lib/arc";

export default function Home() {
  const [stats, setStats] = useState<{
    balance: string;
    currency: string;
    withdrawThreshold: string;
    canWithdraw: boolean;
    totalCalls: number;
    totalVolume: string;
    sellerAddress: string;
    vaultAddress: string;
    receipts: UsageReceipt[];
  }>({
    balance: "0.1500",
    currency: "USDC",
    withdrawThreshold: "0.20",
    canWithdraw: false,
    totalCalls: 3,
    totalVolume: "0.1500",
    sellerAddress: DEFAULT_SELLER_ADDRESS,
    vaultAddress: DEFAULT_USAGE_VAULT_ADDRESS,
    receipts: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"control" | "playground" | "audit">("control");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vault/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          balance: data.balance,
          currency: data.currency,
          withdrawThreshold: data.withdrawThreshold,
          canWithdraw: data.canWithdraw,
          totalCalls: data.totalCalls,
          totalVolume: data.totalVolume,
          sellerAddress: data.sellerAddress,
          vaultAddress: data.vaultAddress,
          receipts: data.receipts || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch vault stats", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Periodically sync stats every 12 seconds
    const interval = setInterval(fetchStats, 12000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--ink)",
        paddingBottom: "4rem",
      }}
    >
      {/* 60fps HTML5 Canvas Particle Field */}
      <PulseField />

      {/* Main Container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "1.5rem 1.5rem",
        }}
      >
        {/* Topbar / Navigation */}
        <header
          className="neu-panel"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.75rem",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Logo & Network Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="beacon-dot" />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                SLUICE
              </span>
            </div>

            <div className="neu-pill">
              <span style={{ color: "#ffffff", fontWeight: 600 }}>
                {ARC_TESTNET_CONFIG.chainName}
              </span>
              <span style={{ color: "var(--zinc-muted)" }}>
                #{ARC_TESTNET_CONFIG.chainId}
              </span>
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              id="btn-architecture"
              onClick={() => setIsArchModalOpen(true)}
              className="neu-button"
              style={{ padding: "0.55rem 1.1rem", fontSize: "0.8rem" }}
            >
              <BookOpen size={14} />
              <span>Architecture & Track Docs</span>
            </button>

            <a
              id="link-faucet"
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="neu-button"
              style={{ padding: "0.55rem 1.1rem", fontSize: "0.8rem" }}
            >
              <span>Circle USDC Faucet</span>
              <ExternalLink size={13} />
            </a>

            <div
              className="neu-pill"
              style={{
                padding: "0.5rem 1rem",
                background: "var(--neu-base-raised)",
              }}
            >
              <span style={{ color: "var(--zinc-muted)" }}>Vault:</span>
              <span style={{ color: "#ffffff", fontWeight: 500 }}>
                {stats.vaultAddress.slice(0, 6)}...{stats.vaultAddress.slice(-4)}
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div className="neu-pill">
              <Zap size={13} color="#ffffff" />
              <span>SUB-SECOND x402 SETTLEMENT ON ARC</span>
            </div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              ETHOnline 2026 Submission
            </span>
          </div>

          <h1
            className="text-display-md"
            style={{
              color: "#ffffff",
              marginBottom: "1rem",
              maxWidth: "960px",
            }}
          >
            Pay-Per-Call API Monetization with On-Chain Usage Vault
          </h1>

          <p
            className="text-body card-description"
            style={{
              maxWidth: "820px",
              color: "#a1a1aa",
              fontSize: "1.05rem",
              lineHeight: 1.6,
            }}
          >
            Sluice allows autonomous AI agents and programmatic clients to consume APIs with instant machine payments in USDC on Arc. Unpaid callers receive an HTTP 402 challenge; once settled, requests unlock instantly and usage is recorded irrevocably on the <strong>UsageVault</strong> smart contract.
          </p>
        </section>

        {/* View Switcher Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.75rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
            paddingBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            id="tab-control"
            onClick={() => setActiveView("control")}
            className={activeView === "control" ? "neu-button-primary" : "neu-button"}
            style={{ padding: "0.6rem 1.25rem" }}
          >
            <Layers size={16} />
            <span>Seller Mission Control</span>
          </button>

          <button
            id="tab-playground"
            onClick={() => setActiveView("playground")}
            className={activeView === "playground" ? "neu-button-primary" : "neu-button"}
            style={{ padding: "0.6rem 1.25rem" }}
          >
            <Cpu size={16} />
            <span>Interactive 402 Playground</span>
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveView("audit")}
            className={activeView === "audit" ? "neu-button-primary" : "neu-button"}
            style={{ padding: "0.6rem 1.25rem" }}
          >
            <Terminal size={16} />
            <span>On-Chain Ledger ({stats.receipts.length})</span>
          </button>
        </div>

        {/* Content Sections */}
        {activeView === "control" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <SellerDashboard
              balance={stats.balance}
              currency={stats.currency}
              withdrawThreshold={stats.withdrawThreshold}
              canWithdraw={stats.canWithdraw}
              totalCalls={stats.totalCalls}
              totalVolume={stats.totalVolume}
              sellerAddress={stats.sellerAddress}
              vaultAddress={stats.vaultAddress}
              onRefresh={fetchStats}
            />

            {/* Also include quick playground teaser below */}
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="text-micro" style={{ color: "#ffffff" }}>
                    LIVE TEST GATEWAY
                  </span>
                  <ChevronRight size={14} color="var(--zinc-muted)" />
                </div>
              </div>
              <ApiPlayground onPaymentSettled={fetchStats} />
            </div>

            <AuditTrail
              receipts={stats.receipts}
              onRefresh={fetchStats}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeView === "playground" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <ApiPlayground onPaymentSettled={fetchStats} />
            <AuditTrail
              receipts={stats.receipts}
              onRefresh={fetchStats}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeView === "audit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AuditTrail
              receipts={stats.receipts}
              onRefresh={fetchStats}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Global Footer */}
        <footer
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            color: "var(--zinc-muted)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={16} color="#ffffff" />
            <span>Sluice Protocol — Autonomous Financial Mission Control</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="neu-pill" style={{ fontSize: "0.7rem" }}>
              STYLE: MERIDIAN NEUMORPHISM v2.0
            </span>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              Arcscan Explorer
            </a>
          </div>
        </footer>
      </div>

      {/* Architecture & Documentation Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </main>
  );
}
