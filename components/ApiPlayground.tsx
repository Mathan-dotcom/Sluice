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
} from "lucide-react";
import { ARC_TESTNET_CONFIG } from "@/lib/arc";

interface ApiPlaygroundProps {
  onPaymentSettled: () => void;
}

const SAMPLE_TEXT = `Autonomous AI agents require machine-speed economic rails to purchase inference, compute, and specialized data feeds without human credit cards or monthly subscription agreements. Sluice bridges autonomous LLM workers and API publishers through native USDC settlement on the Arc Layer 1 network. By issuing standard HTTP 402 Payment Required challenges and settling directly into a multi-tenant UsageVault smart contract, every API call becomes provable, auditable, and self-clearing within sub-second finality.`;

export default function ApiPlayground({ onPaymentSettled }: ApiPlaygroundProps) {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [challengeData, setChallengeData] = useState<any | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "headers" | "curl">("result");

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

  // Step 2: Settle payment on Arc Testnet
  const handleSettlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gate/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: "0.05",
          endpoint: "POST /api/gate/summarize",
        }),
      });

      const data = await res.json();
      if (res.ok && data.proofToken) {
        setPaymentProof(data.proofToken);
        setActiveStep(3);

        // Notify parent to refresh seller balance and audit trail
        onPaymentSettled();

        // Step 3: Automatically execute unlocked request with payment proof
        await handleCallPaid(data.proofToken);
      }
    } catch (err) {
      console.error(err);
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
          "X-Payer-Address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
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

  const curlExample = `curl -X POST https://sluice.network/api/gate/summarize \\
  -H "Content-Type: application/json" \\
  ${paymentProof ? `-H "X-402-Payment-Proof: ${paymentProof}" \\\n  ` : ""}-d '{"text": "${inputText.replace(/\n/g, " ").slice(0, 80)}..."}'`;

  return (
    <div
      className="neu-panel"
      style={{
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Title & Flow Badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <div className="neu-pill">
              <Cpu size={12} color="#ffffff" />
              <span>GATED ENDPOINT PLAYGROUND</span>
            </div>
            <span className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              POST /api/gate/summarize
            </span>
          </div>
          <h2 className="text-heading" style={{ color: "#ffffff" }}>
            Interactive x402 Payment & Execution Demo
          </h2>
        </div>

        {/* Step Indicator Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            className="neu-pill"
            style={{
              color: activeStep >= 1 ? "#ffffff" : "var(--zinc-muted)",
              boxShadow: activeStep === 1 ? "0 0 12px rgba(255,255,255,0.2)" : undefined,
            }}
          >
            <span>1. Call (Unpaid)</span>
          </div>
          <ArrowRight size={12} color="var(--zinc-muted)" />
          <div
            className="neu-pill"
            style={{
              color: activeStep >= 2 ? "#ffffff" : "var(--zinc-muted)",
              boxShadow: activeStep === 2 ? "0 0 12px rgba(255,255,255,0.2)" : undefined,
            }}
          >
            <span>2. 402 Settlement</span>
          </div>
          <ArrowRight size={12} color="var(--zinc-muted)" />
          <div
            className="neu-pill"
            style={{
              color: activeStep === 3 ? "#ffffff" : "var(--zinc-muted)",
              boxShadow: activeStep === 3 ? "0 0 12px rgba(255,255,255,0.2)" : undefined,
            }}
          >
            <span>3. AI Unlock</span>
          </div>
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
          <span>Input Text Payload (Sent by Caller / AI Agent):</span>
          <button
            onClick={() => setInputText(SAMPLE_TEXT)}
            className="neu-button"
            style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
          >
            Reset Sample
          </button>
        </div>

        <div className="neu-well" style={{ padding: "0.5rem" }}>
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
              fontSize: "0.88rem",
              lineHeight: 1.5,
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
          style={{ padding: "0.75rem 1.25rem" }}
        >
          <Play size={16} />
          <span>Call API (Unpaid $\to$ 402 Challenge)</span>
        </button>

        {challengeData && (
          <button
            onClick={handleSettlePayment}
            disabled={isLoading}
            className="neu-button-primary"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            <Coins size={16} />
            <span>Settle 0.05 USDC on Arc & Unlock</span>
          </button>
        )}

        {responseStatus && (
          <div
            className="neu-pill"
            style={{
              padding: "0.45rem 1rem",
              background:
                responseStatus === 200
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(161, 161, 170, 0.12)",
              color: "#ffffff",
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
                ? "Payment Verified & Executed"
                : "Response"}
            </span>
          </div>
        )}
      </div>

      {/* Output Console */}
      {(challengeData || aiResult) && (
        <div
          className="neu-well"
          style={{
            padding: "1.25rem",
            position: "relative",
          }}
        >
          {/* Sub-tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              paddingBottom: "0.75rem",
            }}
          >
            <button
              onClick={() => setActiveTab("result")}
              className="neu-button"
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.75rem",
                background:
                  activeTab === "result" ? "var(--neu-base-raised)" : "transparent",
              }}
            >
              Response Payload
            </button>
            <button
              onClick={() => setActiveTab("headers")}
              className="neu-button"
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.75rem",
                background:
                  activeTab === "headers" ? "var(--neu-base-raised)" : "transparent",
              }}
            >
              x402 Protocol Headers
            </button>
            <button
              onClick={() => setActiveTab("curl")}
              className="neu-button"
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.75rem",
                background:
                  activeTab === "curl" ? "var(--neu-base-raised)" : "transparent",
              }}
            >
              cURL CLI
            </button>
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
                      marginBottom: "0.75rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <AlertTriangle size={16} />
                    <strong>Gateway Challenge: Payment of 0.05 USDC Required</strong>
                  </div>
                  <pre
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      color: "#d4d4d8",
                      overflowX: "auto",
                      lineHeight: 1.4,
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
                      marginBottom: "1rem",
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
                      <CheckCircle2 size={18} />
                      <strong>Unlocked AI Analysis Output</strong>
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
                      padding: "1rem",
                      borderRadius: "var(--radius-pulse-sm)",
                      background: "rgba(255, 255, 255, 0.02)",
                      marginBottom: "1rem",
                    }}
                  >
                    <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.4rem" }}>
                      Executive Neural Summary
                    </div>
                    <p className="card-description text-body" style={{ color: "#ffffff", fontSize: "0.95rem" }}>
                      {aiResult.data?.summary}
                    </p>
                  </div>

                  {/* Insights Bullet Points */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div className="text-micro" style={{ color: "var(--zinc-muted)", marginBottom: "0.5rem" }}>
                      Key Semantic Insights
                    </div>
                    <ul style={{ paddingLeft: "1.25rem", color: "#d4d4d8", fontSize: "0.85rem", lineHeight: 1.6 }}>
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
                      fontSize: "0.75rem",
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
                fontSize: "0.78rem",
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
                  fontSize: "0.78rem",
                  color: "#d4d4d8",
                  overflowX: "auto",
                  padding: "0.5rem",
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
