# Product Requirements Document
## Sluice — Pay-Per-Call API Monetization on Arc

**Track:** Launch on Arc Testnet & Push to Mainnet ($3,500 — 1st: $2,500 / 2nd: $1,000)
**Event:** ETHOnline 2026
**Author:** [Your name]
**Date:** September 4, 2026
**Submission deadline:** September 13, 2026 (personal target) / September 30, 2026 (track hard deadline)
**Status:** Draft v1.0

> **Assumption flagged:** This PRD assumes the gated API is an **AI text summarization/analysis endpoint** (send text, get a summary or extracted insight back). This is a placeholder chosen for demo clarity and low build risk — swap it out in Section 3 if you land on image captioning, a data feed, or something else. Everything downstream (contract, gateway, dashboard) works the same regardless of which API sits behind the gate.

---

## 1. Summary

Sluice is a pay-per-call API gateway that lets any API charge in USDC, settled instantly on Arc, with no subscriptions and no signup. A caller (human or AI agent) hits the API; if unpaid, they get an HTTP 402 with a price; once payment clears, the request goes through. Every payment and usage event is recorded on a custom on-chain contract (the **Usage Vault**) — so unlike a typical metered-API backend, usage and revenue are independently verifiable on Arc, not just entries in a private database.

---

## 2. Problem Statement

APIs and AI services today only support two payment models: monthly subscriptions or manually-billed per-transaction cards. Neither works for AI agents or lightweight one-off usage — an agent can't "sign up," and card rails are too slow and human-dependent for machine-to-machine payments. When per-call billing does exist, the usage log lives in a private backend database that only the API owner can see or trust. Sluice solves both: instant machine-payable access, with usage and payment proof anyone can verify on-chain.

---

## 3. Goals & Success Criteria

| Goal | Success looks like |
|---|---|
| Working MVP | Full flow — unpaid call → 402 → payment → unlocked response — runs live, end to end, without manual intervention |
| Real Solidity depth | UsageVault contract is original code (not just calling Circle's SDK), tested, deployed, and verified on Arc Testnet |
| Track requirements met | Frontend + backend + architecture diagram + demo video + docs + GitHub link, submitted by Sept 13 |
| Judge-legible story | A judge unfamiliar with the project understands what it does and why it's different within the first 30 seconds of the demo video |
| Mainnet readiness | Either deployed to Arc mainnet, or clearly documented as deployment-ready (redeploy steps in README) |

---

## 4. Non-Goals (explicitly out of scope for this build)

- Supporting arbitrary/any third-party API (pick one API, gate it well)
- Multi-chain support beyond Arc (no CCTP/crosschain routing in v1)
- User accounts, auth, or a full billing dashboard beyond the seller's own vault view
- Refunds, disputes, or chargebacks (escrow-style logic is a different track fit — not this one)
- Production-grade rate limiting, DDoS protection, or abuse prevention
- Mobile app or non-web client

---

## 5. Users & Personas

| Persona | Need |
|---|---|
| **API Seller** (e.g. a solo dev monetizing a small AI tool) | Wants to charge per call without building billing infrastructure, and wants provable revenue records |
| **AI Agent / Caller** | Wants to consume an API programmatically and pay for it without human-in-the-loop signup |
| **Hackathon Judge** | Wants to quickly see a working product, a real Arc integration, and genuine technical substance in ~2–3 minutes |

---

## 6. Core User Flow

```
1. Caller sends request to API endpoint (no payment attached)
2. Gateway responds: HTTP 402 Payment Required + price in USDC
3. Caller signs and sends payment (x402 flow)
4. Gateway verifies payment, calls UsageVault.recordPayment() on Arc
5. Gateway forwards the original request to the real API
6. Caller receives the API response
7. Seller's dashboard updates: vault balance + new usage receipt, read live from on-chain events
```

---

## 7. Feature Scope (MVP)

| # | Feature | Priority | Notes |
|---|---|---|---|
| 1 | UsageVault.sol smart contract | P0 | deposit/record + per-seller balance + withdraw rule + usage event log |
| 2 | Payment gate middleware (402 flow) | P0 | Node/Next.js, x402-compatible |
| 3 | Underlying gated API (summarization) | P0 | Can be a thin wrapper around an existing LLM API |
| 4 | Arc Testnet deployment + verification | P0 | testnet.arcscan.app |
| 5 | Seller dashboard (status, price, balance, receipts feed) | P1 | Doubles as demo screen |
| 6 | Architecture diagram | P0 | Hard submission requirement |
| 7 | Demo video (2–3 min) | P0 | Hard submission requirement |
| 8 | Mainnet deployment or deployment-ready docs | P1 | Depends on mainnet stability post Sept 16 |
| 9 | Withdraw threshold / payout rule customization | P2 | Nice-to-have differentiator, cut first if time is short |

---

## 8. Technical Architecture

**Stack:**
- **Smart contract:** Solidity, Foundry, deployed to Arc Testnet (chain ID `5042002`)
- **Backend/gateway:** Node.js + Next.js API routes, x402 payment verification
- **Frontend:** Next.js dashboard, reads on-chain events directly (no separate off-chain database for usage records — the chain *is* the source of truth)
- **Wallet/gas:** USDC (Arc's native gas token), Circle Testnet Faucet for funding
- **Underlying API:** LLM-backed summarization endpoint (placeholder — swappable)

**Diagram (text form, convert to visual for submission):**

```
[Caller / AI Agent]
        |
        v
[Sluice Gateway] --402--> [Caller pays in USDC]
        |
        v (payment verified)
[UsageVault.sol on Arc] <---- records payment + usage event
        |
        v
[Underlying API] --response--> [Caller]

[Seller Dashboard] <---- reads on-chain events from UsageVault
```

---

## 9. UsageVault Contract — Interface Sketch

```solidity
function recordPayment(address seller, address payer, uint256 amount) external;
function balanceOf(address seller) external view returns (uint256);
function withdraw() external; // enforces seller-set threshold rule
event UsageRecorded(address indexed seller, address indexed payer, uint256 amount, uint256 timestamp);
```

---

## 10. Timeline (Sept 4 → Sept 13)

| Date | Milestone |
|---|---|
| Sept 4 | Lock scope, environment setup, wallet funded |
| Sept 5 | Write + test UsageVault.sol |
| Sept 6 | Deploy + verify vault on Arc Testnet |
| Sept 7–8 | Build 402 payment gate (backend) |
| Sept 9–10 | Wire real x402 payments into the vault (highest-risk step — budget slack) |
| Sept 11 | Build seller dashboard |
| Sept 12 | End-to-end testing + finalize architecture diagram |
| Sept 13 | Record demo video, finish docs, submit |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| x402 payment integration breaks close to deadline | Keep vault + dashboard fully functional independent of the payment gate, so a fallback manual-payment demo is always possible |
| Arc mainnet not stable/available by Sept 13 | Submit as "deployment-ready" on testnet with documented mainnet redeploy steps — explicitly allowed by track rules |
| Project reads as "just another x402 wrapper" | Lead the pitch with the on-chain verifiable usage vault, not the payment plumbing — that's the differentiator |
| Scope creep | Cut P2 features first (see Section 7) if behind schedule |

---

## 12. Submission Checklist (mapped to track requirements)

- [ ] Functional MVP (frontend + backend working end-to-end)
- [ ] Architecture diagram
- [ ] Demo video (2–3 min)
- [ ] Documentation (README covering setup, tech used, mainnet redeploy steps)
- [ ] GitHub/Replit repo link
- [ ] Track clearly labeled in submission: "Launch on Arc Testnet & Push to Mainnet"
- [ ] Deployed or deployment-ready on Arc mainnet

---

## 13. Open Questions

1. **Which API is actually being gated?** (placeholder: text summarization — confirm or swap)
2. Withdraw rule for the vault — flat minimum threshold, or something more novel (e.g. time-locked payouts)?
3. Solo build or is anyone else on the team?
