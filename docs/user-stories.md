# Affix — Final Project Plan

An AI-generated NFT gacha dApp on Sepolia. Users mint NFTs with randomized rarity affixes, view their collection, and fuse base NFTs into rarer ones.

---

## Scope (Locked)

**In scope:**

1. **Mint** — fixed ETH fee, AI-generated artwork, 1–3 stacked rarity affixes per NFT
2. **Gallery** — user's collection with affix display and color-coded rarity
3. **Fuse** — burn 5 base NFTs to craft 1 NFT with a guaranteed non-Common affix
4. **Public feed** — recently minted NFTs across all users

**Out of scope:** fractionalization, marketplace, economic valuation logic, secondary trading.

**Affixes are metadata, not economic multipliers.** Displayed on the NFT card as flavor/rarity, no contract logic depends on a "multiplier value."

**MetaMask is the sole identity provider.** The dApp uses `window.ethereum` (MetaMask injected provider) wrapped by ethers v6 `BrowserProvider`. There is no email/password, no OAuth, no session cookie, no user table. A user _is_ their wallet address.

**No database.** The chain is the source of truth: ownership via `ownerOf(tokenId)`, gallery via `Transfer` events, public feed via `TokenRevealed` events, earnings/affixes via view functions. The relayer's only persisted state is a `last_processed_block` pointer, kept as a single JSON file (or Vercel KV) — not a database.

**OpenAI is the only off-chain dependency.** Image generation (DALL·E 3) plus IPFS pinning (Pinata) run inside Next.js API routes triggered by `MintRequested` events. The relayer wallet (server-side env var only) finalizes reveals via `setTokenURI`.

**Randomness is acknowledged-insecure.** On-chain pseudo-randomness via `block.prevrandao` + `keccak256`. Documented in contract comments and write-up as a known weakness with Chainlink VRF as the production solution. This becomes a _strength_ in the presentation — you demonstrate understanding of the cryptographic limitation rather than hiding it.

---

## Architecture

**NX monorepo:**

```
apps/
  web/              → Next.js (frontend + API routes for relayer) — single SPA + API routes; MetaMask is the only wallet connector
  contracts/        → Hardhat (Solidity + tests + deploy)
libs/
  shared-types/     → Rarity enum, affix constants, typechain ABIs
  contract-client/  → ethers v6 hooks wrapping contract calls (no wagmi)
```

**Reveal flow (optimistic):**

1. User calls `mint()` — tx succeeds, NFT exists with no URI yet
2. Contract emits `MintRequested(tokenId, minter, seed)`
3. Next.js API route detects event → calls OpenAI → pins to IPFS → calls `setTokenURI` via relayer wallet
4. Frontend polls `tokenURI(tokenId)` → plays reveal animation once URI is set

**Auth flow:** No login screen. On page load, the frontend checks `window.ethereum.selectedAddress`. If absent, a **Connect MetaMask** button calls `eth_requestAccounts`. Account/chain changes are handled via `accountsChanged` and `chainChanged` listeners. Wrong-network state offers `wallet_switchEthereumChain` to Sepolia. (Reference implementation pattern lives in `frontend/src/hooks/useTipPost.ts` from the prior project — port that approach into `libs/contract-client` for `useAffixNFT`.)

**No long-lived connections needed.** Event polling/watching happens in Next.js API routes. No websockets, no separate backend process.

---

## Timeline

| Week  | Milestone                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------ |
| 1     | Proposal approved, monorepo scaffold, contract skeleton, env setup                                     |
| 2     | Contract compiles + first Hardhat test passing, frontend wallet-connected, basic mint works end-to-end |
| 3     | All features complete (mint, gallery, fuse, feed), deployed to Sepolia + Vercel                        |
| Final | Polish, write-up, slides, demo video                                                                   |

---

# User Stories → Tasks

## Epic 1: Project Setup & Infrastructure

### US-1: As a developer, I want an NX monorepo configured so that the team can work on contracts and frontend with shared types.

**Task 1.1 — Initialize NX workspace**

- _Description:_ Create NX workspace with Next.js app and a Node-based Hardhat app. Configure TypeScript strict mode, ESLint, Prettier at workspace root.
- _Acceptance criteria:_
  - `nx run web:dev` starts Next.js on localhost:3000
  - `nx run contracts:compile` compiles Solidity successfully
  - Shared `tsconfig.base.json` with `strict: true`, `noImplicitAny: true`
  - Workspace-level ESLint rule bans `any` type
  - Clean initial commit with clear README structure

**Task 1.2 — Set up shared types library**

- _Description:_ Create `libs/shared-types` for rarity enums, affix probability constants, and typechain-generated ABIs.
- _Acceptance criteria:_
  - Rarity enum (`Common`, `Rare`, `Splendid`, `Divine`) defined once and imported by both apps
  - Typechain output generated into this lib after contract compile
  - Probability distribution constants sum to 100% — enforced by a unit test
  - Constants use `satisfies` operator for type-safe literals
  - Exports a small `wallet.ts` with the canonical Sepolia chain config (`chainId: 11155111`, `chainName`, `rpcUrls`, `nativeCurrency`, `blockExplorerUrls`) — used by the frontend's network-switch call so the value is defined once

**Task 1.3 — Configure environment and secrets**

- _Description:_ Set up `.env.example`, Sepolia RPC (Alchemy/Infura), relayer wallet, OpenAI API key, Pinata keys. Document in README.
- _Acceptance criteria:_
  - `.env.example` committed with all required keys (no real values)
  - Relayer key used only server-side (never prefixed `NEXT_PUBLIC_`)
  - README has step-by-step local setup instructions
  - Vercel deployment documented with env var checklist

---

## Epic 2: Smart Contracts

### US-2: As a user, I want to mint a new NFT by paying ETH so that I receive a uniquely generated asset with random rarity affixes.

**Task 2.1 — Implement `AffixNFT` ERC-721 contract**

- _Description:_ Main NFT contract inheriting from OpenZeppelin's `ERC721URIStorage` and `Ownable`. Tracks `mintPrice`, `tokenCounter`, and affix mapping per tokenId.
- _Acceptance criteria:_
  - `mint()` is `payable`, requires `msg.value == mintPrice`
  - Increments token counter and emits `MintRequested(tokenId, minter, seed)` event
  - Uses `require` with clear revert strings
  - No compiler warnings on Solidity ^0.8.20
  - Mint price is configurable via owner-only setter

**Task 2.2 — Implement rarity affix assignment logic**

- _Description:_ On-chain pseudo-random affix generator using `keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, tokenId))`. Rolls 1–3 affixes per mint according to defined probability distribution.
- _Acceptance criteria:_
  - Affix distribution documented in NatSpec comments (e.g., Common 70%, Rare 20%, Splendid 8%, Divine 2%)
  - Affixes stored as `uint8[]` per tokenId
  - `getAffixes(tokenId)` view function returns them
  - Emits `AffixesAssigned(tokenId, affixes)` event
  - NatSpec comment explicitly states: "⚠️ This randomness is pseudo-random and exploitable by validators. Production systems should use Chainlink VRF."

**Task 2.3 — Implement owner-only `setTokenURI` for post-mint reveal**

- _Description:_ Relayer (contract owner) calls `setTokenURI(tokenId, ipfsUri)` after off-chain image generation completes. Guard with `onlyOwner` and prevent overwriting.
- _Acceptance criteria:_
  - Reverts if caller is not owner (`onlyOwner` modifier)
  - Reverts if URI already set for that tokenId (one-time reveal)
  - Emits `TokenRevealed(tokenId, uri)` event
  - Reverts if tokenId does not exist

### US-3: As a user, I want to burn 5 base NFTs to craft 1 NFT with a guaranteed rarity upgrade so that I can reduce supply and progress in my collection.

**Task 2.4 — Implement `fuse(uint256[5] tokenIds)` function**

- _Description:_ Burns 5 NFTs owned by caller, mints 1 new NFT with guaranteed minimum Rare affix (skips Common tier in randomness roll).
- _Acceptance criteria:_
  - Reverts if caller doesn't own all 5 tokens
  - Reverts if any of the 5 tokens already contain a Splendid or Divine affix (prevents wasteful fusion — documented in NatSpec)
  - Calls `_burn()` on all 5, mints new token via same event-driven reveal flow as `mint()`
  - New token's affix roll excludes Common tier
  - Emits `Fused(burnedIds, newTokenId, minter)` event
  - `fuse` is not `payable` — fusion costs only the burned NFTs, not ETH

### US-4: As a developer, I want comprehensive Hardhat tests so that contract behavior is verified and regressions are caught.

**Task 2.5 — Write Hardhat tests for mint flow**

- _Description:_ Happy path, underpayment revert, event emission, affix range validation.
- _Acceptance criteria:_
  - Successful mint increments token counter and assigns ownership
  - Underpayment reverts with correct error
  - `MintRequested` event asserted with correct args
  - Every minted token has 1–3 affixes assigned
  - Minimum 5 test cases for mint

**Task 2.6 — Write Hardhat tests for reveal and fuse flows**

- _Description:_ Owner-only reveal, double-reveal prevention, fusion edge cases, affix distribution sanity check.
- _Acceptance criteria:_
  - Non-owner calling `setTokenURI` reverts
  - Double-reveal reverts with clear message
  - Fusion with fewer than 5 tokens reverts
  - Fusion with unowned tokens reverts
  - Fusion with Splendid/Divine inputs reverts
  - Statistical test: 1000 mints produces affix distribution within ±5% of configured probabilities

---

## Epic 3: Relayer & AI Generation

### US-5: As a user, after minting, I want my NFT to reveal AI-generated artwork so that the gacha experience feels rewarding.

**Task 3.1 — Build event listener in Next.js API route**

- _Description:_ `/api/reveal/watch` endpoint (called by cron or manually for demo) uses viem to query `MintRequested` events since last processed block. For each unrevealed event, trigger the reveal pipeline.
- _Acceptance criteria:_
  - New `MintRequested` events detected within 30s of block confirmation
  - Each event triggers exactly one reveal attempt (idempotent — skip if URI already set on-chain)
  - Last processed block persisted (simple file or Vercel KV)
  - Errors logged with tokenId context; retries up to 3 times

**Task 3.2 — Integrate OpenAI image generation with affix-based prompt**

- _Description:_ Construct prompt from assigned affixes. Example: _"A Divine, Splendid dragon, fantasy digital art, ornate, glowing runes, 1:1 aspect ratio."_ Call DALL-E 3, receive image URL.
- _Acceptance criteria:_
  - Prompt template uses affix names as adjectives/modifiers
  - Image is 1024x1024
  - Failed generations retried once, then surfaced via a failure log entry
  - OpenAI API key is server-side only
  - Prompt template exported as a pure function and unit-tested

**Task 3.3 — Pin image and metadata to IPFS via Pinata**

- _Description:_ Download generated image, upload to Pinata, construct ERC-721 metadata JSON, pin metadata, return metadata CID.
- _Acceptance criteria:_
  - Metadata follows ERC-721 Metadata JSON Schema
  - Each affix appears as an `attributes` entry with `trait_type: "Affix"` and value being the affix name
  - Returned URI in format `ipfs://<cid>`
  - Pinning verified by fetching the CID back before returning

**Task 3.4 — Call `setTokenURI` from relayer wallet to finalize reveal**

- _Description:_ Use viem with server-side relayer wallet to submit the `setTokenURI` transaction.
- _Acceptance criteria:_
  - Transaction signed with server-only private key
  - Waits for 1 confirmation before marking reveal complete
  - Handles nonce conflicts via sequential processing (one reveal at a time)
  - Failure logs tokenId + error; does not crash the API route

**Task 3.5 — Admin retry endpoint for failed reveals**

- _Description:_ Owner-only `/api/reveal/retry?tokenId=X` to manually retry a failed reveal. Safety net for demo day.
- _Acceptance criteria:_
  - Endpoint requires a simple shared secret in header
  - Skips if URI already set on-chain
  - Runs the full reveal pipeline for the given tokenId
  - Returns JSON with success/failure status

---

## Epic 4: Frontend

### US-6: As a user, I want to connect my MetaMask wallet so that I can interact with the dApp.

**Task 4.1 — Set up MetaMask connection in `libs/contract-client`**

- _Description:_ Build a small client around `window.ethereum` + ethers v6 `BrowserProvider`. Export a React hook (`useWallet`) that exposes `address`, `chainId`, `isConnected`, `isCorrectNetwork`, `connect()`, and `switchToSepolia()`. **No wagmi, no RainbowKit** — MetaMask is the only target. Mirror the provider/signer/event-listener pattern from `frontend/src/hooks/useTipPost.ts` in the prior repo.
- _Acceptance criteria:_
  - "Connect MetaMask" button triggers `eth_requestAccounts` and stores the resulting signer
  - `accountsChanged` and `chainChanged` events update React state automatically (no manual polling)
  - Wrong-network banner appears when `chainId !== 11155111`, with a "Switch to Sepolia" button calling `wallet_switchEthereumChain` (and `wallet_addEthereumChain` as fallback)
  - Connection is restored on page reload by reading `window.ethereum.selectedAddress` without forcing a re-prompt
  - If MetaMask is not installed, a clear "Install MetaMask" link is shown instead of a connect button
  - Connected address rendered truncated (e.g. `0x1234…abcd`); ENS lookup is **out of scope** for this task

### US-7: As a user, I want to mint an NFT and see the reveal animation so that the gacha feels exciting.

**Task 4.2 — Build mint button and transaction flow**

- _Description:_ Mint page with "Mint for 0.01 ETH" button. Pending state during tx, "Revealing..." state after confirmation.
- _Acceptance criteria:_
  - Calls the contract via the ethers v6 signer obtained from the `useWallet` hook (`contract.mint({ value: mintPrice })`); awaits `tx.wait()` for confirmation
  - Shows tx hash linked to Sepolia Etherscan after submission
  - Displays clear error messages for user-rejected or failed transactions
  - Disables button while wallet is disconnected or on wrong network

**Task 4.3 — Build reveal animation / polling UI**

- _Description:_ After mint, poll contract's `tokenURI` for new tokenId until set. Show shimmer/loading card, then flip to reveal artwork with affixes highlighted.
- _Acceptance criteria:_
  - Polling every 5s, gives up after 2 minutes with "Retry reveal" button that calls the admin endpoint `/api/reveal/retry` from Task 3.5 (demo-only convenience)
  - Reveal animation plays exactly once per new token
  - Affixes shown color-coded per rarity (gray/blue/purple/gold)
  - Works even if user navigates away and returns (picks up from current URI state)

### US-8: As a user, I want to view my NFT collection so that I can see what I've minted.

**Task 4.4 — Build gallery page**

- _Description:_ Query user's tokens via balance + `tokenOfOwnerByIndex` (enumerable extension) or by indexing `Transfer` events. Render grid of NFT cards.
- _Acceptance criteria:_
  - Gallery loads within 3s for users with ≤20 tokens
  - Empty state with "Mint your first NFT" CTA
  - Each card shows image, affixes (color-coded), token ID
  - Unrevealed tokens show placeholder with "Revealing..." indicator
  - Each card links to a detail view

### US-9: As a user, I want to fuse NFTs so that I can craft rarer assets.

**Task 4.5 — Build fusion UI**

- _Description:_ Multi-select 5 NFTs from gallery → "Fuse" button → confirmation modal → transaction → updated gallery.
- _Acceptance criteria:_
  - Cannot select fewer or more than 5
  - Ineligible NFTs (Splendid/Divine) are disabled with tooltip: "Cannot fuse rare NFTs"
  - Confirmation modal clearly states "This will permanently burn these 5 NFTs"
  - Successful fusion refreshes gallery and triggers reveal flow for the new token

### US-10: As a visitor, I want to see a public feed of recent mints so that I can explore the collection.

**Task 4.6 — Build public feed page**

- _Description:_ Frontend reads `TokenRevealed` events directly from the chain via ethers `contract.queryFilter(...)` over the deployment block range, sorted descending, capped at 50. No API route, no DB, no off-chain index.
- _Acceptance criteria:_
  - Feed updates on page refresh
  - Each item shows minter address (truncated), affixes, image, timestamp
  - Optional filter by rarity tier (Common / Rare+ / Splendid+ / Divine)
  - Handles no-mints empty state gracefully

---

## Epic 5: Deployment, Documentation, Presentation

### US-11: As a user, I want the dApp deployed and accessible so that I can use it without running anything locally.

**Task 5.1 — Deploy contract to Sepolia**

- _Description:_ Hardhat deploy script, source verification on Etherscan.
- _Acceptance criteria:_
  - Contract address recorded in README
  - Source verified on Sepolia Etherscan (green checkmark)
  - Deploy script is idempotent and committed
  - Constructor args documented

**Task 5.2 — Deploy Next.js app to Vercel**

- _Description:_ Configure env vars on Vercel, deploy from `main` branch, set up cron for reveal watcher.
- _Acceptance criteria:_
  - Live URL works end-to-end on Sepolia
  - Relayer key set as server-side env var (not `NEXT_PUBLIC_`)
  - Vercel cron configured to hit `/api/reveal/watch` every minute
  - README links to live deployment
  - Server-only env vars (`RELAYER_PRIVATE_KEY`, `OPENAI_API_KEY`, `PINATA_JWT`, `SEPOLIA_RPC_URL`) and client-safe vars (`NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`) are listed separately in the README's deployment checklist; never confuse the two

### US-12: As a grader, I want clear documentation so that I can understand and evaluate the project.

**Task 5.3 — Write README**

- _Description:_ Project overview, architecture diagram, setup steps, team members, concepts applied.
- _Acceptance criteria:_
  - Description, features, tech stack, local setup, deployed addresses, team members
  - Cites all tutorials/AI tools used
  - Architecture diagram (simple boxes-and-arrows is fine)
  - Links to deployed contract + live frontend + demo video

**Task 5.4 — Write 1–2 page concepts write-up**

- _Description:_ Explain cryptography & blockchain concepts applied. Covers hashing for randomness, access control modifiers, events for state indexing, ERC-721 standard, burn mechanics, IPFS content-addressing.
- _Acceptance criteria:_
  - Covers ≥6 distinct concepts from the course
  - Explicitly addresses the `block.prevrandao` randomness weakness and mentions Chainlink VRF as the production solution
  - Explains why off-chain AI generation requires the owner-only reveal pattern
  - Explains why **MetaMask + on-chain reads alone** are sufficient to replace a traditional auth + user-data backend (wallet address as identity, `ownerOf`/`balanceOf`/events as the user-data API)
  - Submitted as PDF or markdown in repo

**Task 5.5 — Prepare presentation deck and demo**

- _Description:_ 10-minute presentation with live demo. Every team member speaks.
- _Acceptance criteria:_
  - Slides cover intro, concepts, demo script, challenges
  - Demo script rehearsed; backup video recorded in case of network issues
  - Each member assigned specific speaking part
  - Pre-minted NFTs available on demo wallet as backup if live mint fails

---

## Role Assignment (4 members)

- **Tech Lead (you)** — NX setup, architecture, PR reviews, Epic 3 (relayer backend)
- **Smart Contract Engineer** — Epic 2 (Solidity + Hardhat tests)
- **Frontend Engineer** — Epic 4 (MetaMask wiring, mint flow, gallery, fusion UI)
- **QA & Docs** — Epic 2.5/2.6 (test support), Epic 5 (README, write-up, slides, demo video). Helps on frontend polish.

If 5 members: split Epic 3 into its own **Backend/AI Integration** role so the Tech Lead focuses on architecture and reviews.

---

## Risk Callouts

1. **OpenAI costs money.** DALL-E 3 is ~$0.04/image. 50 mints = $2. Fine for demo, but rate-limit the mint endpoint or you'll get drained if deployed publicly.
2. **Sepolia faucets are rate-limited.** Get testnet ETH in week 1, not demo day.
3. **Reveal failures are the biggest demo risk.** The admin retry endpoint (Task 3.5) is your safety net.
4. **Test coverage drives the grade.** 25 points for cryptography/blockchain depth — Hardhat tests (Tasks 2.5, 2.6) are where you prove you understand the contract. Don't skip.

---
