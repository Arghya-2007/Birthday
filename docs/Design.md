# Design.md — Visual Design System
## Premium Interactive Birthday Experience

---

## 1. Design Philosophy

The design must NOT resemble a birthday website. It must feel like a **luxury cinematic commercial** or **high-end editorial film**.

Every design decision is filtered through one question:
> "Does this feel like a premium cinematic experience, or does it feel like a birthday template?"

If it feels like a template — reject it.

---

## 2. Visual Identity

### Keywords
Cinematic · Premium · Elegant · Realistic · Minimal · Emotional · Sophisticated · Warm · Dark · Atmospheric · Intimate

### Anti-Keywords (things to avoid completely)
Generic · Childish · Cheerful · Cartoon · Neon · Flashy · Cluttered · Cheap · Decorative · Confetti · Balloons · Hearts

---

## 3. Color System

### Primary Palette

| Token | Name | Hex (Approximate) | Usage |
|---|---|---|---|
| `--color-background` | Void Black | `#0A0A0B` | Page base background |
| `--color-surface` | Deep Charcoal | `#141416` | Card / surface background |
| `--color-midnight` | Midnight Blue | `#0D1B2A` | Night sky, cool accents |
| `--color-walnut` | Dark Walnut | `#2C1A0E` | Warm interior depth |
| `--color-ivory` | Warm Ivory | `#F5F0E8` | Primary text, headings |
| `--color-champagne` | Champagne Gold | `#C9A96E` | Accent color, candles, gold |
| `--color-amber` | Soft Amber | `#D4884A` | Warm glow, candle light |
| `--color-muted` | Neutral Dark | `#2A2A2D` | Borders, subtle dividers |
| `--color-text-secondary` | Warm Gray | `#9A9490` | Supporting text |

### Color Journey (follows the story arc)

```
Scene 01 — Opening
Dark, cool, mysterious
Primary: Void Black + Midnight Blue

Scene 02/03 — Story / Memories
Mystery lifts, warmth enters
Primary: Charcoal + Ivory text

Scene 04 — Personal Message
Warmth
Primary: Walnut warmth + Champagne gold accents

Scene 05 — Reveal
Tension, anticipation
Brief cool return

Scene 06/07 — Birthday + Finale
Celebration — warm, bright (still elegant)
Primary: Amber glow + Champagne gold + Ivory
```

### CSS Variables (globals.css)

```css
:root {
  --color-bg: #0A0A0B;
  --color-surface: #141416;
  --color-midnight: #0D1B2A;
  --color-walnut: #2C1A0E;
  --color-ivory: #F5F0E8;
  --color-champagne: #C9A96E;
  --color-amber: #D4884A;
  --color-muted: #2A2A2D;
  --color-text-primary: #F5F0E8;
  --color-text-secondary: #9A9490;
  --color-candle-glow: rgba(212, 136, 74, 0.15);
}
```

---

## 4. Typography System

### Font Stack

Use exactly two fonts. No exceptions.

| Role | Font | Source | Usage |
|---|---|---|---|
| Display / Serif | **Cormorant Garamond** | Google Fonts | Emotional headings, cinematic titles, scene numbers |
| Body / Sans-Serif | **Inter** | Google Fonts | Supporting text, captions, UI labels |

Fallback stack:
```css
--font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale

| Token | Size | Weight | Letter Spacing | Usage |
|---|---|---|---|---|
| `display-xl` | `clamp(4rem, 8vw, 9rem)` | 300 (Light) | `0.04em` | Hero title, "HAPPY BIRTHDAY" |
| `display-lg` | `clamp(2.5rem, 5vw, 6rem)` | 300 | `0.06em` | Scene titles |
| `display-md` | `clamp(1.8rem, 3vw, 3.5rem)` | 400 | `0.04em` | Sub-headings |
| `body-lg` | `1.25rem` | 300 | `0.02em` | Story paragraphs |
| `body-md` | `1rem` | 400 | `0.01em` | Supporting copy |
| `caption` | `0.8rem` | 400 | `0.12em` | Labels, scene numbers (uppercase) |
| `loader` | `0.75rem` | 400 | `0.2em` | Loading screen text (uppercase) |

### Typography Rules
- Text must never dominate the visual scene.
- Minimal copy — every word must earn its place.
- Generous white space around text.
- Slow, elegant text reveals (GSAP stagger + opacity + Y-translate).
- Scene numbers / labels: uppercase, wide letter-spacing, small caption size, `--color-text-secondary`.
- Main headings: Cormorant Garamond, light weight, wide tracking.

---

## 5. Loading Screen Design

### Visual Direction
Dark. Minimal. Cinematic. Feels like the beginning of a film.

### Layout
```
[Full screen — background: var(--color-bg)]

              AUGUST 2026

      Preparing something special...

                 ——————————
                    72%

[Bottom: subtle progress bar — thin, champagne gold]
```

### Transition to Hero
- Progress bar fills to 100%.
- Text changes to: `Ready?`
- Brief pause (hold).
- Full-screen curtain wipe or opacity fade out → hero appears beneath.
- GSAP timeline handles this transition — no CSS transitions.

### Do Not
- No spinning circles.
- No generic "Loading..." text.
- No abrupt cut to hero.

---

## 6. Hero Scene Design

### Concept
The hero introduces the visual world. It must feel mysterious and calm.

### Start Frame visual description
- Luxury dark dining room, night.
- Long walnut dining table — center frame.
- Large window — deep midnight-blue night sky, soft city lights.
- White floral arrangement near center.
- Scattered flower petals on table.
- Sealed elegant envelope.
- Warm architectural interior lighting (amber/warm tone).
- Cool blue exterior light from window.
- No cake. No candles. No birthday decorations.

### Hero Text Overlay (optional / minimal)
If any text appears in the hero, it must be:
- Small, top-aligned or bottom-aligned.
- `SCENE 01` style caption label.
- Very subtle entrance — do not distract from the visual.

### Hero Animation
- Hero image fades in softly from black.
- Subtle slow Ken Burns scale (scale from 1.02 → 1.00 over ~4s).
- No abrupt movement.

---

## 7. Image Sequence & Story Overlay Design

### Image Sequence
- Full viewport canvas, pinned while scrolling.
- No borders, no chrome, no UI elements over the canvas except story overlays.
- Canvas fills 100vw × 100vh at all times.

### Story Text Overlays
Overlays appear on top of the pinned image sequence canvas at specific scroll positions.

Rules:
- Overlays must NEVER obscure the critical visual elements of the frame.
- Position overlays to one side, or use top/bottom placement.
- Use semi-transparent backdrop only if needed for readability — keep it minimal.
- Text enters with GSAP (fade up + opacity).
- Text exits with GSAP (fade down + opacity) before next section.

### Scene Label Style
```
SCENE 02          ← caption font, champagne color, uppercase, letter-spaced
Memories
```

### Memory Photo Design
- Photo appears with cinematic slow scale (scale 1.05 → 1.0).
- Short elegant caption below.
- Photo exits before next memory enters.
- No grid. No slideshow. One memory at a time.
- Aspect ratio: prefer landscape/widescreen for cinematic feel.
- Gentle vignette on photos optional.

---

## 8. Birthday Transformation Design

### Concept
The same dining room — but transformed.

The transformation is the emotional payoff of the scroll journey.

### End Frame visual description
- Same room, same camera, same architecture.
- Three-tier ivory/champagne birthday cake, center table.
- Gold detailing on cake.
- White floral decorations on cake.
- Multiple elegant candles with visible flames.
- Warm candlelight spreading across the table.
- Same midnight-blue exterior through window.
- Glassware and refined table decoration added.

### Transition to 3D
At the end of the image sequence:
- Final 2D End Frame holds on screen.
- GSAP fades a subtle overlay.
- React Three Fiber canvas fades in over the 2D canvas.
- 3D scene begins — camera positioned to match End Frame perspective.

---

## 9. 3D Cake Scene Design

### Visual Target
Elegant, realistic, photorealistic if possible. Ivory and champagne colored. Gold detailing. Three tiers. Subtle flower decorations on tiers.

### Lighting Setup
| Light | Type | Color | Purpose |
|---|---|---|---|
| Key light | Directional / Spot | Warm white (`#FFF5E0`) | Main illumination |
| Candle lights | Point lights (per candle) | Amber (`#D4884A`) | Warm glow, animated flicker |
| Ambient fill | Ambient | Cool blue (`#1A2A3A`) | Fill shadows, depth |
| Environment | HDRI optional | Interior warm | Global reflections |

### Candle Behavior
- Flames: animated via shader or animated sprite — subtle flicker.
- On interaction: each candle extinguishes sequentially (GSAP stagger).
- Extinguish effect: flame fades, subtle smoke particle (minimal, elegant — not cartoon).
- Post-extinguish: small warm glow remains on candle tip briefly.

### Post-Extinguish
- Celebration: subtle elegant particle burst (gold dust, not confetti explosion).
- Text appears: "HAPPY BIRTHDAY" in display-xl, Cormorant Garamond.
- Follow-up: final personal message fades in below.

### Camera
- Initial: slightly elevated, slight angle — matches End Frame perspective.
- Subtle slow auto-orbit or gentle bob while idle.
- Does not move aggressively — this is intimate, not dramatic.

---

## 10. Final Message Design

```
[Dark background — candle glow fading]

        HAPPY BIRTHDAY
            Antara

    [Personal message paragraph]
    [Cormorant Garamond — body-lg — centered]

        — DevArghya
```

- Fade in from opacity 0 after celebration.
- No heavy animation on the final message — let it breathe.
- The emotional weight is in the words, not the effects.

---

## 11. UI Components

### Progress Bar (Loading)
- Thin (2px height).
- Full width.
- Color: `--color-champagne`.
- No border radius (or very subtle 1px).
- Animated fill with GSAP.

### "Make a Wish" Prompt
- Centered below cake.
- Font: Cormorant Garamond, `display-md` size.
- Color: `--color-ivory`.
- Subtle breathing pulse animation (scale 1.0 ↔ 1.02, opacity 1.0 ↔ 0.85).
- Exits cleanly after interaction.

### Interaction Button (Click/Tap to blow)
- Minimal — do not use a heavy button component.
- Option A: "Tap to make a wish" as text prompt — tapping anywhere triggers.
- Option B: Subtle animated ring around the cake.
- Never looks like a standard browser button.

### Audio Toggle
- Fixed position — bottom right or top right.
- Icon: simple speaker/mute icon.
- Size: small, unobtrusive.
- Appears after user gesture.
- Color: `--color-text-secondary`, active: `--color-champagne`.

---

## 12. Motion Design Principles

### Timing
| Animation Type | Duration | Easing |
|---|---|---|
| Page transitions | 1.2–1.8s | `power2.inOut` |
| Text reveals | 0.8–1.2s | `power3.out` |
| Image fades | 1.0–1.5s | `power2.inOut` |
| Loader exit | 1.0–1.4s | `power2.inOut` |
| Micro-interactions | 0.2–0.4s | `power2.out` |
| Candle extinguish | 0.4–0.6s per candle | `power1.inOut` |

### GSAP Easing Philosophy
- Prefer `power2` and `power3` eases — they feel physical.
- Avoid linear — nothing in nature is linear.
- Avoid elastic and bounce — too playful for this aesthetic.
- Avoid overshoot on text — it looks cheap.

### Scroll Animation Rules
- Image sequence scrolls: 1 scroll pixel = precise frame index. No snapping.
- Story text: fade in on enter, fade out on exit. Do not leave stale text on screen.
- Section transitions: smooth, not jarring.

### Reduced Motion
When `prefers-reduced-motion: reduce` is detected:
- Disable all scroll-driven animation.
- Disable Ken Burns effects.
- Show story content as static.
- Still show complete story and birthday message.
- Candle interaction still works (no animation, just state change).

---

## 13. Spacing System

Base unit: `8px`

```
--space-xs:   4px
--space-sm:   8px
--space-md:   16px
--space-lg:   32px
--space-xl:   64px
--space-2xl:  128px
--space-3xl:  256px
```

Sections have generous vertical rhythm. Let visuals breathe.

---

## 14. Z-Index Stack

```
--z-base:        0      (static content)
--z-canvas:      10     (image sequence canvas)
--z-overlay:     20     (story text overlays)
--z-three:       30     (R3F canvas / birthday scene)
--z-ui:          40     (audio toggle, interaction prompts)
--z-loader:      100    (loading screen — always on top)
```

---

## 15. Tailwind Configuration Notes

Extend `tailwind.config.ts` with:
- Custom colors from the palette above.
- Custom font families (`fontFamily.display`, `fontFamily.body`).
- Custom letter spacing tokens.
- No purging of GSAP-generated class names.

Use Tailwind primarily for:
- Layout (flex, grid, positioning)
- Spacing
- Static text styles

Use inline GSAP / CSS variables for:
- Animated values
- Dynamic opacity, transform

---

## 16. Asset Naming Convention

```
Sequence desktop:   /public/sequence/desktop/frame-0001.webp
Sequence mobile:    /public/sequence/mobile/frame-0001.webp
Memory photos:      /public/images/memories/memory-01.jpg
3D model:           /public/models/birthday-cake.glb
Audio ambient:      /public/audio/ambient.mp3
Audio birthday:     /public/audio/birthday.mp3
Fonts:              /public/fonts/cormorant-garamond.woff2
```

Use zero-padded frame numbers: `0001`, `0002`, ..., `0120`.

---

## 17. Responsive Breakpoints

```
Mobile:   < 768px
Tablet:   768px – 1024px
Desktop:  > 1024px
```

Mobile strategy:
- Lower resolution image sequence (`/sequence/mobile/`).
- Reduced animation complexity.
- Touch scroll works naturally with Lenis.
- 3D scene uses lower-poly settings.
- Typography scales down via `clamp()`.
- Story content must remain fully readable.
