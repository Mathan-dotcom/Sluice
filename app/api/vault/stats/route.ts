import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_SELLER_ADDRESS,
  DEFAULT_USAGE_VAULT_ADDRESS,
  ARC_TESTNET_CONFIG,
  getReceipts,
  generateTxHash,
} from "@/lib/arc";

// Dynamic mutable state for dashboard demo
let sellerState = {
  sellerAddress: DEFAULT_SELLER_ADDRESS,
  vaultAddress: DEFAULT_USAGE_VAULT_ADDRESS,
  withdrawThreshold: "0.20", // in USDC
  lastWithdrawnAmount: "0.00",
  lastWithdrawnTx: "",
};

export async function GET(req: NextRequest) {
  const receipts = getReceipts();
  
  // Calculate total settled balance from all receipts for this seller
  const totalVolume = receipts.reduce((acc, r) => acc + parseFloat(r.amount), 0);
  const totalCalls = receipts.length;
  
  // Withdrawable balance = total volume minus any withdrawals
  const balance = Math.max(0, totalVolume - parseFloat(sellerState.lastWithdrawnAmount));

  return NextResponse.json({
    sellerAddress: sellerState.sellerAddress,
    vaultAddress: sellerState.vaultAddress,
    network: ARC_TESTNET_CONFIG.chainName,
    chainId: ARC_TESTNET_CONFIG.chainId,
    balance: balance.toFixed(4),
    currency: "USDC",
    withdrawThreshold: sellerState.withdrawThreshold,
    canWithdraw: balance >= parseFloat(sellerState.withdrawThreshold),
    totalCalls,
    totalVolume: totalVolume.toFixed(4),
    receipts,
    lastWithdrawn: {
      amount: sellerState.lastWithdrawnAmount,
      txHash: sellerState.lastWithdrawnTx,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, threshold } = body;

    if (action === "setThreshold") {
      if (!threshold || isNaN(parseFloat(threshold))) {
        return NextResponse.json(
          { error: "Invalid threshold value" },
          { status: 400 }
        );
      }
      sellerState.withdrawThreshold = parseFloat(threshold).toFixed(2);
      return NextResponse.json({
        success: true,
        message: `Withdraw threshold updated to ${sellerState.withdrawThreshold} USDC`,
        newThreshold: sellerState.withdrawThreshold,
      });
    }

    if (action === "withdraw") {
      const receipts = getReceipts();
      const totalVolume = receipts.reduce((acc, r) => acc + parseFloat(r.amount), 0);
      const currentBalance = totalVolume - parseFloat(sellerState.lastWithdrawnAmount);
      const thresholdVal = parseFloat(sellerState.withdrawThreshold);

      if (currentBalance < thresholdVal) {
        return NextResponse.json(
          {
            error: `Threshold not met: Available balance (${currentBalance.toFixed(
              4
            )} USDC) is below minimum threshold (${thresholdVal.toFixed(2)} USDC).`,
          },
          { status: 400 }
        );
      }

      const withdrawTx = generateTxHash();
      sellerState.lastWithdrawnAmount = totalVolume.toFixed(4);
      sellerState.lastWithdrawnTx = withdrawTx;

      return NextResponse.json({
        success: true,
        message: `Successfully withdrew ${currentBalance.toFixed(4)} USDC on Arc Testnet!`,
        withdrawnAmount: currentBalance.toFixed(4),
        txHash: withdrawTx,
        explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${withdrawTx}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Vault action failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
