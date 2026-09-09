"use client";

import React, { useState } from "react";
import {
  Play,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Coins,
  FileCode2,
  ExternalLink,
  Wallet,
  Check,
  AlertCircle,
  Copy,
  Sparkles,
  Terminal as TerminalIcon,
} from "lucide-react";
import { ethers } from "ethers";
import { ARC_TESTNET_CONFIG, USAGE_VAULT_ABI } from "@/lib/arc";
import { connectBrowserWallet } from "@/lib/wallet";

interface ApiPlaygroundProps {
  onPaymentSettled: () => void;
  connectedWalletAddress?: string | null;
  onWalletConnect?: (address: string, balance: string) => void;
}

const PRESET_PAYLOADS = [
  {
    label: "Autonomous Inference",
    text: `Autonomous AI agents require machine-speed economic rails to purchase inference, compute, and specialized data feeds without human credit cards or monthly subscription agreements. Sluice bridges autonomous LLM workers and API publishers through native USDC settlement on the Arc Layer 1 network. By issuing standard HTTP 402 Payment Required challenges and settling directly into a multi-tenant UsageVault smart contract, every API call becomes provable, auditable, and self-clearing within sub-second finality.`,
  },
  {
    label: "DeFi Risk Synthesis",
    text: `Decentralized lending vaults often face cascading liquidations when oracle latency deviates during extreme market volatility. By implementing automated hedging pipelines governed by multi-agent consensus, automated keepers can execute rebalancing calls in sub-second intervals. Sluice enables these autonomous keepers to pay gas and service fees instantaneously in USDC on Arc without maintaining manual Stripe credits.`,
  },
  {
    label: "Smart Contract Audit",
    text: `The UsageVault contract adheres strictly to the Checks-Effects-Interactions pattern. When sellers execute withdraw(), the contract first checks available balance against the customized payout threshold, zeroes out the internal balance record, emits an immutable on-chain Withdrawn event, and only then forwards native USDC to the seller's address, mitigating all known reentrancy vectors.`,
  },
];

export default function ApiPlayground({
  onPaymentSettled,
  connectedWalletAddress,
  onWalletConnect,
}: ApiPlaygroundProps) {
  const [inputText, setInputText] = useState(PRESET_PAYLOADS[0].text);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [challengeData, setChallengeData] = useState<any | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "headers" | "curl">("result");
  const [isCopied, setIsCopied] = useState(false);

  // Local wallet state
  const [wallet, setWallet] = useState<{
    address: string | null;
    balance: string | null;
  }>({
    address: connectedWalletAddress || null,
    balance: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setWalletError(null);
    try {
      const res = await connectBrowserWallet();
      setWallet({ address: res.address, balance: res.balance });
      if (onWalletConnect) {
        onWalletConnect(res.address, res.balance);
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setWalletError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Step 1: Call API without payment proof (Triggers 402)
  const handleCallUnpaid = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setChallengeData(null);
    setPaymentProof(null);
    setAiResult(null);

    try {
      const res = await fetch("/api/gate/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      setResponseStatus(res.status);

      if (res.status === 402) {
        setChallengeData(data);
        setActiveStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Settle payment on Arc Testnet (MetaMask if connected or server relayer)
  const handleSettlePayment = async () => {
    setIsLoading(true);

    try {
      let txHash = "";

      // If user has browser wallet connected, execute real transaction from their MetaMask!
      if (wallet.address && typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const targetVault =
            challengeData?.destination?.usageVault ||
            process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS;
          const targetSeller =
            challengeData?.destination?.seller ||
            process.env.NEXT_PUBLIC_SELLER_ADDRESS;

          const vaultContract = new ethers.Contract(
            targetVault,
            USAGE_VAULT_ABI,
            signer
          );

          const valueWei = ethers.parseEther("0.05");
          console.log("[MetaMask Settle] Calling recordPayment on Arc Testnet...");
          const tx = await vaultContract.recordPayment(
            targetSeller,
            wallet.address,
            valueWei,
            "summarize/v1",
            { value: valueWei }
          );

          const receipt = await tx.wait(1);
          txHash = receipt.hash;
        } catch (metamaskErr: any) {
          console.warn(
            "MetaMask signing cancelled or failed, falling back to server relayer:",
            metamaskErr
          );
        }
      }

      // If not settled via MetaMask, settle via server relayer on Arc Testnet
      if (!txHash) {
        const res = await fetch("/api/gate/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: "0.05",
            endpoint: "POST /api/gate/summarize",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.proofToken) {
          throw new Error(data.error || "Payment settlement failed.");
        }
        txHash = data.proofToken;
      }

      setPaymentProof(txHash);
      setActiveStep(3);

      // Refresh seller dashboard and ledger
      onPaymentSettled();

      // Step 3: Automatically execute unlocked request with payment proof
      await handleCallPaid(txHash);
    } catch (err: any) {
      console.error(err);
      alert("Payment settlement failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Call API with verified payment proof (Unlocks 200 OK)
  const handleCallPaid = async (proof: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gate/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-402-Payment-Proof": proof,
          "X-Payer-Address": wallet.address || "0xCaller",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      setResponseStatus(res.status);
      if (res.ok && data.data) {
        setAiResult(data);
        onPaymentSettled();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (aiResult?.data?.summary) {
      navigator.clipboard.writeText(aiResult.data.summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const curlExample = `curl -X POST https://sluice.network/api/gate/summarize \\
  -H "Content-Type: application/json" \\
  ${paymentProof ? `-H "X-402-Payment-Proof: ${paymentProof}" \\\n  ` : ""}-d '{"text": "${inputText.replace(/\n/g, " ").slice(0, 80)}..."}'`;

  return (
    <div
      className="neu-panel"
      style={{
        padding: "2.25rem",
        position: "relative",
      }}
    >
      {/* Title & Wallet Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <div className="neu-pill">
              <Cpu size={12} color="#ffffff" />
              <span>GATED ENDPOINT SANDBOX</span>
            </div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              POST /api/gate/summarize
            </span>
          </div>
          <h2 className="text-heading" style={{ color: "#ffffff", fontSize: "1.35rem" }}>
            Interactive x402 Payment &amp; Execution Console
          </h2>
        </div>

        {/* Sandbox Wallet Connect Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {wallet.address ? (
            <div
              className="neu-pill"
              style={{
                padding: "0.5rem 1rem",
                background: "var(--neu-base-raised)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span className="beacon-dot" style={{ width: "6px", height: "6px" }} />
              <span style={{ color: "#ffffff", fontWeight: 600 }}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
              {wallet.balance && (
                <span style={{ color: "var(--zinc-muted)", marginLeft: "0.25rem" }}>
                  ({wallet.balance} USDC)
                </span>
              )}
              <button
                onClick={() => setWallet({ address: null, balance: null })}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--zinc-muted)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  marginLeft: "0.4rem",
                }}
                title="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-sandbox-wallet"
              onClick={handleConnectWallet}
              disabled={isConnectingWallet}
              className="neu-button-primary"
              style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
            >
              <Wallet size={15} />
              <span>{isConnectingWallet ? "Connecting..." : "Connect Web3 Wallet"}</span>
            </button>
          )}
        </div>
      </div>

      {walletError && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "var(--radius-pulse-sm)",
            background: "rgba(161, 161, 170, 0.12)",
            color: "#e4e4e7",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={14} />
          <span>{walletError}</span>
        </div>
      )}

      {/* Preset Payload Selector Pills */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.6rem",
            fontSize: "0.78rem",
            color: "var(--zinc-muted)",
          }}
        >
          <Sparkles size={13} color="#ffffff" />
          <span>Select an AI Agent Prompt Preset:</span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {PRESET_PAYLOADS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(p.text)}
              className="neu-button"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.75rem",
                background: inputText === p.text ? "var(--neu-base-raised)" : "var(--neu-base)",
                boxShadow: inputText === p.text ? "inset 2px 2px 6px rgba(0,0,0,0.6)" : undefined,
                color: inputText === p.text ? "#ffffff" : "var(--zinc-muted)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step Indicator Connector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          className="neu-pill"
          style={{
            color: activeStep >= 1 ? "#ffffff" : "var(--zinc-muted)",
            boxShadow: activeStep === 1 ? "0 0 14px rgba(255,255,255,0.25)" : undefined,
          }}
        >
          <span>1. Call (Unpaid)</span>
        </div>
        <ArrowRight size={13} color="var(--zinc-muted)" />
        <div
          className="neu-pill"
          style={{
            color: activeStep >= 2 ? "#ffffff" : "var(--zinc-muted)",
            boxShadow: activeStep === 2 ? "0 0 14px rgba(255,255,255,0.25)" : undefined,
          }}
        >
          <span>2. 402 Settlement</span>
        </div>
        <ArrowRight size={13} color="var(--zinc-muted)" />
        <div
          className="neu-pill"
          style={{
            color: activeStep >= 3 ? "#ffffff" : "var(--zinc-muted)",
            boxShadow: activeStep === 3 ? "0 0 14px rgba(255,255,255,0.25)" : undefined,
          }}
        >
          <span>3. Real AI Unlock</span>
        </div>
      </div>

      {/* Input Payload Well */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            fontSize: "0.8rem",
            color: "var(--zinc-muted)",
          }}
        >
          <span>Inbound Payload (Dispatched by Autonomous Agent):</span>
          <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
            {inputText.split(/\s+/).filter(Boolean).length} Words
          </span>
        </div>

        <div className="neu-well" style={{ padding: "0.75rem" }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
              fontFamily: "var(--font-ui)",
              fontSize: "0.92rem",
              lineHeight: 1.55,
              resize: "vertical",
            }}
            placeholder="Type text for the gated AI to analyze..."
          />
        </div>
      </div>

      {/* Action Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <button
          onClick={handleCallUnpaid}
          disabled={isLoading}
          className="neu-button"
          style={{ padding: "0.8rem 1.4rem", fontSize: "0.88rem" }}
        >
          <Play size={16} />
          <span>1. Call API (Unpaid $\to$ 402 Challenge)</span>
        </button>

        {challengeData && (
          <button
            onClick={handleSettlePayment}
            disabled={isLoading}
            className="neu-button-primary"
            style={{ padding: "0.8rem 1.6rem", fontSize: "0.9rem" }}
          >
            <Coins size={16} />
            <span>
              {wallet.address
                ? `2. Pay 0.05 USDC with MetaMask (${wallet.address.slice(0, 6)}...)`
                : "2. Settle 0.05 USDC on Arc & Unlock"}
            </span>
          </button>
        )}

        {responseStatus && (
          <div
            className="neu-pill"
            style={{
              padding: "0.5rem 1.1rem",
              background:
                responseStatus === 200
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(161, 161, 170, 0.12)",
              color: "#ffffff",
              boxShadow:
                responseStatus === 200
                  ? "0 0 16px rgba(255, 255, 255, 0.3)"
                  : undefined,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: responseStatus === 200 ? "#ffffff" : "#e4e4e7",
              }}
            >
              HTTP {responseStatus}
            </span>
            <span>
              {responseStatus === 402
                ? "Payment Required"
                : responseStatus === 200
                ? "Cryptographically Verified & Unlocked"
                : "Response"}
            </span>
          </div>
        )}
      </div>

      {/* Output Terminal Console */}
      {(challengeData || aiResult) && (
        <div
          className="neu-well"
          style={{
            padding: "1.5rem",
            position: "relative",
          }}
        >
          {/* Sub-tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              paddingBottom: "0.75rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("result")}
                className="neu-button"
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.75rem",
                  background:
                    activeTab === "result" ? "var(--neu-base-raised)" : "transparent",
                }}
              >
                Inference Result
              </button>
              <button
                onClick={() => setActiveTab("headers")}
                className="neu-button"
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.75rem",
                  background:
                    activeTab === "headers" ? "var(--neu-base-raised)" : "transparent",
                }}
              >
                x402 Headers
              </button>
              <button
                onClick={() => setActiveTab("curl")}
                className="neu-button"
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.75rem",
                  background:
                    activeTab === "curl" ? "var(--neu-base-raised)" : "transparent",
                }}
              >
                cURL CLI
              </button>
            </div>

            {aiResult && (
              <button
                onClick={handleCopyResult}
                className="neu-button"
                style={{ padding: "0.3rem 0.7rem", fontSize: "0.72rem" }}
              >
                {isCopied ? <Check size={12} color="#ffffff" /> : <Copy size={12} />}
                <span>{isCopied ? "Copied!" : "Copy Summary"}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Result */}
          {activeTab === "result" && (
            <div>
              {responseStatus === 402 && challengeData && !aiResult && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#e4e4e7",
                      marginBottom: "0.85rem",
                      fontSize: "0.92rem",
                    }}
                  >
                    <AlertTriangle size={17} color="#ffffff" />
                    <strong>Gateway Challenge: 0.05 USDC Payment Required on Arc</strong>
                  </div>
                  <pre
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "#d4d4d8",
                      overflowX: "auto",
                      lineHeight: 1.45,
                    }}
                  >
                    {JSON.stringify(challengeData, null, 2)}
                  </pre>
                </div>
              )}

              {aiResult && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.25rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#ffffff",
                      }}
                    >
                      <CheckCircle2 size={19} color="#ffffff" />
                      <strong style={{ fontSize: "1.05rem" }}>
                        Unlocked Neural AI Inference Output
                      </strong>
                    </div>

                    <a
                      href={aiResult.onChainReceipt?.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-pill"
                      style={{ textDecoration: "none", color: "#ffffff" }}
                    >
                      <span>Arcscan Tx: {aiResult.onChainReceipt?.txHash.slice(0, 10)}...</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Summary Box */}
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "var(--radius-pulse-sm)",
                      background: "rgba(255, 255, 255, 0.03)",
                      marginBottom: "1.25rem",
                      boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.5rem" }}>
                      Executive Summary (via Gemini 3.6 Flash)
                    </div>
                    <p className="card-description text-body" style={{ color: "#ffffff", fontSize: "1.02rem", lineHeight: 1.6 }}>
                      {aiResult.data?.summary}
                    </p>
                  </div>

                  {/* Insights Bullet Points */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.6rem" }}>
                      Key Semantic Insights
                    </div>
                    <ul style={{ paddingLeft: "1.25rem", color: "#d4d4d8", fontSize: "0.88rem", lineHeight: 1.65 }}>
                      {aiResult.data?.insights?.map((ins: string, i: number) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics Badge Row */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <div className="neu-pill">
                      <span>Original: {aiResult.data?.metrics?.originalWords} words</span>
                    </div>
                    <div className="neu-pill">
                      <span>Condensed: {aiResult.data?.metrics?.summaryWords} words</span>
                    </div>
                    <div className="neu-pill">
                      <span>Ratio: {aiResult.data?.metrics?.compressionRatio}</span>
                    </div>
                    <div className="neu-pill">
                      <span>Sentiment: {aiResult.data?.metrics?.sentiment}</span>
                    </div>
                    <div className="neu-pill">
                      <span>Latency: {aiResult.data?.latencyMs}ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Headers */}
          {activeTab === "headers" && (
            <pre
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#d4d4d8",
                overflowX: "auto",
                lineHeight: 1.5,
              }}
            >
{`HTTP/1.1 ${responseStatus || 402}
Content-Type: application/json
WWW-Authenticate: x402 realm="Sluice", chainId="${ARC_TESTNET_CONFIG.chainId}", price="0.05", token="USDC"
X-402-Price: 0.05
X-402-Currency: USDC
X-402-Network: Arc Testnet
${paymentProof ? `X-Usage-Receipt-Tx: ${paymentProof}\nX-Settlement-Status: CONFIRMED` : "X-402-Status: PAYMENT_REQUIRED"}`}
            </pre>
          )}

          {/* Tab 3: cURL */}
          {activeTab === "curl" && (
            <div>
              <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.5rem" }}>
                Machine-to-Machine cURL for Autonomous AI Agents
              </div>
              <pre
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "#d4d4d8",
                  overflowX: "auto",
                  padding: "0.75rem",
                  background: "var(--ink)",
                  borderRadius: "8px",
                  lineHeight: 1.4,
                }}
              >
                {curlExample}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
