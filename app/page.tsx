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
  Wallet,
  Home as HomeIcon,
} from "lucide-react";
import SluiceFlow from "@/components/SluiceFlow";
import LandingView from "@/components/LandingView";
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
import { connectBrowserWallet } from "@/lib/wallet";

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
    balance: "0.00",
    currency: "USDC",
    withdrawThreshold: "0.50",
    canWithdraw: false,
    totalCalls: 0,
    totalVolume: "0.00",
    sellerAddress: DEFAULT_SELLER_ADDRESS,
    vaultAddress: DEFAULT_USAGE_VAULT_ADDRESS,
    receipts: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  
  // Navigation view: "landing" (default) or "sandbox"
  const [currentView, setCurrentView] = useState<"landing" | "sandbox">("landing");
  
  // Sandbox sub-view: "control" | "playground" | "audit"
  const [sandboxTab, setSandboxTab] = useState<"control" | "playground" | "audit">("control");

  // Global wallet connection state
  const [wallet, setWallet] = useState<{
    address: string | null;
    balance: string | null;
  }>({
    address: null,
    balance: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

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

  const handleGlobalWalletConnect = async () => {
    setIsConnectingWallet(true);
    try {
      const res = await connectBrowserWallet();
      setWallet({ address: res.address, balance: res.balance });
    } catch (err: any) {
      console.warn("Wallet connect notice:", err?.message || err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 12000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--ink)",
        paddingBottom: "4rem",
      }}
    >
      {/* Hydrodynamic Sluice Stream Flow Wallpaper */}
      <SluiceFlow />

      {/* Interactive Ambient Radial Spotlight */}
      <div
        className="ambient-spotlight"
        style={
          {
            "--mouse-x": mousePos.x,
            "--mouse-y": mousePos.y,
          } as React.CSSProperties
        }
      />

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
            <div
              onClick={() => setCurrentView("landing")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
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

          {/* Primary View Switcher Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setCurrentView("landing")}
              className={currentView === "landing" ? "neu-button-primary" : "neu-button"}
              style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}
            >
              <HomeIcon size={14} />
              <span>Overview</span>
            </button>

            <button
              id="nav-btn-sandbox"
              onClick={() => setCurrentView("sandbox")}
              className={currentView === "sandbox" ? "neu-button-primary" : "neu-button"}
              style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}
            >
              <Cpu size={14} />
              <span>Sandbox & Mission Control</span>
            </button>
          </div>

          {/* Action Navigation & Wallet Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              id="btn-architecture"
              onClick={() => setIsArchModalOpen(true)}
              className="neu-button"
              style={{ padding: "0.55rem 1rem", fontSize: "0.8rem" }}
            >
              <BookOpen size={14} />
              <span>Specs</span>
            </button>

            {wallet.address ? (
              <div
                className="neu-pill"
                style={{
                  padding: "0.5rem 0.85rem",
                  background: "var(--neu-base-raised)",
                }}
              >
                <Wallet size={12} color="#ffffff" />
                <span style={{ color: "#ffffff", fontWeight: 600 }}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                {wallet.balance && (
                  <span style={{ color: "var(--zinc-muted)" }}>
                    {wallet.balance} USDC
                  </span>
                )}
              </div>
            ) : (
              <button
                id="btn-connect-topbar"
                onClick={handleGlobalWalletConnect}
                disabled={isConnectingWallet}
                className="neu-button-primary"
                style={{ padding: "0.55rem 1rem", fontSize: "0.8rem" }}
              >
                <Wallet size={14} />
                <span>{isConnectingWallet ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </header>

        {/* --- VIEW 1: LANDING PAGE --- */}
        {currentView === "landing" && (
          <LandingView
            onEnterSandbox={() => setCurrentView("sandbox")}
            onOpenArchitecture={() => setIsArchModalOpen(true)}
            totalCalls={stats.totalCalls}
            totalVolume={stats.totalVolume}
          />
        )}

        {/* --- VIEW 2: SANDBOX & MISSION CONTROL --- */}
        {currentView === "sandbox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Breadcrumb / Section Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span
                    onClick={() => setCurrentView("landing")}
                    style={{
                      color: "var(--zinc-muted)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Sluice
                  </span>
                  <ChevronRight size={12} color="var(--zinc-muted)" />
                  <span className="text-micro" style={{ color: "#ffffff" }}>
                    SANDBOX & MISSION CONTROL
                  </span>
                </div>
                <h1 className="text-display-md" style={{ color: "#ffffff" }}>
                  Autonomous Financial Mission Control
                </h1>
              </div>

              {/* View Switcher Tabs */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setSandboxTab("control")}
                  className={sandboxTab === "control" ? "neu-button-primary" : "neu-button"}
                  style={{ padding: "0.5rem 1.1rem", fontSize: "0.8rem" }}
                >
                  <Layers size={14} />
                  <span>Treasury Vault</span>
                </button>

                <button
                  onClick={() => setSandboxTab("playground")}
                  className={sandboxTab === "playground" ? "neu-button-primary" : "neu-button"}
                  style={{ padding: "0.5rem 1.1rem", fontSize: "0.8rem" }}
                >
                  <Cpu size={14} />
                  <span>402 Sandbox</span>
                </button>

                <button
                  onClick={() => setSandboxTab("audit")}
                  className={sandboxTab === "audit" ? "neu-button-primary" : "neu-button"}
                  style={{ padding: "0.5rem 1.1rem", fontSize: "0.8rem" }}
                >
                  <Terminal size={14} />
                  <span>Ledger ({stats.receipts.length})</span>
                </button>
              </div>
            </div>

            {/* Sandbox Tab Content */}
            {sandboxTab === "control" && (
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
                        INTERACTIVE ENDPOINT SANDBOX
                      </span>
                      <ChevronRight size={14} color="var(--zinc-muted)" />
                    </div>
                  </div>
                  <ApiPlayground
                    onPaymentSettled={fetchStats}
                    connectedWalletAddress={wallet.address}
                    onWalletConnect={(addr, bal) => setWallet({ address: addr, balance: bal })}
                  />
                </div>

                <AuditTrail
                  receipts={stats.receipts}
                  onRefresh={fetchStats}
                  isLoading={isLoading}
                />
              </div>
            )}

            {sandboxTab === "playground" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <ApiPlayground
                  onPaymentSettled={fetchStats}
                  connectedWalletAddress={wallet.address}
                  onWalletConnect={(addr, bal) => setWallet({ address: addr, balance: bal })}
                />
                <AuditTrail
                  receipts={stats.receipts}
                  onRefresh={fetchStats}
                  isLoading={isLoading}
                />
              </div>
            )}

            {sandboxTab === "audit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <AuditTrail
                  receipts={stats.receipts}
                  onRefresh={fetchStats}
                  isLoading={isLoading}
                />
              </div>
            )}
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
