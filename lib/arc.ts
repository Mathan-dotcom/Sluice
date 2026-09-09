import { ethers } from "ethers";

export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x4cefb2",
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

// Default deployed demo address if not set in env
export const DEFAULT_USAGE_VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_USAGE_VAULT_ADDRESS ||
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

export const DEFAULT_SELLER_ADDRESS =
  process.env.NEXT_PUBLIC_SELLER_ADDRESS ||
  "0x429994c9efE1D137c4856E3d5dF981fae62F764F";

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
  amount: string; // e.g. "0.05"
  token: string;  // "USDC"
  timestamp: number;
  blockNumber: number;
  endpoint: string;
  status: "CONFIRMED" | "SETTLING" | "FAILED";
}

// In-memory receipt cache for real-time dashboard updates across sessions
let receiptsStore: UsageReceipt[] = [
  {
    id: "rcpt-001",
    txHash: "0x3f8a92bb710ef50d89265f61765c71a3e5cbb5920d0f507b5380d6b63c224f8d",
    seller: DEFAULT_SELLER_ADDRESS,
    payer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: "0.05",
    token: "USDC",
    timestamp: Date.now() - 1000 * 60 * 14,
    blockNumber: 1248902,
    endpoint: "POST /api/gate/summarize",
    status: "CONFIRMED",
  },
  {
    id: "rcpt-002",
    txHash: "0x98bce410e527d921bdfc09756bca95648f572c57801a61b8f5223e74a812e95a",
    seller: DEFAULT_SELLER_ADDRESS,
    payer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: "0.05",
    token: "USDC",
    timestamp: Date.now() - 1000 * 60 * 6,
    blockNumber: 1248918,
    endpoint: "POST /api/gate/summarize",
    status: "CONFIRMED",
  },
  {
    id: "rcpt-003",
    txHash: "0xfa4911d9bc422a5789f109eb923185bb81d09e530960d7c570b556942c74d301",
    seller: DEFAULT_SELLER_ADDRESS,
    payer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: "0.05",
    token: "USDC",
    timestamp: Date.now() - 1000 * 60 * 2,
    blockNumber: 1248931,
    endpoint: "POST /api/gate/summarize",
    status: "CONFIRMED",
  },
];

export function getReceipts(): UsageReceipt[] {
  return [...receiptsStore].sort((a, b) => b.timestamp - a.timestamp);
}

export function addReceipt(receipt: UsageReceipt): void {
  receiptsStore.unshift(receipt);
  if (receiptsStore.length > 50) {
    receiptsStore.pop();
  }
}

export function generateTxHash(): string {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
}
