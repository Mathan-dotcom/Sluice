import { NextRequest, NextResponse } from "next/server";
import { processSummarization } from "@/lib/aiEngine";
import {
  ARC_TESTNET_CONFIG,
  DEFAULT_SELLER_ADDRESS,
  DEFAULT_USAGE_VAULT_ADDRESS,
  addReceipt,
  verifyTransactionOnArc,
} from "@/lib/arc";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, mode } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Bad Request: 'text' field is required in JSON payload." },
        { status: 400 }
      );
    }

    const priceUsdc = "0.05";
    const seller =
      process.env.NEXT_PUBLIC_SELLER_ADDRESS || DEFAULT_SELLER_ADDRESS;
    const vault =
      process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS ||
      DEFAULT_USAGE_VAULT_ADDRESS;

    // Check for x402 payment proof in headers
    const paymentProof =
      req.headers.get("x-402-payment-proof") ||
      req.headers.get("x-payment-tx") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+|^x402\s+/i, "");

    // --- 402 PAYMENT REQUIRED GATE ---
    if (!paymentProof) {
      return NextResponse.json(
        {
          error: "Payment Required",
          status: 402,
          protocol: "x402-v1",
          pricing: {
            amount: priceUsdc,
            currency: "USDC",
            decimals: 18,
          },
          network: {
            name: ARC_TESTNET_CONFIG.chainName,
            chainId: ARC_TESTNET_CONFIG.chainId,
            blockExplorer: ARC_TESTNET_CONFIG.blockExplorerUrls[0],
          },
          destination: {
            seller,
            usageVault: vault,
          },
          settlement: {
            method: "UsageVault.recordPayment(seller, payer, amount, 'summarize/v1')",
            settleEndpoint: "/api/gate/pay",
            headerRequired:
              "X-402-Payment-Proof: <Arc_Transaction_Hash>",
          },
          challenge: {
            nonce: "slc_" + Math.random().toString(36).substring(2, 12),
            expiresAt: Date.now() + 1000 * 60 * 15,
          },
        },
        {
          status: 402,
          headers: {
            "WWW-Authenticate": `x402 realm="Sluice", chainId="${ARC_TESTNET_CONFIG.chainId}", price="${priceUsdc}", token="USDC", vault="${vault}"`,
            "X-402-Price": priceUsdc,
            "X-402-Currency": "USDC",
            "X-402-Network": ARC_TESTNET_CONFIG.chainName,
            "X-402-Vault": vault,
          },
        }
      );
    }

    // --- REAL ON-CHAIN TRANSACTION VERIFICATION ---
    const verification = await verifyTransactionOnArc(paymentProof);
    if (!verification.valid) {
      return NextResponse.json(
        {
          error: "Invalid or Unconfirmed Payment Proof",
          details: verification.error,
          requiredVault: vault,
          txSubmitted: paymentProof,
        },
        { status: 402 }
      );
    }

    // --- REAL AI INFERENCE VIA GOOGLE GEMINI 3.6 FLASH ---
    const aiResult = await processSummarization({ text, mode });

    // Record verified receipt
    const receipt = {
      id: "arc-" + paymentProof,
      txHash: paymentProof,
      seller,
      payer: verification.from || "0xVerifiedCaller",
      amount: priceUsdc,
      token: "USDC",
      timestamp: Date.now(),
      blockNumber: verification.blockNumber || 0,
      endpoint: "POST /api/gate/summarize",
      status: "CONFIRMED" as const,
    };

    addReceipt(receipt);

    return NextResponse.json(
      {
        success: true,
        data: aiResult,
        onChainReceipt: {
          txHash: receipt.txHash,
          vault: vault,
          seller: receipt.seller,
          payer: receipt.payer,
          amount: `${receipt.amount} USDC`,
          blockNumber: receipt.blockNumber,
          network: ARC_TESTNET_CONFIG.chainName,
          explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${receipt.txHash}`,
          timestamp: new Date(receipt.timestamp).toISOString(),
          status: "VERIFIED_ON_ARC",
        },
      },
      {
        status: 200,
        headers: {
          "X-Usage-Receipt-Tx": receipt.txHash,
          "X-Usage-Vault": vault,
          "X-Settlement-Status": "CONFIRMED",
        },
      }
    );
  } catch (error: any) {
    console.error("Gateway error:", error);
    return NextResponse.json(
      {
        error: "Internal Gateway Error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
