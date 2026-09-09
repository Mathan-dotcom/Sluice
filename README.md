# Sluice — Pay-Per-Call API Monetization on Arc

[![Track](https://img.shields.io/badge/ETHOnline%202026-Launch%20on%20Arc%20Testnet%20%26%20Push%20to%20Mainnet-black?style=flat-square)](https://ethglobal.com)
[![Network](https://img.shields.io/badge/Network-Arc%20Testnet%20%235042002-blue?style=flat-square)](https://testnet.arcscan.app)
[![Design](https://img.shields.io/badge/Design%20System-Meridian%20Neumorphism%20v2.0-white?style=flat-square)](#design-system--meridian-neumorphism)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](LICENSE)

> **Sluice** is an autonomous, machine-native pay-per-call API gateway that monetizes endpoints in USDC settled on **Arc**. Unpaid callers receive an standard `HTTP 402 Payment Required` challenge. Once settled, the gateway verifies payment, records payment and usage on an immutable on-chain **`UsageVault`** smart contract, and executes the requested API payload.

---

## 1. Problem & Innovation

Today, APIs and AI microservices force customers into monthly subscriptions or human-driven credit card invoices.
- **For AI Agents:** Autonomous agents cannot sign up for accounts or manage billing portals.
- **For API Sellers:** Metering logic is traditionally trapped inside private backend databases (e.g. AWS RDS or Stripe logs) that neither buyer nor auditor can independently verify.

### How Sluice Solves This
1. **Sub-Second Machine Settlements:** Leverages Arc's native USDC gas token and fast block times to make micro-transactions viable for machine-to-machine AI queries.
2. **On-Chain Verifiable Accounting:** Usage and revenue are logged directly onto `UsageVault.sol`. API sellers, buyers, and automated auditors can inspect usage receipts and historical earnings on Arcscan without vendor lock-in.
3. **Custom Payout Thresholds:** Sellers define automated withdrawal thresholds (e.g. min 0.20 USDC), unlocking trustless and batched payout execution.

---

## 2. System Architecture

```
[Caller / Autonomous AI Agent]
         │
         ▼  (1) POST /api/gate/summarize (Unpaid)
┌────────────────────────────────────────────────────────────────────────┐
│                        Sluice Gateway Engine                           │
│  • Returns HTTP 402 Payment Required + Price (0.05 USDC) + Vault Spec │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (2) Signs & transmits settlement in native USDC on Arc
┌────────────────────────────────────────────────────────────────────────┐
│                 UsageVault.sol (Arc Testnet #5042002)                  │
│  • recordPayment(seller, payer, amount, callTag)                       │
│  • Emits UsageRecorded(seller, payer, amount, timestamp, tag)          │
│  • Credits seller withdrawable balance                                 │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (3) Gateway verifies payment & forwards payload
┌────────────────────────────────────────────────────────────────────────┐
│                   Underlying Gated AI Microservice                     │
│  • High-performance neural text summarization & insight analysis       │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (4) Returns unlocked 200 OK + AI Result + On-Chain Proof
┌────────────────────────────────────────────────────────────────────────┐
│              Meridian Mission Control (Seller Dashboard)               │
│  • Real-time balance counter, receipts stream, and 1-click payouts     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

- **Blockchain:** Arc Testnet (Chain ID `5042002`), Arc Mainnet ready (Chain ID `5042001`)
- **Smart Contracts:** Solidity `0.8.20`, Hardhat & Foundry compatible
- **Gas & Currency:** Native USDC on Arc
- **Backend Gateway:** Node.js, Next.js 14 App Router, x402 protocol specification
- **Frontend Mission Control:** React, Next.js, HTML5 2D Canvas `PulseField`
- **Styling:** Meridian Neumorphic Design System (Monochrome Dark Neumorphism, dual-shadow tactile surfaces, tri-font typography)

---

## 4. Quick Start

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Git

### Installation
```bash
git clone https://github.com/Mathan-dotcom/Sluice.git
cd Sluice
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

### Run Smart Contract Tests
```bash
npx hardhat test
```

### Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access **Meridian Mission Control** and the **Interactive 402 Playground**.

---

## 5. Smart Contract: `UsageVault.sol`

`UsageVault.sol` is deployed on Arc Testnet:
- **Contract Address:** `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- **Explorer:** [https://testnet.arcscan.app/address/0x8A791620dd6260079BF849Dc5567aDC3F2FdC318](https://testnet.arcscan.app)

### Core Interface
```solidity
function recordPayment(address seller, address payer, uint256 amount, string calldata callTag) external payable;
function balanceOf(address seller) external view returns (uint256);
function setWithdrawThreshold(uint256 newThreshold) external;
function withdraw() external;
function getSellerInfo(address seller) external view returns (uint256 balance, uint256 threshold, uint256 totalCalls, uint256 totalEarned);
```

---

## 6. Deploying to Arc Mainnet

Sluice is 100% deployment-ready for Arc Mainnet:

1. Fund your deployer wallet with Arc Mainnet USDC.
2. Export your deployer private key and RPC URL:
   ```bash
   export PRIVATE_KEY="0x..."
   export ARC_MAINNET_RPC_URL="https://rpc.arc.network"
   ```
3. Run the deployment script targeting `arcMainnet`:
   ```bash
   npx hardhat run scripts/deploy.js --network arcMainnet
   ```
4. Update `NEXT_PUBLIC_USAGE_VAULT_ADDRESS` in `.env.local` with the new mainnet address.

---

## 7. HTTP 402 Protocol Specification

### 1. Challenge Response (`402 Payment Required`)
When a caller requests `/api/gate/summarize` without payment headers:
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
WWW-Authenticate: x402 realm="Sluice", chainId="5042002", price="0.05", token="USDC", vault="0x8A791620..."

{
  "error": "Payment Required",
  "status": 402,
  "protocol": "x402-v1",
  "pricing": { "amount": "0.05", "currency": "USDC" },
  "network": { "name": "Arc Testnet", "chainId": 5042002 },
  "destination": {
    "seller": "0x429994c9efE1D137c4856E3d5dF981fae62F764F",
    "usageVault": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
  }
}
```

### 2. Settled Request (`200 OK`)
Pass the settlement transaction hash in the `X-402-Payment-Proof` header:
```bash
curl -X POST https://sluice.network/api/gate/summarize \
  -H "Content-Type: application/json" \
  -H "X-402-Payment-Proof: 0x3f8a92bb710ef50d89265f61765c71a3e5cbb5920d0f507b5380d6b63c224f8d" \
  -d '{"text": "Autonomous AI agents require machine-speed economic rails..."}'
```

---

## 8. Design System — Meridian Neumorphism

Sluice implements the **Meridian Design System v2.0** (`STYLEGUIDE-Neumorphism.md`):
- **Monochrome Dark Neumorphism:** Deep charcoal base (`--ink: #0c0c0e`, `--neu-base: #1c1c1f`) molded with dual directional light and shadow. No transparent glass or borders.
- **Tri-Font Discipline:**
  - `Fraunces` (Editorial Serif Display) for hero treasury counters
  - `Space Grotesk` (Technical UI) for navigation and controls
  - `IBM Plex Mono` (Financial Monospace) for the immutable ledger
- **Kinetic Feedback:** 60fps HTML5 Canvas `PulseField`, tactile `.card-hover` elevation, and breathing recovery exhales.

---

## 9. License

Apache 2.0. Open source for ETHOnline 2026.
