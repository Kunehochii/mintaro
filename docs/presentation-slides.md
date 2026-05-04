# Mintaro — Presentation Deck + Script

> Source material for a 10-minute, 4-person presentation + live demo of Mintaro, the AI-generated NFT gacha dApp on Ethereum Sepolia.
>
> **Issue:** [US-12: Documentation & Presentation](https://github.com/Kunehochii/mintaro/issues/12)
> **Last Feature:** [PR #19 — Public Feed](https://github.com/Kunehochii/mintaro/pull/19)

---

## Slide Deck + Script

Each section below maps to a slide. The script lines are written as **word-for-word speaking parts** assigned to Person A, B, C, or D.

---

### Slide 1 — Title

```
Mintaro
AI-Generated NFT Gacha on Ethereum Sepolia

Team: [Name A], [Name B], [Name C], [Name D]
Course · Date
github.com/Kunehochii/mintaro
```

**Person A (30s):**

> "Good morning everyone. We're presenting Mintaro — an AI-generated NFT gacha dApp built on Ethereum Sepolia. Our team of four built this over three weeks, from a monorepo scaffold to a fully deployed application. Here's what we'll cover."

---

### Slide 2 — Agenda

```
Agenda

1. Problem & Motivation
2. Architecture Overview
3. Core Features
4. Live Demo
5. Cryptography & Blockchain Concepts
6. Challenges & Lessons Learned
7. Q&A
```

**Person A (15s):**

> "We'll start with why we built this, then walk through the architecture, show you a live demo, and finish with the cryptography concepts we applied and the challenges we faced."

---

### Slide 3 — Problem & Motivation

```
What is a "gacha"?

Random reward mechanic from mobile games — every pull
could be common, or it could be legendary.

Our twist:

→ Gacha mechanics on-chain with verifiable rarity
→ AI-generated artwork via DALL·E 3
→ Art permanently stored on IPFS
→ Rarity "affixes" — Common → Rare → Splendid → Divine

Design philosophy: no database, no backend login.
The blockchain IS the database. MetaMask IS your identity.
```

**Person A (45s):**

> "So what is a gacha? If you've played Genshin Impact or opened FIFA packs, you know this mechanic. You pay for a random reward. The excitement comes from the mystery. Every pull could be trash, or it could be the rarest item in the game.
>
> We asked: what if we brought this on-chain? Every mint produces AI-generated artwork. The art is pinned to IPFS — truly owned by the minter, not hosted on our server. And each NFT gets rarity affixes — Common, Rare, Splendid, or Divine — that determine the visual style.
>
> And here's the key design decision: we have no database and no backend login. The Ethereum chain is our database. MetaMask is your identity. You are your wallet address."

---

### Slide 4 — Architecture

```
Nx Monorepo

┌───────────────────────────────────────────────────┐
│  apps/web          │  apps/contracts               │
│  Next.js 16 + R19  │  Hardhat + Solidity 0.8.28   │
│  Tailwind CSS      │  OpenZeppelin ERC-721         │
│  ethers v6         │  ethers v6                    │
├────────────────────┴───────────────────────────────┤
│  libs/shared-types  — Rarity enum, TypeChain ABIs  │
│  libs/contract-client — React hooks for the chain  │
└───────────────────────────────────────────────────┘

         Ethereum Sepolia (AffixNFT.sol)
                    │
         Relayer (API route)
         DALL·E 3 → Pinata IPFS → setTokenURI()
```

**Person A (60s):**

> "Let me walk through the architecture in sixty seconds. We used Nx to manage a monorepo with four projects. On the apps side, we have a Next.js frontend and a Hardhat contracts project. On the libs side, shared-types holds our Rarity enum and TypeChain-generated ABIs, and contract-client provides React hooks that wrap ethers — `useWallet`, `useAffixNFT`, `useUserTokens`, `useFuse`, and `usePublicFeed`.
>
> The smart contract — `AffixNFT.sol` — inherits from OpenZeppelin's ERC-721 and Ownable. It handles mint, fuse, and the reveal lifecycle through five custom events.
>
> The relayer is the only server-side component. It's a Next.js API route that watches for `MintRequested` events, generates art with DALL·E 3, pins it to IPFS via Pinata, and calls `setTokenURI` from a server-side wallet. The frontend polls `tokenURI` every five seconds and plays a reveal animation once the metadata lands."

---

### Slide 5 — Core Features

```
Four features — all driven by the contract

+---------+------------------------------------+-----------------------------+
| Mint    | Pay ETH → 1 NFT with 1–3 affixes  | mint() payable               |
|         | + AI artwork via DALL·E 3         | emits MintRequested          |
+---------+------------------------------------+-----------------------------+
| Gallery | Browse your collection            | Transfer events → ownership  |
|         | color-coded by rarity tier        | tokenURI() + getAffixes()    |
+---------+------------------------------------+-----------------------------+
| Fuse    | Burn 5 low-tier NFTs              | fuse([5 tokenIds])           |
|         | → craft 1 guaranteed rare+ NFT    | emits Fused                  |
+---------+------------------------------------+-----------------------------+
| Feed    | Browse 50 recent reveals          | TokenRevealed events         |
|         | no wallet required                | via read-only JsonRpcProvider|
+---------+------------------------------------+-----------------------------+

Rarity distribution: Common 70% · Rare 20% · Splendid 8% · Divine 2%
```

**Person B (45s):**

> "We built four features, all backed by the smart contract. First, Mint — you pay ETH, the contract assigns one to three random rarity affixes, and our off-chain relayer generates AI artwork and pins it to IPFS. Second, Gallery — your collection, color-coded by rarity. It works by querying `Transfer` events from the deployment block and deriving current ownership. Third, Fuse — burn five low-tier NFTs, and the contract mints one new NFT with guaranteed non-Common rarity. That's a deflationary mechanic: minus four supply per fuse. And fourth, the Public Feed — anyone can browse the fifty most-recent reveals across all wallets, no MetaMask needed. Each feature reads from the chain directly — no API, no database."

---

### Slide 6 — Reveal Pipeline

```
User mints             │     Relayer (off-chain)
                       │
  mint()               │     /api/reveal/watch
  ─────────────────────┼──▶  detects MintRequested
  emits:               │           │
  MintRequested        │     compute affixes
  (tokenId, seed)      │     via keccak256
                       │           │
                       │     build DALL·E prompt
                       │     "Divine dragon, fantasy art..."
                       │           │
                       │     DALL·E 3 → 1024×1024 PNG
                       │           │
                       │     Pin to IPFS → ipfs://<CID>
                       │           │
                       │     setTokenURI(tokenId, ipfs://...)
                       │     via relayer wallet (onlyOwner)
                       │     emits: TokenRevealed
                       │           │
  Frontend polls       │ ◀────────┘
  tokenURI every 5s
  → reveal animation plays

Why lazy reveal?

→ DALL·E 3 cannot run on-chain (cost, latency, API access)
→ Affixes determined on-chain at mint (verifiable, transparent)
→ onlyOwner on setTokenURI prevents fraudulent URIs
→ Only 46 bytes (the CID) stored on-chain — not the image
```

**Person B (60s):**

> "The reveal pipeline is the bridge between on-chain and off-chain. When you call `mint`, the contract emits a `MintRequested` event with your token ID, your address, and a random seed. Our API route, `/api/reveal/watch`, detects that event. It computes the affixes deterministically from the seed using keccak256 — so the rarity is fixed the moment you mint, even though the art hasn't been generated yet.
>
> Then it builds a DALL·E prompt from those affixes. For example: 'A Divine, Splendid dragon, fantasy digital art, glowing runes.' DALL·E 3 generates a 1024-by-1024 image. We download it and pin it to IPFS along with an ERC-721 metadata JSON file. Finally, the relayer wallet — which is the contract owner — calls `setTokenURI` to write the IPFS content hash on-chain. Only 46 bytes for the CID, not the full image.
>
> The frontend polls `tokenURI` every five seconds. When the URI appears, it flips the card and plays a reveal animation with the artwork and color-coded affix badges.
>
> Why go through all this? Because DALL·E 3 physically cannot run inside the EVM. The `onlyOwner` modifier on `setTokenURI` ensures that only our trusted relayer — not a random attacker — can finalize the metadata. The affixes themselves are on-chain and verifiable from the moment of mint."

---

### Slide 7 — Public Feed (PR #19)

```
Public Feed — browse 50 recent reveals, no wallet required

Browser (no MetaMask)
   │
   │  JsonRpcProvider (read-only, no signer)
   ▼
1. Query TokenRevealed events (→ tokenIds + URIs)
2. Query MintRequested events (→ seeds + minter addresses)
3. Parallel: getBlock() for timestamps
            getAffixes() for on-chain rarity data
4. joinFeedEntries() — merge, sort desc, cap at 50
5. Lazy IPFS metadata per card (fetched on mount, not bulk)

Architecture decisions:
→ No API route — the browser queries the chain directly
→ No database — all data from events + view functions
→ Wallet-less JsonRpcProvider — works in incognito
→ Lazy metadata — 50 cards but fetches IPFS only on render
→ Rarity filter — client-side: All / Common / Rare+ / Splendid+ / Divine

Added 22 files, 18 unit tests across @org/contract-client + apps/web

CORS edge case:
rpc.sepolia.org → no CORS headers, unusable from browser
Fix: ethereum-sepolia.publicnode.com works
```

**Person B (60s):**

> "The public feed was our last feature. The goal: let anyone browse the fifty most-recent revealed NFTs without connecting a wallet. No API route, no database, no off-chain indexer. Everything comes from the chain.
>
> Here's the data flow. First, we query `TokenRevealed` events from the deployment block using a read-only `JsonRpcProvider` — not MetaMask, just a pure JSON-RPC connection. That gives us token IDs and IPFS URIs. Then we query `MintRequested` events to get minter addresses and seeds. In parallel, we fetch block timestamps and on-chain affix data via `getAffixes`. A pure reducer — `joinFeedEntries` — merges everything, sorts descending by block number, and caps at fifty entries. Each card lazily fetches its IPFS metadata when it scrolls into view, so we're not firing fifty IPFS requests on page load.
>
> We also added a rarity filter — pill buttons for All, Common, Rare-plus, Splendid-plus, and Divine — all computed client-side.
>
> One critical edge case: the obvious public RPC, `rpc.sepolia.org`, returns zero CORS headers. You can't use it from a browser. We had to switch to a publicnode endpoint that supports browser requests. If you're a grader running this locally, make sure your `NEXT_PUBLIC_RPC_URL` points to a CORS-enabled provider."

---

### Slide 8 — 7 Cryptography & Blockchain Concepts

```
#  Concept                        Where in the Codebase
── ─────────────────────────────  ──────────────────────────────
1  keccak256 hashing              _entropy() → affix rolls
2  Access Control (Ownable)       setTokenURI → onlyOwner
3  Events for off-chain indexing  MintRequested, TokenRevealed,
                                  Transfer, Fused, AffixesAssigned
4  ERC-721 Standard               AffixNFT inherits ERC721URIStorage
5  Burn Mechanics                 fuse() → _burn() all 5 tokens
6  IPFS Content Addressing        ipfs://<CID> stored on-chain
7  block.prevrandao randomness    5-input hash → documented weakness
```

**Person C (60s):**

> "Now let's talk about the cryptography and blockchain concepts we applied. We identified seven distinct concepts from the course and we'll walk through the most important ones now.
>
> First, **keccak256 hashing** — our `_entropy` function in the contract hashes five inputs — timestamp, prevrandao, sender, token ID, and a nonce — to produce pseudo-random affix rolls. We'll come back to why this is weak in a moment.
>
> Second, **access control** via OpenZeppelin's Ownable pattern. `setTokenURI` and `setMintPrice` are guarded with `onlyOwner`. Only the relayer wallet can finalize reveals.
>
> Third, **events as off-chain indexing**. Instead of a database, our gallery queries `Transfer` events to derive ownership, and our feed queries `TokenRevealed` events to build the timeline. This is the standard pattern for dApps — events replace database inserts, and `eth_getLogs` replaces SELECT queries.
>
> Fourth, the **ERC-721 standard**. Our contract inherits from `ERC721URIStorage`, which means our NFTs work with MetaMask, Etherscan, and any OpenSea testnet deployment out of the box.
>
> Fifth, **burn mechanics**. The `fuse` function calls `_burn` on five tokens, permanently destroying them, and mints one new token with guaranteed non-Common rarity. Net supply reduction: minus four per fuse."
>
> [Person C continues on next slide...]

---

### Slide 9 — The `block.prevrandao` Weakness

```solidity
function _entropy(uint256 tokenId, uint256 nonce) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        block.timestamp,       // temporal uniqueness
        block.prevrandao,      // ← the weak link
        msg.sender,            // ties randomness to the caller
        tokenId,               // per-token uniqueness
        nonce                  // multiple rolls per mint
    )));
}
```

```
Why exploitable:

→ prevrandao is the RANDAO reveal from the PREVIOUS block
→ A validator knows it when proposing the NEXT block
→ Validator can compute the rarity outcome BEFORE including
  their own mint transaction
→ If unfavorable (e.g. Common), skip the block, try again
→ For a 2% Divine chance on mainnet, this is economically viable

Production fix: Chainlink VRF
→ Commit-reveal oracle generates randomness off-chain
→ Cryptographic proof verified on-chain via ecdsa.recover()
→ Validator cannot predict or bias the outcome

Why we documented rather than implemented VRF:
→ The course explicitly asks us to demonstrate understanding
→ ⚠️ "This randomness is pseudo-random and exploitable by validators.
         Production systems should use Chainlink VRF." — in our NatSpec
→ This is a learning outcome, not a hidden bug
```

**Person C (75s):**

> "Let me zoom into concept number seven — the `block.prevrandao` weakness — because it's the one the course specifically asks us to address.
>
> Here's our `_entropy` function. It hashes five inputs. The weak one is `block.prevrandao`. On Ethereum's beacon chain, each validator commits a random value during block proposal. The `prevrandao` opcode exposes the previous block's reveal. Here's the problem: a validator who proposes block N already knows the `prevrandao` value from block N-minus-one. If that validator also calls `mint` in their own block, they can compute the rarity outcome before their block is even finalized. If the outcome is unfavorable — say, a Common roll at 70% — they can choose to not include their own transaction. They lose the gas, but they get another shot at the 2% Divine on the next block.
>
> On Sepolia testnet with zero economic value, this doesn't matter. But on mainnet, where a Divine-tier NFT could trade for significant ETH, a validator has a financial incentive to manipulate the outcome.
>
> The production fix is Chainlink VRF. It uses a commit-reveal scheme: the oracle commits to a random value before seeing the request, then reveals it after, providing a cryptographic proof that's verified on-chain via `ecdsa.recover`. The validator cannot predict or bias the outcome because the randomness comes from the oracle, not the block context.
>
> We didn't implement VRF for this project because it requires LINK tokens and subscription setup on Sepolia — significant infrastructure overhead for a testnet demo. And more importantly, the course explicitly asks us to understand the weakness, not hide from it. Our NatSpec comment in the contract states exactly this: 'This randomness is pseudo-random and exploitable by validators. Production systems should use Chainlink VRF.' This is a demonstrated learning outcome."

---

### Slide 10 — MetaMask Replaces Traditional Auth

```
Traditional web app:         Mintaro (wallet-native):

Login → Password             MetaMask → BrowserProvider
Session Cookie               Wallet address = identity
DB: users table              No login screen
DB: nfts table               No user table
API: /auth/login             No sessions
API: /users/:id/collection   No cookies

How on-chain reads replace every backend endpoint:

 Backend Endpoint            Mintaro Equivalent
 ──────────────────────────  ─────────────────────────────────
 GET /auth/whoami            wallet.selectedAddress
 GET /users/:id/collection   Transfer events → ownership graph
 GET /collection/:tokenId    tokenURI(tokenId) → IPFS metadata
 POST /nfts/mint             contract.mint({value}) → direct tx
 POST /nfts/fuse             contract.fuse([ids]) → direct tx
 GET /feed                   TokenRevealed events via RPC
 GET /users/:id/balance      contract.balanceOf(address)

Benefits:
→ No passwords to leak       → No session hijacking
→ No GDPR compliance burden  → Self-custody of assets
→ Ownership verifiable on Etherscan by anyone
```

**Person C (45s):**

> "This next slide is about a concept that runs through our entire architecture. In a traditional web app, you'd have a login form, a users table, session cookies, and a REST API serving collection data. We have none of that.
>
> The wallet address is the user identity. MetaMask's `eth_requestAccounts` is the authentication step. The contract's `ownerOf`, `balanceOf`, and event logs are the user-data API.
>
> Look at this mapping. Every backend endpoint has a direct on-chain equivalent. Want to know what NFTs you own? Query `Transfer` events and derive ownership. Want to browse the feed? Query `TokenRevealed` events. Want to mint? Call the contract directly — no API proxy.
>
> The benefits go beyond simplicity. There are no passwords to leak. No session cookies to hijack. No GDPR compliance burden because we store zero personal data. And anyone can verify ownership, rarity, and provenance on Etherscan — no trust needed."

---

### Slide 11 — Challenges & Lessons Learned

```
Challenge                  Impact                  Solution
────────────────────────── ──────────────────────  ──────────────────────────
OpenAI costs money         $0.04/image, 50=$2     Documented, rate-limiting
Sepolia faucets limited    No ETH on demo day      Got ETH in week 1
Reveal failures            NFT stays unrevealed    /api/reveal/retry + 3x retry
CORS on public RPCs        Feed broken in browser  Switched to publicnode.com
Strict mint price check    Overpay also reverts    Design choice, documented
Nx monorepo learning       4 interdependent projs  Generators, tsconfig.base.json
TypeScript strict mode     Caught errors early     strict=true, noImplicitAny

Key takeaway:
The "no database" architecture worked at our scale.
For millions of NFTs → The Graph or Dune for indexing.
```

**Person D (45s):**

> "Before we jump into the demo, let me share the challenges we hit and what we learned.
>
> First, OpenAI costs real money. DALL·E 3 is four cents per image — 50 mints is two dollars. Fine for a demo, but you'd need rate limiting for a public deployment. Second, Sepolia faucets are aggressively rate-limited. We got our testnet ETH early, not on demo day. Third, reveal failures are the scariest demo risk. If DALL·E or IPFS fails, the NFT sits there unrevealed — so we built an admin retry endpoint as a safety net and the pipeline retries three times.
>
> Fourth, CORS was a surprise. The obvious Sepolia RPC returns no browser headers — you can't use it for the public feed. We had to find a CORS-enabled provider and document it. Fifth, our mint price check is strict equality — if you send one wei too much, it reverts. That's a deliberate design choice for simplicity. Sixth, the Nx monorepo had a learning curve — four interdependent projects — but Nx generators and a shared tsconfig made it manageable. And TypeScript strict mode from day one caught type errors before they hit runtime.
>
> The biggest lesson: the 'no database' architecture genuinely works at our scale. For a production app with millions of NFTs, you'd want an off-chain indexer like The Graph, but for this project, the chain served as our single source of truth."

---

### Slide 12 — Live Demo

```
Demo Flow (≈3 minutes)

 Step  Action                                Backup
 ────  ────────────────────────────────────  ────────────────────
  1    Open browser → live URL               Screenshot
  2    Connect MetaMask                      Pre-connected wallet
  3    Navigate to /mint                     —
  4    Mint Random (0.01 ETH)                Pre-minted tokens
  5    Reveal animation — art + affixes      Pre-revealed gallery
  6    Gallery — rarity-coded grid           —
  7    Fuse — select 5 → confirm → new NFT   Skip if no 5 eligible
  8    /feed in incognito (no MetaMask)      Existing data or empty
  9    Filter by rarity tier                 —

Contingency: "The network is slow — here's our backup video."
```

**Person D (90s — running the demo live):**

> "Alright, let me show you this working. I'm going to share my screen.
>
> This is our live deployment on Vercel. You can see the landing page with the vaporwave aesthetic — sunset gradients, scanlines overlay, retro grid background.
>
> I'm clicking Connect MetaMask in the top right. MetaMask pops up — I confirm — and now you can see my truncated wallet address in the navbar with a green connected indicator.
>
> Let's go to the Mint page. You can see the price — 0.01 ETH — and a theme input where you can type a subject for the AI, or leave it blank for a random creature. I'll click Mint Random. MetaMask asks me to confirm the transaction — I pay the exact amount plus gas. The transaction submits — there's the Etherscan link. Now the card shows 'Revealing' with a glitch animation while it polls the chain.
>
> Depending on the network, this takes five to fifteen seconds. If it takes too long, I have pre-minted tokens ready. But let's see — there it is. The card flips. You can see the AI-generated artwork and the affix badges, color-coded — that one rolled Rare and Common.
>
> Let's go to Gallery. Here's my full collection — each card glows with its highest rarity color. Clicking one goes to a detail view with the full metadata.
>
> Now let me show fusion. I go to the Fuse page, select five low-tier NFTs — you can see ineligible ones are dimmed if they're Splendid or Divine. I hit Fuse, confirm in the modal — 'This will permanently burn five NFTs' — and... the transaction confirms. A new token ID appears.
>
> Finally, let me open an incognito window — no MetaMask, no wallet — and go to `/feed`. You can see the public feed loads. Cards show the artwork, truncated minter address, affix badges, and relative timestamps. I can click the rarity pills at the top — let me filter to just Splendid-plus — and the grid updates instantly. All of this reads directly from the chain, no API, no database.
>
> That's Mintaro."

---

### Slide 13 — Q&A + Links

```
Deployed Resources

 Contract (Sepolia)  0xfaD55409f2CFca7551A85b3251cf406FE475d9E1
                      (verified on Etherscan)
 Frontend            https://mintaro.vercel.app
 GitHub              github.com/Kunehochii/mintaro
 Backup Demo Video   YouTube (unlisted)

 Team

 Person A    Person B    Person C    Person D
 [name]      [name]      [name]      [name]

 Questions?
```

**Person D (30s):**

> "Here are our deployed resources — the verified contract on Sepolia Etherscan, the live Vercel deployment, our GitHub repository, and the backup demo video. Our team — myself, Person A, Person B, and Person C.
>
> We're happy to take questions. Anyone?"

---

## 4-Person Script — Complete Run-Through

| Time      | Who   | What                                | Duration |
| --------- | ----- | ----------------------------------- | -------- |
| 0:00      | **A** | Title + Agenda (Slides 1–2)         | 45s      |
| 0:45      | **A** | Problem & Motivation (Slide 3)      | 45s      |
| 1:30      | **A** | Architecture (Slide 4)              | 60s      |
| **2:30**  |       | **_A total: 2:30_**                 |          |
| 2:30      | **B** | Core Features (Slide 5)             | 45s      |
| 3:15      | **B** | Reveal Pipeline (Slide 6)           | 60s      |
| 4:15      | **B** | Public Feed (Slide 7)               | 60s      |
| **5:15**  |       | **_B total: 2:45_**                 |          |
| 5:15      | **C** | 7 Concepts Overview (Slide 8)       | 60s      |
| 6:15      | **C** | block.prevrandao Weakness (Slide 9) | 75s      |
| 7:30      | **C** | MetaMask as Auth (Slide 10)         | 45s      |
| **8:15**  |       | **_C total: 3:00_**                 |          |
| 8:15      | **D** | Challenges (Slide 11)               | 45s      |
| 9:00      | **D** | Live Demo (Slide 12)                | 90s      |
| 10:30     | **D** | Q&A + Links (Slide 13)              | 30s      |
| **11:00** |       | **_D total: 2:45_**                 |          |

> **Note:** The live demo is the hardest part to time-control. Person D can run the demo faster (skip fusion, use pre-minted tokens) or Person C can trim 30s to keep the total at or under 10 minutes. The backup video eliminates all live-demo risk — if the network is slow, play the video instead.

---

## Supplementary Section — Task 5.4 Concepts Write-Up

> Extract this section as a standalone PDF or markdown file for the Task 5.4 deliverable (≥6 distinct cryptography & blockchain concepts + prevrandao weakness + MetaMask-as-auth explanation).

### Concept 1: Cryptographic Hashing for Pseudo-Randomness

**File:** `apps/contracts/contracts/AffixNFT.sol`

```solidity
function _entropy(uint256 tokenId, uint256 nonce) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        block.timestamp, block.prevrandao, msg.sender, tokenId, nonce
    )));
}
```

The `keccak256` hash function (Ethereum's native hash, a SHA-3 variant) transforms five inputs into a deterministic 256-bit output. Each `mint()` call invokes it up to six times: once for affix count (1–3), and once per affix to determine rarity via modulus on the hash output. The `nonce` parameter ensures each call within the same transaction produces a different hash. Without it, identical inputs would produce identical rarity rolls across all affix slots.

This is **not** cryptographically secure randomness — the contract's NatSpec explicitly documents this — but it is sufficient for a testnet gacha game with zero economic value.

---

### Concept 2: Access Control via Ownable Pattern

**File:** `apps/contracts/contracts/AffixNFT.sol`

```solidity
contract AffixNFT is ERC721URIStorage, Ownable {
    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner { ... }
    function setMintPrice(uint256 newPrice) external onlyOwner { ... }
}
```

OpenZeppelin's `Ownable` creates a single `owner` address (set to `msg.sender` at deploy) and guards functions with the `onlyOwner` modifier. In Mintaro, the deployer wallet is both the contract owner and the relayer wallet. `setTokenURI` is owner-only because it finalizes NFT metadata — without `onlyOwner`, anyone could write a fraudulent URI before the legitimate reveal completes, permanently blocking it (the contract prevents overwrites via `_tokenUriRevealed`).

---

### Concept 3: Events as Off-Chain State Indexing

**Files:** `AffixNFT.sol` (emit), `useUserTokens.ts`, `usePublicFeed.ts` (consume)

Five custom Solidity events communicate state changes to off-chain consumers:

| Event             | Parameters                           | Consumed By                    |
| ----------------- | ------------------------------------ | ------------------------------ |
| `MintRequested`   | `(tokenId, minter, seed)`            | Relayer, Feed                  |
| `TokenRevealed`   | `(tokenId, uri)`                     | Feed, Frontend polling         |
| `AffixesAssigned` | `(tokenId, affixes[])`               | Audit trail                    |
| `Transfer`        | `(from, to, tokenId)`                | Gallery (ownership derivation) |
| `Fused`           | `(burnedIds[5], newTokenId, minter)` | Frontend (tx receipt)          |

Events replace database `INSERT`/`UPDATE` operations. The gallery queries `Transfer` events from the deployment block and derives ownership by taking the last event per tokenId. The feed queries `TokenRevealed` events to build the timeline. This pattern is fundamental to Ethereum dApp architecture — `eth_getLogs` RPC calls replace SQL `SELECT` queries.

---

### Concept 4: ERC-721 Token Standard

**File:** `apps/contracts/contracts/AffixNFT.sol`

```solidity
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
contract AffixNFT is ERC721URIStorage, Ownable { ... }
```

The contract inherits from OpenZeppelin's `ERC721URIStorage`, providing `balanceOf`, `ownerOf`, `safeTransferFrom`, `approve`, `setApprovalForAll`, and `tokenURI`. The Metadata JSON Schema (stored on IPFS) follows the standard:

```json
{
  "name": "AffixNFT #1",
  "description": "A Divine, Rare dragon with glowing runes...",
  "image": "ipfs://QmImageCid",
  "attributes": [{ "trait_type": "Affix", "value": "Divine" }]
}
```

Because we implement the standard, our NFTs display in MetaMask's NFT tab and are interoperable with any ERC-721-compatible marketplace or explorer. The lazy reveal pattern (empty URI at mint → set after off-chain generation) is the standard approach for generative NFT projects like Bored Apes and Art Blocks.

---

### Concept 5: Burn Mechanics (Token Supply Economics)

**File:** `apps/contracts/contracts/AffixNFT.sol`

```solidity
function fuse(uint256[] calldata tokenIds) external {
    require(tokenIds.length == 5, "Must provide exactly 5 token IDs");
    // ownership checks, duplicate checks, Splendid/Divine guard
    for (uint256 i = 0; i < 5; i++) {
        _burn(tokenIds[i]);
    }
    _assignAffixes(newTokenId, true); // excludeCommon
    emit Fused(burnedIds, newTokenId, msg.sender);
}
```

Fusion is a deflationary game mechanic: 5 tokens are permanently destroyed (`_burn` clears ownership, approvals, and URI), and 1 new token is minted with guaranteed non-Common rarity. Net supply reduction: **-4 per fuse**. OpenZeppelin's `_burn` emits `Transfer(tokenId, to=address(0))`, decrements the owner's balance, and clears all token state.

Design choices: Splendid/Divine tokens cannot be fused (protects rare assets). Fusion costs zero ETH (encourages participation). Guaranteed rarity upgrade creates a meaningful risk/reward decision.

---

### Concept 6: IPFS Content Addressing

**Files:** `apps/web/src/lib/reveal/pinata.ts` (upload), `libs/contract-client/src/lib/gallery/ipfs.ts` (resolve)

IPFS is a content-addressed file system. Unlike HTTP (addressed by server location), IPFS addresses by content hash — `ipfs://Qm...` where the CID is a cryptographic hash of the file contents.

**Our pipeline:** DALL·E 3 generates an image → Pinata downloads and pins it → returns `ipfs://QmImageCid` → Pinata pins the metadata JSON → returns `ipfs://QmMetadataCid` → `setTokenURI(tokenId, "ipfs://QmMetadataCid")` stores only 46 bytes on-chain.

Benefits: integrity (tampering changes the CID), durability (any node can pin the data), and gas efficiency (46 bytes vs. 200KB stored on-chain). Resolution: the frontend converts `ipfs://` to `https://ipfs.io/ipfs/` with a configurable gateway.

---

### Concept 7: Pseudo-Randomness via `block.prevrandao` (and Why It's Weak)

**File:** `apps/contracts/contracts/AffixNFT.sol`

Ethereum's beacon chain generates a RANDAO value each epoch. The `prevrandao` opcode exposes the previous block's reveal to the EVM. This is exploitable because:

1. The `prevrandao` for block N was revealed in block N-1
2. A validator proposing block N knows the value before the block is finalized
3. The validator can compute `keccak256(timestamp, prevrandao, sender, tokenId, nonce)` before including their own `mint()` transaction
4. If the rarity outcome is unfavorable, the validator can omit their transaction and retry in the next block
5. For a 2% Divine chance on mainnet, this is economically viable

**The production fix — Chainlink VRF:**

- Request randomness from Chainlink's VRF Coordinator
- Chainlink's off-chain oracle generates a random number + cryptographic proof
- The proof is verified on-chain via `ecdsa.recover()` to confirm oracle authenticity
- The verified random value triggers affix assignment
- The commit-reveal scheme means the oracle cannot selectively respond based on the outcome

**Why we documented rather than implemented VRF:** The course explicitly requires demonstrating understanding of this weakness. Our NatSpec comment states: _"This randomness is pseudo-random and exploitable by validators. Production systems should use Chainlink VRF."_ On Sepolia with zero economic value, pseudo-randomness is acceptable. This is a learning outcome, not a shortcut.

---

### Why MetaMask + On-Chain Reads Replace Traditional Auth + Backend

A traditional web application needs three layers: authentication (who are you?), authorization (what can you do?), and a user-data database (what's yours?). Mintaro replaces all three:

**1. Authentication → Wallet Address**

No login form, no password, no session cookie. `eth_requestAccounts` prompts MetaMask. The wallet address IS the user identity — globally unique, backed by secp256k1 private keys, cannot be impersonated.

**2. Authorization → Smart Contract Modifiers + EVM**

Can you mint? `msg.value == mintPrice` (economic authorization). Can you fuse? `ownerOf(tokenId) == msg.sender` for all 5 (ownership authorization). Can you reveal? `onlyOwner` modifier. Authorization is enforced by the EVM itself, not backend middleware.

**3. User Data → On-Chain State**

| Traditional                                 | Mintaro Equivalent                  |
| ------------------------------------------- | ----------------------------------- |
| `SELECT * FROM nfts WHERE owner = $1`       | `Transfer` events → ownership graph |
| `SELECT * FROM nfts JOIN metadata`          | `tokenURI()` → IPFS metadata fetch  |
| `SELECT * FROM reveals ORDER BY block DESC` | `TokenRevealed` events via RPC      |
| `SELECT balance FROM users`                 | `contract.balanceOf(address)`       |

The ONLY server-side code is the reveal pipeline. It converts on-chain events into AI-generated art. It doesn't store user data, manage sessions, or serve API responses. The frontend reads everything from the chain directly.

---

## Pre-Presentation Checklist

### Technical

- [ ] Sepolia RPC endpoint is responsive (`curl $SEPOLIA_RPC_URL`)
- [ ] Contract verified on Etherscan ([check](https://sepolia.etherscan.io/address/0xfaD55409f2CFca7551A85b3251cf406FE475d9E1))
- [ ] Vercel deployment is live and loads in 3s
- [ ] MetaMask is on Sepolia (chainId 11155111) — NOT mainnet
- [ ] Wallet has ≥0.03 ETH
- [ ] At least 2-3 pre-revealed NFTs in the wallet
- [ ] `/api/reveal/retry` endpoint accessible with admin secret

### Content

- [ ] Backup demo video recorded and uploaded (unlisted YouTube)
- [ ] Screenshots of each page as fallback
- [ ] Slide deck exported from this markdown
- [ ] Architecture diagram rendered as PNG

### Environment

- [ ] Presentation laptop tested with projector/TV
- [ ] Stable internet (phone hotspot as backup)
- [ ] Browser has MetaMask installed and unlocked
- [ ] No other tabs connected to MetaMask

---

## References

- [Nx Documentation](https://nx.dev)
- [OpenZeppelin ERC-721](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [ethers.js v6](https://docs.ethers.org/v6/)
- [EIP-721: Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Chainlink VRF v2.5](https://docs.chain.link/vrf/v2-5/overview)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata IPFS Pinning](https://docs.pinata.cloud/)
- [OpenAI DALL-E 3 API](https://platform.openai.com/docs/guides/images)
- [Ethereum RANDAO](https://eth2book.info/capella/part2/building_blocks/randomness/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [MetaMask Ethereum Provider API](https://docs.metamask.io/wallet/reference/provider-api/)

---

> **File:** `docs/presentation-slides.md`
> **Purpose:** Source material for the US-12 presentation. Contains a full 4-person script and the Task 5.4 concepts write-up. Slides can be extracted to Google Slides, PowerPoint, or reveal.js. The "Concepts Write-Up" section can be exported as a standalone PDF.
