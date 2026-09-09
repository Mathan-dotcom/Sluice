"use client";

import React from "react";
import { ExternalLink, Terminal, ShieldCheck, RefreshCw } from "lucide-react";
import { UsageReceipt, ARC_TESTNET_CONFIG } from "@/lib/arc";

interface AuditTrailProps {
  receipts: UsageReceipt[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AuditTrail({
  receipts,
  onRefresh,
  isLoading,
}: AuditTrailProps) {
  return (
    <div
      className="neu-panel"
      style={{
        padding: "1.75rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-pulse-sm)",
              background: "var(--neu-base-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "3px 3px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)",
            }}
          >
            <Terminal size={18} color="#ffffff" />
          </div>
          <div>
            <h3 className="text-heading" style={{ color: "#ffffff" }}>
              Immutable Usage Ledger
            </h3>
            <p className="text-micro" style={{ color: "var(--zinc-muted)" }}>
              Direct on-chain events from UsageVault.sol (Arc Testnet)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="neu-pill">
            <span className="beacon-dot" />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ffffff" }}>
              ARC SYNC: ACTIVE
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="neu-button"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
              title="Refresh ledger"
              disabled={isLoading}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: isLoading ? "spin 1s linear infinite" : "none",
                }}
              />
              Sync
            </button>
          )}
        </div>
      </div>

      {/* Recessed Terminal Well */}
      <div
        className="neu-well"
        style={{
          maxHeight: "380px",
          overflowY: "auto",
          padding: "0.75rem",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 2fr 1fr 1fr",
            padding: "0.5rem 0.75rem",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--zinc-muted)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          <div>Timestamp</div>
          <div>Block</div>
          <div>Tx Hash (Arcscan)</div>
          <div>Caller / Payer</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>

        {receipts.length === 0 ? (
          <div
            style={{
              padding: "2.5rem 1rem",
              textAlign: "center",
              color: "var(--zinc-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
            }}
          >
            No transactions recorded yet. Call the gated API to stream on-chain receipts.
          </div>
        ) : (
          receipts.map((rcpt, index) => {
            const date = new Date(rcpt.timestamp);
            const timeFormatted = date.toLocaleTimeString([], {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={rcpt.id || rcpt.txHash + index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 2fr 1fr 1fr",
                  alignItems: "center",
                  padding: "0.65rem 0.75rem",
                  fontSize: "0.78rem",
                  borderRadius: "8px",
                  background:
                    index % 2 === 0
                      ? "rgba(255, 255, 255, 0.015)"
                      : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ color: "var(--zinc-muted)" }}>
                  {timeFormatted}
                </div>

                <div style={{ color: "#d4d4d8" }}>
                  #{rcpt.blockNumber}
                </div>

                <div>
                  <a
                    href={`${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${rcpt.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                    title={rcpt.txHash}
                  >
                    <span>
                      {rcpt.txHash.slice(0, 10)}...{rcpt.txHash.slice(-8)}
                    </span>
                    <ExternalLink size={11} color="var(--zinc-muted)" />
                  </a>
                </div>

                <div
                  style={{
                    color: "#a1a1aa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={rcpt.payer}
                >
                  {rcpt.payer.slice(0, 8)}...{rcpt.payer.slice(-4)}
                </div>

                <div
                  style={{
                    textAlign: "right",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  +{rcpt.amount} {rcpt.token}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--zinc-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ShieldCheck size={14} color="#ffffff" />
          <span>Verifiable on-chain accounting without private database lock-in</span>
        </div>
        <div>
          Showing {receipts.length} recent events
        </div>
      </div>
    </div>
  );
}
