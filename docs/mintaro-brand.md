# Mintaro — Brand & Design System

## About Mintaro

**Mintaro** is an AI-generated NFT gacha dApp deployed on Ethereum Sepolia. Users pay ETH to mint NFTs that receive randomized rarity affixes (Common → Rare → Splendid → Divine) and AI-generated artwork via DALL-E 3, pinned permanently to IPFS. The collection mechanic rewards users for fusing 5 base NFTs into 1 guaranteed-rare asset. The app is fully wallet-native — MetaMask is the sole identity provider, no accounts or passwords needed.

**Core pillars:**

- Gacha randomness — every mint is a mystery reveal
- On-chain permanence — art and ownership live on Ethereum
- Rarity progression — collect, fuse, ascend
- Aesthetic — retro-futuristic, dreamy, neon-soaked

---

## Prompt 1 — Logo Generation (for Gemini / image AI)

```
Create a logo for "Mintaro" — an AI-generated NFT gacha app on Ethereum.

Visual style: Vaporwave aesthetic — sunset gradients blending hot pink (#FF71CE),
electric cyan (#01CDFE), and deep purple (#B967FF) on a near-black background
(#0F0F23). Think 80s retro-futurism meets blockchain: glowing neon outlines,
subtle grid perspective, dreamy atmosphere.

Logo concept: A stylized mint leaf or gem/crystal icon fused with a digital/pixel
treatment — slightly glitched edges or scanline texture to reinforce the retro-tech
mood. The crystal or gem should feel rare and collectible, like a gacha prize.
Optional: a faint hexagonal or grid pattern behind the icon suggesting Ethereum/Web3.

Wordmark "Mintaro" in a futuristic, slightly geometric sans-serif (similar to
Orbitron or Rajdhani). Letters should have a subtle neon glow, as if backlit in
pink-to-cyan gradient. The "M" could optionally incorporate the gem/crystal motif.

Overall feel: premium collectible game meets vaporwave dream — exciting, mysterious,
and slightly nostalgic. Not corporate. Not childish. Somewhere between a limited-edition
trading card brand and a retro arcade screen.

Deliver on a transparent or very dark background. Provide both horizontal
(icon + wordmark side by side) and stacked (icon above wordmark) variants.
```

---

## Prompt 2 — Vaporwave Design System

### Overview

Mintaro uses the **Vaporwave** aesthetic — retro-futuristic, neon-soaked, dreamy, 80s/90s-inflected. It pairs well with the gacha/surprise reveal mechanic and the NFT collectible theme.

---

### Color Palette

| Token             | Hex       | Usage                                              |
| ----------------- | --------- | -------------------------------------------------- |
| `--vapor-pink`    | `#FF71CE` | Primary accents, CTA borders, rarity glow (Divine) |
| `--vapor-cyan`    | `#01CDFE` | Secondary accents, links, interactive highlights   |
| `--vapor-mint`    | `#05FFA1` | Success states, "Rare" rarity color                |
| `--vapor-purple`  | `#B967FF` | Splendid rarity, gradient midpoints, card glow     |
| `--vapor-bg`      | `#0F0F23` | Page background (OLED-safe deep navy-black)        |
| `--vapor-surface` | `#1A1A2E` | Card/panel backgrounds                             |
| `--vapor-text`    | `#F8FAFC` | Primary body text                                  |
| `--vapor-muted`   | `#94A3B8` | Secondary text, labels                             |
| `--vapor-gold`    | `#FBBF24` | Divine rarity, highest-tier accents                |

**Rarity color mapping:**
| Rarity | Color | Hex |
|---|---|---|
| Common | Gray | `#94A3B8` |
| Rare | Mint/Green | `#05FFA1` |
| Splendid | Purple | `#B967FF` |
| Divine | Gold | `#FBBF24` |

**Sunset gradient (hero / reveal backgrounds):**

```css
background: linear-gradient(180deg, #ff71ce 0%, #b967ff 50%, #01cdfe 100%);
```

---

### Typography

| Role           | Font           | Weight  | Notes                        |
| -------------- | -------------- | ------- | ---------------------------- |
| Display / Logo | Orbitron       | 700     | All-caps headings, token IDs |
| Heading        | Orbitron       | 400–600 | Section titles, card names   |
| Body           | Exo 2          | 300–500 | Paragraphs, descriptions     |
| Mono / Address | JetBrains Mono | 400     | Wallet addresses, tx hashes  |

```css
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Rules:**

- Body text minimum 16px, line-height 1.6
- Heading line-height 1.2–1.3
- Wallet addresses always monospace, truncated to `0x1234…abcd`

---

### Effects & Visual Language

#### Neon Glow

```css
/* Text glow */
text-shadow:
  0 0 10px #ff71ce,
  0 0 20px #ff71ce80;

/* Border/box glow */
box-shadow:
  0 0 12px #b967ff,
  0 0 24px #b967ff40;
```

#### Retro Grid (hero background)

```css
background-image:
  linear-gradient(rgba(255, 113, 206, 0.15) 1px, transparent 1px),
  linear-gradient(90deg, rgba(1, 205, 254, 0.15) 1px, transparent 1px);
background-size: 40px 40px;
perspective: 500px;
```

#### VHS Scanlines Overlay

```css
.scanlines::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

#### Glitch Effect (unrevealed/loading NFTs)

```css
@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(2px, -2px);
  }
  60% {
    transform: translate(-1px, 1px);
    filter: hue-rotate(-90deg);
  }
  80% {
    transform: translate(1px, -1px);
  }
  100% {
    transform: translate(0);
  }
}
/* Apply during "Revealing..." state only */
```

#### Card Glass Surface

```css
background: rgba(26, 26, 46, 0.8);
border: 1px solid rgba(185, 103, 255, 0.3);
backdrop-filter: blur(12px);
border-radius: 12px;
```

---

### Component Patterns

#### NFT Card States

| State               | Treatment                                           |
| ------------------- | --------------------------------------------------- |
| Unrevealed          | Dark card, glitch animation, pulsing shimmer border |
| Revealing           | Gradient border cycling pink → cyan → purple        |
| Revealed (Common)   | Gray glow, subdued                                  |
| Revealed (Rare)     | Mint/green glow `#05FFA1`                           |
| Revealed (Splendid) | Purple glow `#B967FF`                               |
| Revealed (Divine)   | Gold glow `#FBBF24`, particle shimmer               |

#### Buttons

- Primary CTA: `bg: #FF71CE`, dark text, glow on hover
- Secondary: transparent with `border: 1px solid #B967FF`, cyan glow on hover
- Destructive (Fuse / Burn): `border: 1px solid #FF71CE`, warning glow, requires confirmation modal
- Disabled: `opacity-40`, no cursor-pointer

#### Network / Wallet States

- Wrong network: amber banner, `wallet_switchEthereumChain` CTA
- Not installed: link to metamask.io
- Connected: truncated address in monospace, subtle green dot indicator

---

### Animation Timing

| Interaction     | Duration | Easing                       |
| --------------- | -------- | ---------------------------- |
| Button hover    | 150ms    | ease-out                     |
| Card hover lift | 200ms    | ease-out                     |
| Reveal flip     | 600ms    | cubic-bezier(0.4, 0, 0.2, 1) |
| Glitch loop     | 400ms    | steps(1)                     |
| Gradient cycle  | 3000ms   | linear, infinite             |

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### CSS Variables (`:root`)

```css
:root {
  --vapor-pink: #ff71ce;
  --vapor-cyan: #01cdfe;
  --vapor-mint: #05ffa1;
  --vapor-purple: #b967ff;
  --vapor-gold: #fbbf24;
  --vapor-bg: #0f0f23;
  --vapor-surface: #1a1a2e;
  --vapor-text: #f8fafc;
  --vapor-muted: #94a3b8;

  --glow-pink: 0 0 12px #ff71ce, 0 0 24px #ff71ce40;
  --glow-cyan: 0 0 12px #01cdfe, 0 0 24px #01cdfe40;
  --glow-purple: 0 0 12px #b967ff, 0 0 24px #b967ff40;
  --glow-gold: 0 0 12px #fbbf24, 0 0 24px #fbbf2440;

  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Exo 2', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-card: 12px;
  --radius-btn: 8px;
}
```

---

### Implementation Checklist

- [ ] Sunset gradient present in hero / reveal backgrounds
- [ ] Neon glow applied to primary text and borders
- [ ] Retro grid visible in hero section
- [ ] Glitch effect only during "Revealing..." state (not persistent)
- [ ] Rarity colors consistently applied (gray / mint / purple / gold)
- [ ] VHS scanline overlay present but subtle (`opacity < 0.2`)
- [ ] All fonts loaded: Orbitron, Exo 2, JetBrains Mono
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Wallet addresses in monospace, truncated
- [ ] No emojis as icons — use Lucide or Heroicons SVGs
- [ ] All clickable elements have `cursor-pointer`
- [ ] Responsive: 375px / 768px / 1024px / 1440px
