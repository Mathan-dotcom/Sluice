"use client";

import React from "react";
import { X, Network, BookOpen, ExternalLink, ShieldAlert, Cpu } from "lucide-react";
import { ARC_TESTNET_CONFIG, DEFAULT_USAGE_VAULT_ADDRESS } from "@/lib/arc";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureModal({
  isOpen,
  onClose,
}: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(12, 12, 14, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        className="neu-panel-raised"
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="neu-button"
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            padding: "0.5rem",
            borderRadius: "50%",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="neu-pill" style={{ marginBottom: "0.5rem" }}>
            <Network size={12} color="#ffffff" />
            <span>SYSTEM ARCHITECTURE & SPECIFICATION</span>
          </div>
          <h2 className="text-heading" style={{ fontSize: "1.75rem", color: "#ffffff" }}>
            Sluice: Pay-Per-Call API Gateway on Arc
          </h2>
          <p className="text-body" style={{ color: "var(--zinc-muted)", marginTop: "0.25rem" }}>
            Track: Launch on Arc Testnet & Push to Mainnet (ETHOnline 2026)
          </p>
        </div>

        {/* ASCII Flow Diagram */}
        <div className="neu-well" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div className="text-micro" style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
            End-to-End System Topology
          </div>
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "#e4e4e7",
              overflowX: "auto",
              lineHeight: 1.4,
            }}
          >
{`[Caller / Autonomous AI Agent]
         │
         ▼  (1) POST /api/gate/summarize (No payment attached)
┌────────────────────────────────────────────────────────────────────────┐
│                        Sluice Gateway Engine                           │
│  • Emits HTTP 402 Payment Required + USDC challenge parameters         │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (2) Signs & transmits 0.05 USDC settlement via Arc
┌────────────────────────────────────────────────────────────────────────┐
│                 UsageVault.sol (Arc Testnet #5042002)                  │
│  • function recordPayment(seller, payer, amount, callTag)              │
│  • Multi-tenant seller accounting & configurable payout rules          │
│  • Emits immutable on-chain event: UsageRecorded()                     │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (3) Gateway verifies tx receipt & invokes underlying API
┌────────────────────────────────────────────────────────────────────────┐
│                   Underlying Gated AI Microservice                     │
│  • Executes high-performance text synthesis & insight extraction       │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (4) Unlocked payload returned to Caller + Explorer Proof Receipt
┌────────────────────────────────────────────────────────────────────────┐
│               Meridian Mission Control (Seller Dashboard)              │
│  • Reads verified on-chain receipts & triggers threshold payouts       │
└────────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* 3 Information Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="neu-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Cpu size={16} color="#ffffff" />
              <strong style={{ fontSize: "0.9rem", color: "#ffffff" }}>Arc L1 Specifics</strong>
            </div>
            <p className="card-description text-body" style={{ fontSize: "0.8rem", color: "#d4d4d8" }}>
              Arc uses USDC as its native gas currency. With sub-second block times and minimal fees, micro-transactions become viable for machine-to-machine AI API calls.
            </p>
          </div>

          <div className="neu-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <BookOpen size={16} color="#ffffff" />
              <strong style={{ fontSize: "0.9rem", color: "#ffffff" }}>On-Chain Usage Vault</strong>
            </div>
            <p className="card-description text-body" style={{ fontSize: "0.8rem", color: "#d4d4d8" }}>
              Unlike existing API meters locked in private AWS RDS databases, Sluice creates an immutable ledger of all calls on Arc. Revenue and usage are verifiable by both seller and buyer.
            </p>
          </div>

          <div className="neu-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <ShieldAlert size={16} color="#ffffff" />
              <strong style={{ fontSize: "0.9rem", color: "#ffffff" }}>Mainnet Deployment</strong>
            </div>
            <p className="card-description text-body" style={{ fontSize: "0.8rem", color: "#d4d4d8" }}>
              UsageVault.sol is written in standard Solidity 0.8.20 and compatible with Foundry and Hardhat. Ready to deploy to Arc Mainnet with <code>npx hardhat run scripts/deploy.js --network arcMainnet</code>.
            </p>
          </div>
        </div>

        {/* Contract Reference */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1rem",
            borderRadius: "var(--radius-pulse-sm)",
            background: "var(--neu-base)",
          }}
        >
          <div>
            <div className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              DEPLOYED VAULT CONTRACT
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#ffffff" }}>
              {DEFAULT_USAGE_VAULT_ADDRESS}
            </div>
          </div>
          <a
            href={`${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${DEFAULT_USAGE_VAULT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-button"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
          >
            <span>View on Arcscan</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
