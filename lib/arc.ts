import { ethers } from "ethers";

export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x4cef52",
  chainName: "Arc Testnet",
  rpcUrls: [
    process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network",
  ],
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

export const DEFAULT_USAGE_VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS ||
  "0x2fB757b6158320b239a6eC4f7d7A0149D858D890";

export const DEFAULT_SELLER_ADDRESS =
  process.env.NEXT_PUBLIC_SELLER_ADDRESS ||
  "0xa9c97E3D0f95be9Fc990B3686997eC346D96833e";

export const USAGE_VAULT_ABI = [
  "function recordPayment(address seller, address payer, uint256 amount, string callTag) external payable",
  "function balanceOf(address seller) external view returns (uint256)",
  "function setWithdrawThreshold(uint256 newThreshold) external",
  "function withdraw() external",
  "function getSellerInfo(address seller) external view returns (uint256 balance, uint256 threshold, uint256 totalCalls, uint256 totalEarned)",
  "function totalPlatformCalls() external view returns (uint256)",
  "function totalPlatformVolume() external view returns (uint256)",
  "event UsageRecorded(address indexed seller, address indexed payer, uint256 amount, uint256 timestamp, string callTag)",
  "event Withdrawn(address indexed seller, uint256 amount, uint256 timestamp)",
  "event ThresholdUpdated(address indexed seller, uint256 newThreshold)",
];

export interface UsageReceipt {
  id: string;
  txHash: string;
  seller: string;
  payer: string;
  amount: string; // in USDC
  token: string;  // "USDC"
  timestamp: number;
  blockNumber: number;
  endpoint: string;
  status: "CONFIRMED" | "SETTLING" | "FAILED";
}

export function getArcProvider(): ethers.JsonRpcProvider {
  const rpcUrl =
    process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getUsageVaultContract(
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const vaultAddress =
    process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS || DEFAULT_USAGE_VAULT_ADDRESS;
  const p = signerOrProvider || getArcProvider();
  return new ethers.Contract(vaultAddress, USAGE_VAULT_ABI, p);
}

// In-memory confirmed session receipts
let sessionReceipts: UsageReceipt[] = [];

export function getReceipts(): UsageReceipt[] {
  return [...sessionReceipts].sort((a, b) => b.timestamp - a.timestamp);
}

export function addReceipt(receipt: UsageReceipt): void {
  sessionReceipts.unshift(receipt);
  if (sessionReceipts.length > 50) {
    sessionReceipts.pop();
  }
}

/**
 * Fetch real on-chain events directly from UsageVault contract on Arc Testnet
 */
export async function fetchOnChainEvents(
  sellerAddress = DEFAULT_SELLER_ADDRESS
): Promise<UsageReceipt[]> {
  try {
    const contract = getUsageVaultContract();
    const filter = contract.filters.UsageRecorded(sellerAddress);
    
    // Query recent blocks on Arc
    const provider = getArcProvider();
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 20000);

    const logs = await contract.queryFilter(filter, fromBlock, "latest");
    const onChainReceipts: UsageReceipt[] = [];

    for (const log of logs) {
      if ("args" in log) {
        const [seller, payer, amount, timestamp, callTag] = log.args;
        onChainReceipts.push({
          id: `onchain-${log.transactionHash}-${log.index}`,
          txHash: log.transactionHash,
          seller,
          payer,
          amount: ethers.formatEther(amount),
          token: "USDC",
          timestamp: Number(timestamp) * 1000,
          blockNumber: log.blockNumber,
          endpoint: `POST /api/gate/${callTag || "summarize"}`,
          status: "CONFIRMED",
        });
      }
    }

    return onChainReceipts;
  } catch (err) {
    console.warn("Could not query on-chain filter logs:", err);
    return [];
  }
}

/**
 * Mathematically verify a transaction on Arc Testnet.
 * Checks that the tx exists, was mined successfully, and interacted with UsageVault.
 */
export async function verifyTransactionOnArc(txHash: string): Promise<{
  valid: boolean;
  blockNumber?: number;
  from?: string;
  error?: string;
}> {
  try {
    const provider = getArcProvider();
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return { valid: false, error: "Transaction not found on Arc Testnet." };
    }

    if (receipt.status !== 1) {
      return { valid: false, error: "Transaction reverted on Arc Testnet." };
    }

    const expectedVault = (
      process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS || DEFAULT_USAGE_VAULT_ADDRESS
    ).toLowerCase();

    if (receipt.to && receipt.to.toLowerCase() !== expectedVault) {
      return {
        valid: false,
        error: `Transaction destination (${receipt.to}) does not match UsageVault (${expectedVault}).`,
      };
    }

    return {
      valid: true,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Arc verification error: ${err.message || String(err)}`,
    };
  }
}
