# 🎨 Meridian Design System & Styleguide

> **Design Direction:** Monochrome Dark Neumorphism
> **Brand Identity:** High-Precision Autonomous Financial Mission Control
> **Theme:** `data-theme="meridian"`
> **Version:** 2.0.0 (September 2026) — converted from v1.0.0 Glassmorphism

---

### What changed from v1.0.0

Meridian keeps its identity — monochrome palette, tri-font hierarchy, semantic state colors — but the surface language moves from **translucent frosted glass** to **soft-extruded matte plastic**. Panels no longer let content show through them; instead they appear molded out of the same material as the background, defined entirely by dual directional shadows (a dark shadow and a light shadow) rather than blur, transparency, or borders. Where glassmorphism said "a pane of glass floating over a scene," neumorphism says "a single block of material, carved and pressed."

---

## 1. Design Philosophy

Meridian's aesthetic is built on the concept of **"A Heartbeat, Not a Homepage"**:
- **Monochrome Dark Neumorphism:** Every surface is molded from the same near-black material as the page itself — no transparency, no see-through layering. Depth comes purely from light, not from what's behind a panel.
- **Single-Source Directional Shadow:** Every panel simulates one soft overhead light source via a paired dark shadow (cast away from the light) and a faint light shadow (caught facing the light) — giving tactile, physical depth without a single border line.
- **Kinetic Micro-Interactions:** 60fps canvas particle fields, cards that rise further off the surface on hover and press *into* the surface on click, breathing glows, and ticking financial counters provide constant visual feedback of a living, autonomous system.
- **Typographic Discipline:** A tri-font hierarchy blending warm editorial serif typography for numbers with clean technical grotesque for interface labels and strict monospace for audit ledgers.

---

## 2. Color Palette & Token System

Neumorphism needs a **solid base surface color**, not a transparent one — the dual-shadow illusion only reads correctly against a real color, not an alpha layer over unknown content. Semantic state colors are unchanged from v1.0.0.

### 2.1 CSS Variables (`:root`)

```css
:root, [data-theme="pulse"], [data-theme="meridian"] {
  /* Surface Depths */
  --ink: #0c0c0e;                 /* Page background — deep charcoal, not pure black */
  --neu-base: #1c1c1f;            /* Base material color for all panels */
  --neu-base-raised: #202023;     /* Slightly lighter base for floating/top-layer panels */

  /* Shadow Pair (defines the "single overhead light" illusion) */
  --neu-shadow-dark: rgba(0, 0, 0, 0.65);
  --neu-shadow-light: rgba(255, 255, 255, 0.045);
  --neu-shadow-dark-soft: rgba(0, 0, 0, 0.4);
  --neu-shadow-light-soft: rgba(255, 255, 255, 0.03);

  /* Semantic State Colors (unchanged) */
  --recovered: #ffffff;
  --recovered-soft: rgba(255, 255, 255, 0.09);
  --recovered-glow: rgba(255, 255, 255, 0.35);

  --at-risk: #e4e4e7;
  --at-risk-soft: rgba(255, 255, 255, 0.05);
  --at-risk-glow: rgba(255, 255, 255, 0.2);

  --critical: #a1a1aa;
  --critical-soft: rgba(255, 255, 255, 0.06);
  --critical-glow: rgba(255, 255, 255, 0.3);

  --signal: #ffffff;
  --signal-soft: rgba(255, 255, 255, 0.08);
  --signal-glow: rgba(255, 255, 255, 0.45);

  /* Financial Ledgers */
  --ledger: #ffffff;
  --ledger-muted: #a1a1aa;

  /* Radius — neumorphism reads best with generous, consistent rounding */
  --radius-pulse: 20px;
  --radius-pulse-sm: 14px;
}
```

### 2.2 Color Tokens & Intent

| Token | Hex / RGBA | Role & Visual Intent |
| :--- | :--- | :--- |
| `--ink` | `#0c0c0e` | Page background. Deliberately not pure black — neumorphic shadows need a true color to cast against. |
| `--neu-base` | `#1c1c1f` | Default panel material — same tone family as `--ink`, differentiated only by shadow. |
| `--neu-base-raised` | `#202023` | Modals, dropdowns, top-layer surfaces — a touch lighter to read as "closer" to the viewer. |
| `--neu-shadow-dark` | `rgba(0,0,0,0.65)` | Cast shadow, opposite the light source — gives panels their downward mass. |
| `--neu-shadow-light` | `rgba(255,255,255,0.045)` | Catch-light, same side as the light source — gives panels their upward highlight. |
| `--recovered` | `#ffffff` | Settled/recovered payments, active pulse nodes, highest emphasis. |
| `--at-risk` | `#e4e4e7` (Zinc 200) | Degraded gateway rails, queued incidents, pending actions. |
| `--critical` | `#a1a1aa` (Zinc 400) | Outages requiring human ops escalation, fallback paths. |
| `--ledger-muted` | `#71717a` (Zinc 500) | Secondary metadata, timestamps, protocol schemas. |

---

## 3. Typography System

Unchanged from v1.0.0 — Meridian combines three distinct Google Fonts loaded with `display: swap` for instant zero-layout-shift rendering:

```
Fraunces          Space Grotesk        IBM Plex Mono
(Serif Display)   (Technical UI)       (Financial Monospace)
"₹1.08 Cr"        "WAR ROOM CONSOLE"   "ERR: 86,660 | 94.2% CONF"
```

### 3.1 Font Family Mapping

| Role | Font Family | Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Display** | `Fraunces` | `--font-display` | Large revenue statistics, hero headings, financial metrics. |
| **UI & Headings** | `Space Grotesk` | `--font-ui` | Body copy, section titles, buttons, navigation, badges. |
| **Data & Ledger** | `IBM Plex Mono` | `--font-mono` | Audit trail timestamps, error codes, ERR formulas, code. |

### 3.2 Typography Scale & Utility Classes

```css
/* Hero Numbers & Statements */
.text-display-xl {
  font-family: var(--font-display);
  font-size: 4.5rem;      /* 72px */
  line-height: 1.0;
  font-weight: 340;
  letter-spacing: -0.02em;
}

/* Section Hero Numbers */
.text-display-md {
  font-family: var(--font-display);
  font-size: 2.25rem;     /* 36px */
  line-height: 1.05;
  font-weight: 380;
  letter-spacing: -0.01em;
}

/* Card & Section Headings */
.text-heading {
  font-family: var(--font-ui);
  font-size: 1.25rem;     /* 20px */
  line-height: 1.3;
  font-weight: 600;
}

/* Body & Explanations */
.text-body {
  font-family: var(--font-ui);
  font-size: 0.9375rem;   /* 15px */
  line-height: 1.5;
  font-weight: 400;
}

/* Numbers, Values & Statistics */
.text-data {
  font-family: var(--font-mono);
  font-size: 0.875rem;    /* 14px */
  line-height: 1.4;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Captions, Subtext & Badges */
.text-micro {
  font-family: var(--font-ui);
  font-size: 0.75rem;     /* 12px */
  line-height: 1.3;
  font-weight: 500;
}
```

### 3.3 Universal Text Alignment Standard
All descriptive paragraphs adhere to clean justified typesetting:

```css
p, .text-justify, .text-body, .card-description {
  text-align: justify;
  text-justify: inter-word;
  text-align-last: left;
}
```

---

## 4. Neumorphic Elevation & Surface Architecture

Meridian panels are molded, not layered. Every surface uses the **same base color** as its parent and is defined purely by a dual-shadow pair — no `backdrop-filter`, no transparency, no border lines. Convex shadows (dark bottom-right, light top-left) read as "popped out"; inverting them to `inset` reads as "pressed in" — used for chips, input fields, and anything meant to feel recessed.

### 4.1 Base Panel (`.neu-panel`)
Used for static sections, structural grids, and containers — reads as gently raised off the page:
```css
.neu-panel {
  background: var(--neu-base);
  border-radius: var(--radius-pulse);
  border: none;
  box-shadow:
    8px 8px 20px var(--neu-shadow-dark),
    -6px -6px 16px var(--neu-shadow-light);
}
```

### 4.2 Raised Panel (`.neu-panel-raised`)
Used for floating modals, tooltips, and top-layer drawers — a deeper, wider shadow throw simulates it sitting closer to the light source:
```css
.neu-panel-raised {
  background: var(--neu-base-raised);
  border-radius: var(--radius-pulse);
  border: none;
  box-shadow:
    14px 14px 32px var(--neu-shadow-dark),
    -10px -10px 26px var(--neu-shadow-light);
}
```

### 4.3 Pressed / Recessed Pill (`.neu-pill`)
Used for badges, status chips, and protocol tags — inverted shadows make it read as carved *into* the surface rather than sitting on top of it:
```css
.neu-pill {
  background: var(--neu-base);
  border-radius: 999px;
  border: none;
  box-shadow:
    inset 3px 3px 6px var(--neu-shadow-dark),
    inset -2px -2px 5px var(--neu-shadow-light);
}
```

### 4.4 Recessed Input / Well (`.neu-well`)
New in v2.0.0 — for input fields, search bars, or any element that should feel like a shallow indentation in the material rather than an object sitting on it:
```css
.neu-well {
  background: var(--neu-base);
  border-radius: var(--radius-pulse-sm);
  border: none;
  box-shadow:
    inset 4px 4px 10px var(--neu-shadow-dark-soft),
    inset -3px -3px 8px var(--neu-shadow-light-soft);
}
```

---

## 5. Interaction & Motion System

### 5.1 Card Interaction (`.card-hover`)
Instead of glass's "pop toward the viewer with a glow," neumorphic cards **rise further off the surface on hover** (shadow spreads wider and darker) and **press into the surface on click** (shadow flips to inset) — a physically intuitive convex-to-concave transition:

```css
.card-hover {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, box-shadow;
  position: relative;
}

.card-hover:hover {
  transform: translateY(-6px) translateZ(0);
  box-shadow:
    14px 14px 30px var(--neu-shadow-dark),
    -10px -10px 24px var(--neu-shadow-light);
  z-index: 20;
}

.card-hover:active {
  transform: translateY(0) translateZ(0);
  box-shadow:
    inset 6px 6px 14px var(--neu-shadow-dark),
    inset -4px -4px 10px var(--neu-shadow-light);
}
```

### 5.2 Button Hierarchy

#### Secondary Neu Button (`.neu-button`)
```css
.neu-button {
  background: var(--neu-base);
  border: none;
  border-radius: var(--radius-pulse-sm);
  box-shadow:
    6px 6px 14px var(--neu-shadow-dark),
    -4px -4px 10px var(--neu-shadow-light);
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.neu-button:hover {
  box-shadow:
    8px 8px 18px var(--neu-shadow-dark),
    -6px -6px 14px var(--neu-shadow-light);
  transform: translateY(-1px);
}
.neu-button:active {
  box-shadow:
    inset 4px 4px 10px var(--neu-shadow-dark),
    inset -3px -3px 8px var(--neu-shadow-light);
  transform: translateY(0);
}
```

#### Primary Accent Action Button (`.neu-button-primary`)
Primary actions keep the same convex/concave language but add a faint `--signal-glow` bloom so they read as the emphasized choice without breaking the monochrome palette:
```css
.neu-button-primary {
  background: var(--neu-base-raised);
  border: none;
  border-radius: var(--radius-pulse-sm);
  box-shadow:
    8px 8px 20px var(--neu-shadow-dark),
    -6px -6px 16px var(--neu-shadow-light),
    0 0 24px 0 var(--signal-glow);
  color: #ffffff;
  font-weight: 600;
}
.neu-button-primary:hover {
  box-shadow:
    10px 10px 24px var(--neu-shadow-dark),
    -8px -8px 20px var(--neu-shadow-light),
    0 0 36px 0 var(--signal-glow);
  transform: translateY(-1px);
}
.neu-button-primary:active {
  box-shadow:
    inset 5px 5px 12px var(--neu-shadow-dark),
    inset -4px -4px 10px var(--neu-shadow-light);
  transform: translateY(0);
}
```

### 5.3 Keyframe Animations

#### Recovery Exhale (`@keyframes recoveryExhale`)
A soft bloom that radiates across a card upon successful recovery — now layered on top of (not replacing) the resting neu-shadow, so the card never loses its molded form:
```css
@keyframes recoveryExhale {
  0% {
    box-shadow: 8px 8px 20px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light), 0 0 0px rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 8px 8px 20px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light), 0 0 40px rgba(255, 255, 255, 0.5);
  }
  100% {
    box-shadow: 8px 8px 20px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light), 0 0 20px rgba(255, 255, 255, 0.2);
  }
}
```

#### Rollback Flinch (`@keyframes rollbackFlinch`)
Unchanged — a positional shake indicating a rollback or safety abort, independent of surface style:
```css
@keyframes rollbackFlinch {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
```

---

## 6. Signature Visual Components

### 6.1 Transaction Pulse Field (`PulseField`)
- **Technology:** HTML5 2D Canvas with requestAnimationFrame.
- **Visual:** 70+ interconnected nodes simulating live transaction flows across payment switches, rendered over the flat `--ink` canvas rather than behind a glass layer.
- **Dynamic Physics:** Nodes dynamically speed up during failure spikes and emit expanding white concentric ripples when an autonomous recovery is confirmed.

### 6.2 Immutable Terminal Audit Ledger (`AuditTrail`)
- **Style:** Monospace command-line output in a `.neu-well` (recessed) container with alternating row zebra-striping — the recessed treatment reinforces that this is a read-only, tamper-evident log.
- **Colors:** White check badges rendered as small `.neu-pill` chips, amber-toned zinc warnings for rollbacks, and dim zinc hashes.
- **Header:** Live status ping dot (pulsing white circle) sitting in a `.neu-pill`.

### 6.3 Confidence & Autonomy Gauge (`ConfidenceGauge`)
- **Visual:** Circular SVG stroke meter set inside a `.neu-panel`, visualizing the Bayesian Autonomy Gate ($\ge 0.70$ threshold).
- **Color Progression:** Gradient from muted silver to pure luminous white as confidence reaches the autonomous execution tier.

---

## 7. Component Usage Checklist

When building new components for Meridian:
- [ ] Use `font-ui` (`Space Grotesk`) for titles and controls.
- [ ] Use `font-display` (`Fraunces`) for primary financial numbers and tickers.
- [ ] Use `font-mono` (`IBM Plex Mono`) for hashes, IDs, error codes, and formula parameters.
- [ ] Ensure all body text uses `.text-justify` for clean justified layout.
- [ ] Wrap clickable cards in `.card-hover` with `.neu-panel` and `rounded-[var(--radius-pulse)]`.
- [ ] Never add a visible `border` — all depth comes from the `--neu-shadow-dark` / `--neu-shadow-light` pair.
- [ ] Use `.neu-well` (inset shadow) for anything recessed: inputs, search bars, read-only logs.
- [ ] Use `.neu-panel` / `.neu-panel-raised` (convex shadow) for anything raised: cards, modals, buttons.
- [ ] Keep accent colors strictly within the monochrome spectrum (black, gray, zinc, pure white) — color signals meaning (state), never decoration.
