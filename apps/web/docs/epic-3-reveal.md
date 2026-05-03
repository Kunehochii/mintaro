# Epic 3 — Relayer & AI Generation

Off-chain relayer that listens for mint events, generates AI artwork via DALL·E 3 using on-chain affix computation, pins images + metadata to IPFS via Pinata, and writes the token URI back on-chain.

## Architecture

```
MintRequested event
       │
       ▼
┌──────────────────────────────────────────────────┐
│  GET /api/reveal/watch (polling endpoint)         │
│  POST /api/reveal/retry (manual retry)            │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  revealPipeline(tokenId, seed, minter)            │
│                                                   │
│  1. getTokenURI() → skip if already set           │
│  2. computeAffixes(seed, minter, tokenId)         │
│  3. buildMintPrompt(affixes) → DALL·E prompt      │
│  4. generateImage(prompt) → image URL             │
│  5. pinImageAndMetadata(url, tokenId, affixes)    │
│  6. setTokenURI(tokenId, ipfsUri) → on-chain tx   │
│                                                   │
│  Up to 3 retries on failure                       │
└──────────────────────────────────────────────────┘
```

## File Map

```
apps/web/src/
├── app/api/reveal/
│   ├── watch/route.ts          # GET — poll MintRequested, run pipeline
│   └── retry/route.ts          # POST — admin retry for one tokenId
└── lib/reveal/
    ├── pipeline.ts              # Orchestrator: full reveal flow
    ├── affixes.ts               # Deterministic off-chain affix roll
    ├── prompt.ts                # Affix array → DALL·E prompt string
    ├── openai.ts                # DALL·E 3 call with 1 retry
    ├── pinata.ts                # IPFS pin image + metadata, verify CID
    ├── relayer.ts               # viem wallet → setTokenURI transaction
    └── state.ts                 # Last-processed-block persistence (JSON)
```

## Dependencies

| Package             | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `viem`              | Contract interaction (PublicClient, WalletClient) + keccak256 for affix hashing |
| `openai`            | DALL·E 3 image generation                                                       |
| `@pinata/sdk`       | IPFS pinning (image + metadata JSON)                                            |
| `@org/shared-types` | `Rarity` enum + `RARITY_PROBABILITIES` constants                                |

## Environment Variables

| Variable                       | Required | Used By                                         |
| ------------------------------ | -------- | ----------------------------------------------- |
| `RELAYER_PRIVATE_KEY`          | Yes      | `relayer.ts` — signs setTokenURI txs            |
| `OPENAI_API_KEY`               | Yes      | `openai.ts` — DALL·E 3 API calls                |
| `PINATA_JWT`                   | Yes      | `pinata.ts` — IPFS pinning                      |
| `SEPOLIA_RPC_URL`              | Yes      | All chain reads + writes                        |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes      | All contract interactions                       |
| `REVEAL_ADMIN_SECRET`          | Yes      | `retry/route.ts` — `x-admin-secret` header auth |

## API Endpoints

### GET /api/reveal/watch

Polls `MintRequested` events in batches of 10 blocks, starting from last processed block.

- **Idempotent**: skips tokens where `tokenURI` is already set
- **Persistent**: writes `apps/web/data/last-block.json` after each batch
- **Retries**: 3 attempts per token in the pipeline
- **Errors**: individual token failures logged, do not stop the batch

Response:

```json
{
  "processed": 2,
  "fromBlock": 5200000,
  "toBlock": 5200010,
  "latestBlock": 5200015,
  "results": [
    { "tokenId": 1, "success": true, "txHash": "0x..." },
    { "tokenId": 2, "success": true, "skip": true }
  ]
}
```

### POST /api/reveal/retry?tokenId=X

Manual retry for a specific token. Requires `x-admin-secret` header.

- Skips if `tokenURI` already set on-chain
- Looks up the token's `MintRequested` event to get seed + minter
- Runs full pipeline with up to 3 retries

Response (success):

```json
{ "success": true, "txHash": "0x...", "affixes": ["Divine", "Rare"] }
```

Response (already revealed):

```json
{ "success": true, "skip": true, "message": "URI already set on-chain" }
```

## Contract Dependency

The relayer works with the skeletal contract (`AffixNFT.sol`):

| Needs             | How Satisfied                                                   |
| ----------------- | --------------------------------------------------------------- |
| Mint detection    | Polls `MintRequested(tokenId, minter, seed)` events             |
| Affix computation | Off-chain via `affixes.ts` — `keccak256(seed, minter, tokenId)` |
| URI check         | Calls `tokenURI(tokenId)` — empty string means unrevealed       |
| URI write         | Calls `setTokenURI(tokenId, ipfsUri)` as `onlyOwner`            |

No contract modifications needed for Epic 3. The off-chain affix algorithm mirrors what Epic 2 will later implement on-chain using the same deterministic inputs.

## On-Chain / Off-Chain Affix Algorithm

Both the relayer (`affixes.ts`) and the future contract implementation use:

```
hash = keccak256(abi.encodePacked(seed, minter, tokenId))

count = hash[0] % 3 + 1                    // 1–3 affixes

for i in 0..count:
    lo = hash[(2 + i*2) % 32]
    hi = hash[(3 + i*2) % 32]
    bucket = (hi << 8 | lo) % 100           // 0–99

    bucket < 70  → Common   (70%)
    bucket < 90  → Rare     (20%)
    bucket < 98  → Splendid (8%)
    else         → Divine   (2%)
```

## Prompt Template

```
"A {affix1}, {affix2}, {affix3} {subject}, fantasy digital art,
{quality_modifiers}, 1:1 aspect ratio"
```

- **10 subjects**: dragon, phoenix, golem, wyvern, kraken, griffin, chimera, leviathan, shapeshifter, celestial beast
- **Subject selection**: `seed % 10`, rotates per retry attempt
- **Quality modifiers** driven by highest rarity present:
  - Divine → "divine radiance, glowing runes, celestial aura"
  - Splendid → "ornate details, shimmering light, intricate patterns"
  - Common/Rare → "clean linework, solid design"

## Image & Metadata Pipeline

1. DALL·E 3 → 1024×1024 PNG, standard quality, URL response
2. Download image from OpenAI URL → buffer
3. Pin image to IPFS via Pinata → `ipfs://{imageCid}`
4. Build ERC-721 metadata JSON:
   ```json
   {
     "name": "Affix #1",
     "description": "An AI-generated NFT with 2 rarity affixes: Divine, Rare.",
     "image": "ipfs://{imageCid}",
     "attributes": [
       { "trait_type": "Affix", "value": "Divine" },
       { "trait_type": "Affix", "value": "Rare" }
     ]
   }
   ```
5. Pin metadata JSON to IPFS → `ipfs://{metadataCid}`
6. Verify both CIDs by fetching from Pinata gateway
7. Call `setTokenURI(tokenId, "ipfs://{metadataCid}")`

## Nonce Management

`relayer.ts` uses a simple mutex (`nonceMutex`) to serialize `setTokenURI` calls. Nonce is cached between calls and cleared after each confirmed transaction. No concurrent transactions from the same wallet.

## State Persistence

`state.ts` reads/writes `apps/web/data/last-block.json`:

```json
{ "lastBlock": 5200010, "updatedAt": "2026-05-03T12:00:00.000Z" }
```

- Falls back to `0` if file missing
- Directory auto-created
- On Vercel serverless: `/tmp` can be used as alternative path

## Testing

```bash
# Reveal module unit tests (20 tests)
cd apps/web && npx jest

# Contract compilation
pnpm nx run contracts:compile

# Web app typecheck
cd apps/web && npx tsc --noEmit
```
