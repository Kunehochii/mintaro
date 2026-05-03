# Affix — AI-Generated NFT Gacha dApp

An AI-generated NFT gacha dApp on Ethereum Sepolia testnet. Users mint NFTs with randomized rarity affixes, view their collection, and fuse base NFTs into rarer ones. Built with Next.js, Solidity (Hardhat), IPFS (Pinata), and OpenAI (DALL·E 3).

## Features

- **Mint** — Pay a fixed ETH fee to mint NFTs with AI-generated artwork and 1–3 stacked rarity affixes
- **Gallery** — Browse your collection with color-coded rarity display and detail views
- **Fuse** — Burn 5 base NFTs to craft 1 NFT with a guaranteed non-Common affix
- **Public Feed** — Explore recently minted NFTs across all users, filterable by rarity tier

## Tech Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Frontend        | Next.js 16, React 19, Tailwind CSS, ethers v6 |
| Smart Contracts | Solidity ^0.8.20, OpenZeppelin, Hardhat       |
| Monorepo        | Nx, pnpm workspaces                           |
| AI Generation   | OpenAI DALL·E 3                               |
| Storage         | IPFS (Pinata)                                 |
| Identity        | MetaMask (`window.ethereum`)                  |
| Deployment      | Sepolia testnet + Vercel                      |

## Architecture

```
apps/
  web/              → Next.js (frontend + API routes for relayer)
  contracts/        → Hardhat (Solidity + tests + deploy scripts)
libs/
  shared-types/     → Rarity enum, affix constants, typechain ABIs, wallet config
  contract-client/  → ethers v6 React hooks for contract interaction
```

### Reveal Flow

1. User calls `mint()` — transaction succeeds, NFT exists with no URI yet
2. Contract emits `MintRequested(tokenId, minter, seed)`
3. Next.js API route detects event → calls OpenAI → pins artwork to IPFS → calls `setTokenURI` via relayer wallet
4. Frontend polls `tokenURI(tokenId)` → plays reveal animation once URI is set

### Auth Flow

No login screen. The frontend checks `window.ethereum.selectedAddress` on load. A **Connect MetaMask** button calls `eth_requestAccounts`. Account/chain changes are handled via `accountsChanged` and `chainChanged` listeners. A user _is_ their wallet address — no traditional backend user store.

### Data Strategy — No Database

The chain is the source of truth: ownership via `ownerOf(tokenId)`, gallery via `Transfer` events, public feed via `TokenRevealed` events. The relayer's only persisted state is a `last_processed_block` pointer (JSON file or Vercel KV).

## Rarity Distribution

| Affix    | Probability |
| -------- | ----------- |
| Common   | 70%         |
| Rare     | 20%         |
| Splendid | 8%          |
| Divine   | 2%          |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- MetaMask browser extension
- Sepolia testnet ETH (from a faucet)

### Environment Setup

Copy `.env.example` to `.env.local` and fill in each value.
See **[Environment Variables Setup](./docs/environment-setup.md)** for step-by-step instructions on obtaining every key (free, except OpenAI which requires a $5 top-up).

### Local Development

```bash
pnpm install
pnpm nx run contracts:compile   # Compile Solidity
pnpm nx run web:dev             # Start Next.js on localhost:3000
pnpm nx run contracts:test      # Run Hardhat tests
```

### Available Nx Commands

| Command                          | Description                     |
| -------------------------------- | ------------------------------- |
| `pnpm nx run web:dev`            | Start Next.js dev server        |
| `pnpm nx run web:build`          | Build Next.js for production    |
| `pnpm nx run web:lint`           | Lint frontend code              |
| `pnpm nx run contracts:compile`  | Compile Solidity contracts      |
| `pnpm nx run contracts:test`     | Run Hardhat test suite          |
| `pnpm nx run contracts:lint`     | Lint contract code              |
| `pnpm nx run contracts:deploy`   | Deploy contracts to a network   |
| `pnpm nx run contracts:verify`   | Verify deployed contract source |
| `pnpm nx run shared-types:build` | Build shared types library      |

## Vercel Deployment

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Set the **Root Directory** to `apps/web`
3. Configure the following **Environment Variables** in the Vercel dashboard:

| Key                            | Value         | Notes            |
| ------------------------------ | ------------- | ---------------- |
| `RELAYER_PRIVATE_KEY`          | `0x...`       | Server-side only |
| `OPENAI_API_KEY`               | `sk-...`      | Server-side only |
| `PINATA_JWT`                   | `eyJ...`      | Server-side only |
| `SEPOLIA_RPC_URL`              | `https://...` | Server-side only |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x...`       | Client-safe      |
| `NEXT_PUBLIC_CHAIN_ID`         | `11155111`    | Client-safe      |

4. Deploy — **Vercel automatically detects Next.js** and uses the default build command (`next build`) and output directory (`.next`)

The relayer API routes under `apps/web/src/app/api/` will use the server-side environment variables to interact with the Sepolia network, OpenAI, and Pinata IPFS.

## Deployed Addresses

| Contract | Sepolia Address |
| -------- | --------------- |
| AffixNFT | `TBD`           |

The deployment address is stored in `apps/contracts/deployments/sepolia.json`. After deploying, copy the `address` field into `.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

```bash
pnpm nx run contracts:deploy -- --network sepolia
```

## Team

- **Tech Lead** — NX setup, architecture, PR reviews, relayer backend
- **Smart Contract Engineer** — Solidity + Hardhat tests
- **Frontend Engineer** — MetaMask wiring, mint flow, gallery, fusion UI
- **QA & Docs** — Test support, README, write-up, slides, demo video

## References

- [Nx Documentation](https://nx.dev)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [ethers.js v6](https://docs.ethers.org/v6/)
- [Pinata IPFS](https://pinata.cloud)

## Known Limitations

- **Randomness**: On-chain pseudo-randomness via `block.prevrandao` + `keccak256` is exploitable by validators. Production systems should use Chainlink VRF.
- **OpenAI Costs**: DALL·E 3 costs ~$0.04/image. Rate-limiting should be considered for public deployments.
- **Reveal Latency**: AI generation + IPFS pinning takes 5–15 seconds per NFT. The admin retry endpoint (`/api/reveal/retry`) serves as a safety net for failed reveals.
