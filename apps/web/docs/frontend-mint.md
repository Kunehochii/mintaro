# Frontend — Mint Page & Reveal Animation

Implementation details for the mint flow UI and reveal experience on the `/mint` page.

---

## File Map

```
apps/web/src/
├── app/mint/
│   └── page.tsx                 # Mint page: wallet connect, theme input, dual buttons, landscape grid
├── components/
│   └── RevealCard.tsx           # Card flip animation, single affix badge, image preload
└── lib/reveal/
    └── prompt.ts                # buildMintPrompt accepts optional customSubject

libs/contract-client/src/lib/affix/
└── useAffixNFT.ts               # doMint accepts optional subject, passes to /api/reveal/watch
```

---

## Custom Subject / Theme Input

User types an optional theme word before minting (e.g., "cyberpunk dragon"). Replaces the random subject from the `SUBJECTS` array in `prompt.ts`.

### Data flow

```
Mint page                             API                             Pipeline
─────────                             ───                             ────────
[Theme input] → doMint(subject)
                    │
                    ▼
    fetch(/api/reveal/watch?subject=...)
                                          │
                                          ▼
                                   revealPipeline(tokenId, seed, minter, subject)
                                                                          │
                                                                          ▼
                                                              buildMintPrompt(affixes, idx, subject)
```

### Files

| File                                                    | Change                                                                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/lib/reveal/prompt.ts:19`                  | `buildMintPrompt(affixes, subjectIndex, customSubject?)` — uses custom subject if provided and non-empty, otherwise falls back to `SUBJECTS[subjectIndex]` |
| `apps/web/src/lib/reveal/pipeline.ts:23`                | `revealPipeline(tokenId, seed, minter, customSubject?)` — passes through to prompt builder                                                                 |
| `apps/web/src/app/api/reveal/watch/route.ts:56`         | Reads `?subject=` query param, forwards to pipeline                                                                                                        |
| `libs/contract-client/src/lib/affix/useAffixNFT.ts:247` | `doMint(subject?: string)` — URL-encodes subject into watch call                                                                                           |
| `apps/web/src/app/mint/page.tsx`                        | Text input (100 char max), placeholder "e.g. cyberpunk dragon..."                                                                                          |

### Edge cases

| Input                     | Behavior                                         |
| ------------------------- | ------------------------------------------------ |
| Empty string / whitespace | Falls back to random subject from `SUBJECTS`     |
| Trimmed + capped          | Subject trimmed, sliced to 100 chars             |
| Retry endpoint            | No custom subject available — always uses random |

---

## Dual Mint Buttons

Two buttons side by side:

| Button     | Color                                             | Action                                                                |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| **Random** | Pink (`bg-vapor-pink`, `hover:shadow-glow-pink`)  | `doMint()` — mints with auto-generated subject                        |
| **Theme**  | Green (`bg-vapor-mint`, `hover:shadow-glow-mint`) | `doMint(subject)` — mints with typed theme; disabled when input empty |

Both disabled during mint (`pending`, `confirming`, `revealing`). A pulsing status line appears above both buttons during mint phases.

**File:** `apps/web/src/app/mint/page.tsx` lines ~210-250

---

## Landscape Layout Transition

Before reveal: centered single column (`max-w-lg`, 512px).
After reveal starts: expands to two-column grid (`max-w-5xl`, 1024px).

```
Before (centered):               After (landscape):
┌──────────────────┐           ┌──────────────────┬──────────────────┐
│     Header        │           │     Header        │                  │
│  Theme input      │           │ ┌──────────────┐  │  ┌────────────┐  │
│  [Random][Theme]  │           │ │Theme input   │  │  │  Image     │  │
│  Tx hash          │           │ │[Random][Theme]│  │  │  + badge   │  │
└──────────────────┘           │ │Tx hash       │  │  │  + label   │  │
                                │ │Dev tools     │  │  └────────────┘  │
                                │ └──────────────┘  │                  │
                                └──────────────────┴──────────────────┘
```

- **Transition:** `transition-all duration-500` on container width
- **Grid:** `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Mobile:** columns stack vertically
- **Box styles:** Both control box and reveal box use identical styles (`rounded-card border border-vapor-purple/30 bg-vapor-surface/60 backdrop-blur-xl p-6`)
- **Proportional heights:** Reveal box uses `h-full` to match control column; controls use `flex flex-col justify-center` to center vertically
- **Trigger:** `showReveal = mint.status === 'revealing' || mint.status === 'revealed'`

**File:** `apps/web/src/app/mint/page.tsx`

---

## Card Flip Animation

3D CSS Y-axis card flip replacing the old fade-in animation.

### How it works

```
Shimmer state:                Flipping (700ms):           Done:
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│   Spinner    │     →      │    ╱   ╲    │     →      │    Image    │
│  "Revealing  │   rotateY  │   ╱     ╲   │            │  + badge   │
│  artwork..."  │    180°    │  ╲     ╱   │            │ + label    │
└─────────────┘            └─────────────┘            └─────────────┘
 Front face                  Mid-flip                   Back face
```

- **Perspective:** `1000px` on outer container (`style={{ perspective: '1000px' }}`)
- **3D container:** `transformStyle: 'preserve-3d'` on inner container
- **Front face:** Shimmer gradient + spinner + "Revealing artwork..." text. `backfaceVisibility: 'hidden'`
- **Back face:** Image (or "Image not available" fallback). Starts at `rotateY(180deg)`, `backfaceVisibility: 'hidden'`
- **Trigger:** `isShimmer` → `rotateY(0deg)`, all other states → `rotateY(180deg)`
- **Duration:** `duration-700` (700ms) matching the reveal→done timeout

### Image preload

Before flipping, the image is preloaded via `new Image()`. The flip only starts when `img.onload` fires, preventing the image from loading mid-animation.

```
if (imageUrl && animState === 'shimmer') {
  const img = new Image();
  img.onload = () => setAnimState('reveal');
  img.onerror = () => setAnimState('reveal');  // flip anyway on error
  img.src = imageUrl;
}
```

- Front face text adapts: "Revealing artwork..." → "Forging your affix..." when `imageUrl` is set but image hasn't loaded yet
- Fixed `aspect-square` container always present — no layout shift

**File:** `apps/web/src/components/RevealCard.tsx`

---

## Single Rarity Badge

After reveal, only the highest-rarity affix is displayed as a badge, instead of listing all affixes.

- **`getHighestAffix()`**: Filters for `trait_type === 'Affix'`, reduces to the entry with the highest `RARITY_RANK` (divine > splendid > rare > common)
- **`restyle()`**: Still reads all affixes to determine the card's border/glow color — unchanged behavior

**File:** `apps/web/src/components/RevealCard.tsx` lines 53-69, 174-180

---

## Dev Tools (Admin Retry)

Hidden admin panel for retrying failed reveals. Only available in development mode.

### Visibility

| Condition                                  | Visible?                                                      |
| ------------------------------------------ | ------------------------------------------------------------- |
| `NODE_ENV !== 'development'`               | No (always hidden in production)                              |
| `mint.status === 'idle'`                   | No (hidden before any mint action)                            |
| `mint.status !== 'idle'` but `!showReveal` | No (hidden during pending/confirming, before landscape split) |
| `showReveal === true`                      | Yes (appears in control box after landscape split)            |

### Positioning

- **Button:** `absolute top-3 left-3 z-10` — small text in the control box corner
- **Dropdown panel:** `absolute left-0 top-full mt-2 w-80` — drops below the button with backdrop blur

### Implementation

- **Component:** `DevToolsSection` — extracted to module level with `React.memo` to prevent re-renders and focus loss on the input
- **Props:** `visible`, `showAdminRetry`, `onToggle`, `retryTokenId`, `onTokenIdChange`, `retryResult`, `onRetry`
- **Endpoint:** Calls `POST /api/reveal/retry?tokenId=X` with `x-admin-secret` header

### Required env vars

| Variable                          | Where                     | Purpose                                     |
| --------------------------------- | ------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_REVEAL_ADMIN_SECRET` | `.env` / Vercel dashboard | Shared secret for the retry endpoint header |
| `REVEAL_ADMIN_SECRET`             | `.env` / Vercel dashboard | Server-side validation of `x-admin-secret`  |

### Manual usage (without UI)

```bash
curl -X POST \
  -H "x-admin-secret: <secret>" \
  "http://localhost:3000/api/reveal/retry?tokenId=5"
```

**File:** `apps/web/src/app/mint/page.tsx` lines 7-68 (component definition), lines ~315 and ~443 (usage)

---

## IPFS Gateway

Default gateway changed from `https://ipfs.io/ipfs/` → `https://gateway.pinata.cloud/ipfs/` due to DNS resolution failures with ipfs.io.

| File                                                  | Setting                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `.env:11`                                             | `NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/`       |
| `libs/contract-client/src/lib/gallery/constants.ts:4` | `DEFAULT_IPFS_GATEWAY` (fallback if env var not set)                |
| `apps/web/next.config.js:6`                           | Reads from `NEXT_PUBLIC_IPFS_GATEWAY` for `<Image>` remote patterns |
