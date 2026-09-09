import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import {
  DEFAULT_SELLER_ADDRESS,
  DEFAULT_USAGE_VAULT_ADDRESS,
  ARC_TESTNET_CONFIG,
  USAGE_VAULT_ABI,
  getArcProvider,
  getUsageVaultContract,
  fetchOnChainEvents,
  getReceipts,
} from "@/lib/arc";

export async function GET(req: NextRequest) {
  try {
    const sellerAddress =
      process.env.NEXT_PUBLIC_SELLER_ADDRESS || DEFAULT_SELLER_ADDRESS;
    const vaultAddress =
      process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS ||
      DEFAULT_USAGE_VAULT_ADDRESS;

    const contract = getUsageVaultContract();

    // Fetch real-time on-chain stats from Arc Testnet
    const [balanceWei, thresholdWei, totalCalls, totalEarnedWei] =
      await contract.getSellerInfo(sellerAddress);

    const balance = ethers.formatEther(balanceWei);
    const threshold = ethers.formatEther(thresholdWei);
    const totalVolume = ethers.formatEther(totalEarnedWei);
    const canWithdraw = balanceWei >= thresholdWei && balanceWei > 0n;

    // Fetch real on-chain events from Arc
    const onChainEvents = await fetchOnChainEvents(sellerAddress);
    const sessionList = getReceipts();

    // Merge on-chain and session receipts (deduplicated by txHash)
    const seen = new Set<string>();
    const allReceipts = [...sessionList, ...onChainEvents].filter((r) => {
      if (seen.has(r.txHash.toLowerCase())) return false;
      seen.add(r.txHash.toLowerCase());
      return true;
    });

    return NextResponse.json({
      sellerAddress,
      vaultAddress,
      network: ARC_TESTNET_CONFIG.chainName,
      chainId: ARC_TESTNET_CONFIG.chainId,
      balance,
      currency: "USDC",
      withdrawThreshold: threshold,
      canWithdraw,
      totalCalls: Number(totalCalls),
      totalVolume,
      receipts: allReceipts,
      explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${vaultAddress}`,
    });
  } catch (err: any) {
    console.error("Failed to read on-chain vault stats:", err);
    return NextResponse.json(
      {
        error: "Failed to read on-chain vault stats from Arc Testnet.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, threshold } = body;

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "PRIVATE_KEY is not configured for signing on Arc." },
        { status: 500 }
      );
    }

    const provider = getArcProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const vaultAddress =
      process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS ||
      DEFAULT_USAGE_VAULT_ADDRESS;
    const contract = new ethers.Contract(vaultAddress, USAGE_VAULT_ABI, wallet);

    if (action === "setThreshold") {
      if (!threshold || isNaN(parseFloat(threshold))) {
        return NextResponse.json(
          { error: "Invalid threshold value" },
          { status: 400 }
        );
      }
      const newThresholdWei = ethers.parseEther(String(threshold));
      console.log(`[Arc On-Chain] Updating threshold to ${threshold} USDC...`);
      const tx = await contract.setWithdrawThreshold(newThresholdWei);
      await tx.wait(1);

      return NextResponse.json({
        success: true,
        message: `Withdraw threshold updated to ${threshold} USDC on Arc Testnet!`,
        txHash: tx.hash,
        explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${tx.hash}`,
      });
    }

    if (action === "withdraw") {
      console.log(`[Arc On-Chain] Executing withdraw() for seller ${wallet.address}...`);
      const tx = await contract.withdraw();
      const receipt = await tx.wait(1);

      return NextResponse.json({
        success: true,
        message: `Successfully withdrew funds on Arc Testnet!`,
        txHash: receipt.hash,
        explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${receipt.hash}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("On-chain action failed:", err);
    return NextResponse.json(
      {
        error: "On-chain action failed on Arc Testnet.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
