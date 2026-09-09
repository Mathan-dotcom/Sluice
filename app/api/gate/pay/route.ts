import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import {
  ARC_TESTNET_CONFIG,
  DEFAULT_SELLER_ADDRESS,
  DEFAULT_USAGE_VAULT_ADDRESS,
  USAGE_VAULT_ABI,
  addReceipt,
  getArcProvider,
} from "@/lib/arc";

/**
 * Real On-Chain Settlement Endpoint on Arc Testnet.
 * Submits an actual transaction to UsageVault.recordPayment(...) using the funded relayer/payer key.
 * ZERO mock data — executes live on Arc.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      amount = "0.05",
      endpoint = "POST /api/gate/summarize",
      sellerAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || DEFAULT_SELLER_ADDRESS,
      vaultAddress = process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS || DEFAULT_USAGE_VAULT_ADDRESS,
    } = body;

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "PRIVATE_KEY is not configured on server for Arc settlement." },
        { status: 500 }
      );
    }

    const provider = getArcProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const vaultContract = new ethers.Contract(vaultAddress, USAGE_VAULT_ABI, wallet);

    const amountWei = ethers.parseEther(String(amount));

    console.log(`[Arc Settlement] Broadcasting real tx from ${wallet.address} to ${vaultAddress} for ${amount} USDC...`);

    // Call recordPayment on Arc Testnet with native USDC value
    const tx = await vaultContract.recordPayment(
      sellerAddress,
      wallet.address,
      amountWei,
      "summarize/v1",
      { value: amountWei }
    );

    console.log(`[Arc Settlement] Tx submitted: ${tx.hash}. Waiting for block confirmation...`);
    const receipt = await tx.wait(1);

    const onChainReceipt = {
      id: `arc-${receipt.hash}`,
      txHash: receipt.hash,
      seller: sellerAddress,
      payer: wallet.address,
      amount: String(amount),
      token: "USDC",
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      endpoint,
      status: "CONFIRMED" as const,
    };

    addReceipt(onChainReceipt);

    return NextResponse.json({
      success: true,
      message: "Payment confirmed on Arc Testnet.",
      receipt: {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        payer: wallet.address,
        seller: sellerAddress,
        vault: vaultAddress,
        amount: `${amount} USDC`,
        gasUsed: receipt.gasUsed.toString(),
        network: ARC_TESTNET_CONFIG.chainName,
        explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${receipt.hash}`,
      },
      proofToken: receipt.hash,
      instructions: `Pass 'X-402-Payment-Proof: ${receipt.hash}' in headers to execute the gated API call.`,
    });
  } catch (error: any) {
    console.error("Arc on-chain settlement failed:", error);
    return NextResponse.json(
      {
        error: "On-chain payment settlement failed on Arc Testnet.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
