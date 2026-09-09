"use client";

import React from "react";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  Coins,
  Terminal,
  BookOpen,
  Lock,
  Layers,
  ExternalLink,
} from "lucide-react";
import { ARC_TESTNET_CONFIG, DEFAULT_USAGE_VAULT_ADDRESS } from "@/lib/arc";

interface LandingViewProps {
  onEnterSandbox: () => void;
  onOpenArchitecture: () => void;
  totalCalls: number;
  totalVolume: string;
}

export default function LandingView({
  onEnterSandbox,
  onOpenArchitecture,
  totalCalls,
  totalVolume,
}: LandingViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          paddingTop: "2rem",
          paddingBottom: "1.5rem",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        {/* Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="neu-pill">
            <span className="beacon-dot" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              LIVE ON ARC TESTNET #{ARC_TESTNET_CONFIG.chainId}
            </span>
          </div>
          <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
            ETHOnline 2026 Submission
          </span>
        </div>

        {/* Hero Title in Fraunces Serif */}
        <h1
          className="text-display-xl"
          style={{
            color: "#ffffff",
            marginBottom: "1.5rem",
            letterSpacing: "-0.03em",
            maxWidth: "920px",
          }}
        >
          The Pay-Per-Call Liquidity Rail for Autonomous Machines
        </h1>

        {/* Subtitle */}
        <p
          className="text-body card-description"
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.65,
            color: "#a1a1aa",
            maxWidth: "760px",
            marginBottom: "2.25rem",
          }}
        >
          Monetize any API with sub-second machine payments in native USDC settled on Arc. No subscriptions, no human signups, and no private database lock-in. Just standard HTTP 402 and an immutable on-chain <strong>UsageVault</strong>.
        </p>

        {/* Action CTAs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <button
            id="btn-launch-sandbox-hero"
            onClick={onEnterSandbox}
            className="neu-button-primary"
            style={{ padding: "0.95rem 2rem", fontSize: "1rem" }}
          >
            <span>Launch Mission Control & Sandbox</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onOpenArchitecture}
            className="neu-button"
            style={{ padding: "0.95rem 1.75rem", fontSize: "0.95rem" }}
          >
            <BookOpen size={16} />
            <span>Architecture & Track Docs</span>
          </button>
        </div>

        {/* Live Network Metrics Ribbon */}
        <div
          className="neu-well"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "1.25rem",
            width: "100%",
            maxWidth: "860px",
            padding: "1.25rem 1.75rem",
            textAlign: "left",
          }}
        >
          <div>
            <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.25rem" }}>
              SETTLEMENT NETWORK
            </div>
            <div className="text-data" style={{ color: "#ffffff", fontWeight: 600 }}>
              Arc Testnet (L1)
            </div>
          </div>

          <div>
            <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.25rem" }}>
              GAS & PAYMENT TOKEN
            </div>
            <div className="text-data" style={{ color: "#ffffff", fontWeight: 600 }}>
              Native USDC
            </div>
          </div>

          <div>
            <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.25rem" }}>
              LIVE SETTLED CALLS
            </div>
            <div className="text-data" style={{ color: "#ffffff", fontWeight: 600 }}>
              {totalCalls} Calls Verified
            </div>
          </div>

          <div>
            <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.25rem" }}>
              LIVE VOLUME
            </div>
            <div className="text-data" style={{ color: "#ffffff", fontWeight: 600 }}>
              {totalVolume} USDC
            </div>
          </div>
        </div>
      </section>

      {/* The Sluice 3-Step Lifecycle Pipeline */}
      <section>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="neu-pill" style={{ marginBottom: "0.5rem" }}>
            <Layers size={13} color="#ffffff" />
            <span>SYSTEM EXECUTION PROTOCOL</span>
          </div>
          <h2 className="text-display-md" style={{ color: "#ffffff" }}>
            How Pay-Per-Call Works on Arc
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Step 1 */}
          <div className="neu-panel card-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--neu-base-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "3px 3px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                }}
              >
                <Lock size={18} color="#ffffff" />
              </div>
              <span className="text-data" style={{ color: "var(--zinc-muted)", fontSize: "1.25rem", fontWeight: 600 }}>
                01
              </span>
            </div>
            <h3 className="text-heading" style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
              1. HTTP 402 Challenge
            </h3>
            <p className="card-description text-body" style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
              An AI agent or caller hits the endpoint unpaid. The Sluice Gateway intercepts the request and responds with standard HTTP 402 containing price in USDC, target vault address, and settlement nonce.
            </p>
          </div>

          {/* Step 2 */}
          <div className="neu-panel card-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--neu-base-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "3px 3px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                }}
              >
                <Coins size={18} color="#ffffff" />
              </div>
              <span className="text-data" style={{ color: "var(--zinc-muted)", fontSize: "1.25rem", fontWeight: 600 }}>
                02
              </span>
            </div>
            <h3 className="text-heading" style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
              2. Arc Vault Settlement
            </h3>
            <p className="card-description text-body" style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
              The caller signs and transmits 0.05 USDC to <code>UsageVault.sol</code> on Arc. An immutable on-chain <code>UsageRecorded</code> event is logged, and the seller’s verifiable balance increments instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="neu-panel card-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--neu-base-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "3px 3px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
                }}
              >
                <Cpu size={18} color="#ffffff" />
              </div>
              <span className="text-data" style={{ color: "var(--zinc-muted)", fontSize: "1.25rem", fontWeight: 600 }}>
                03
              </span>
            </div>
            <h3 className="text-heading" style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
              3. Unlocked Neural Compute
            </h3>
            <p className="card-description text-body" style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
              The gateway verifies the transaction receipt on Arc, executes the requested AI summarization workload via Gemini, and returns the unlocked response accompanied by on-chain cryptographic proof.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Subscriptions vs Sluice */}
      <section
        className="neu-panel"
        style={{
          padding: "2.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        <div>
          <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.5rem" }}>
            TRADITIONAL INFRASTRUCTURE
          </div>
          <h3 className="text-heading" style={{ color: "#e4e4e7", marginBottom: "1rem" }}>
            Subscription & Card Gateways
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              <span style={{ color: "#71717a" }}>✕</span>
              <span>Requires humans to sign up, enter credit cards, and manage billing.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              <span style={{ color: "#71717a" }}>✕</span>
              <span>Usage logs are trapped in private databases that clients cannot verify.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              <span style={{ color: "#71717a" }}>✕</span>
              <span>Incompatible with autonomous AI agents needing one-off programmatic queries.</span>
            </li>
          </ul>
        </div>

        <div
          style={{
            borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
            paddingLeft: "2rem",
          }}
        >
          <div className="text-micro" style={{ color: "#ffffff", marginBottom: "0.5rem" }}>
            THE SLUICE PROTOCOL
          </div>
          <h3 className="text-heading" style={{ color: "#ffffff", marginBottom: "1rem" }}>
            Autonomous Arc Micropayments
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#ffffff" }}>
              <ShieldCheck size={16} color="#ffffff" />
              <span>Machine-payable in USDC via native sub-second Arc gas transactions.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#ffffff" }}>
              <ShieldCheck size={16} color="#ffffff" />
              <span>Every call emits an on-chain event on <code>UsageVault.sol</code> verifiable on Arcscan.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#ffffff" }}>
              <ShieldCheck size={16} color="#ffffff" />
              <span>Zero-sign-up, machine-to-machine, pay-per-call execution for next-gen agents.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Code Integration Callout */}
      <section className="neu-panel" style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              MACHINE CLIENT INTEGRATION
            </span>
            <h3 className="text-heading" style={{ color: "#ffffff" }}>
              Calling Sluice from Any Autonomous Agent
            </h3>
          </div>
          <button
            onClick={onEnterSandbox}
            className="neu-button-primary"
            style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
          >
            <span>Test Live in Sandbox</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="neu-well" style={{ padding: "1rem" }}>
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              color: "#e4e4e7",
              lineHeight: 1.5,
              overflowX: "auto",
            }}
          >
{`import requests

# 1. Hit the gated endpoint — receives 402 challenge
res = requests.post("https://sluice.network/api/gate/summarize", json={"text": "..."})

if res.status_code == 402:
    challenge = res.json()
    # 2. Agent signs and broadcasts 0.05 USDC settlement to UsageVault on Arc
    tx_hash = agent_wallet.transact(to=challenge["destination"]["usageVault"], value=0.05)
    
    # 3. Re-call with transaction proof to receive unlocked AI result
    unlocked = requests.post(
        "https://sluice.network/api/gate/summarize",
        headers={"X-402-Payment-Proof": tx_hash},
        json={"text": "..."}
    )
    print("Insight:", unlocked.json()["data"]["summary"])`}
          </pre>
        </div>
      </section>

      {/* Final Landing CTA */}
      <section
        style={{
          textAlign: "center",
          padding: "2rem 0",
        }}
      >
        <h2 className="text-display-md" style={{ color: "#ffffff", marginBottom: "1rem" }}>
          Explore the Mission Control & Live Sandbox
        </h2>
        <p className="text-body" style={{ color: "var(--zinc-muted)", maxWidth: "600px", margin: "0 auto 1.5rem" }}>
          Connect your Web3 wallet, test the interactive 402 challenge, settle live micropayments on Arc Testnet, and trigger seller treasury withdrawals.
        </p>
        <button
          onClick={onEnterSandbox}
          className="neu-button-primary"
          style={{ padding: "1rem 2.5rem", fontSize: "1.05rem" }}
        >
          <span>Enter Sandbox & Mission Control</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
