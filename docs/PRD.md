# PRD — Premium Interactive Birthday Experience
## Product Requirements Document

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project Name | Birthday Cinematic Experience |
| Recipient | Antara |
| Birthday Date | 13th August |
| Relationship | Classmate and Close Friend |
| Developer | DevArghya (Arghya Pal) |
| Project Type | Personal — Premium Cinematic Birthday Website |

---

## 2. Vision Statement

This is not a birthday website. It is a short interactive cinematic film built for one person.

> **Loading → Cinematic Story → Image-Sequence Transformation → Birthday Reveal → Interactive 3D Cake → Final Birthday Message**

The experience must feel **elegant, cinematic, emotional, personal, premium, and memorable**. It should resemble a luxury commercial or high-end editorial film — not a generic birthday template.

---

## 3. Core User Journey

```
USER OPENS WEBSITE
      ↓
Dark cinematic loading screen
("Preparing something special...")
      ↓
Loading completes → Smooth GSAP transition
      ↓
Hero: Luxury dark dining room (mystery, calm)
      ↓
User begins scrolling
      ↓
Scroll-driven 2D image sequence begins
(Canvas + GSAP ScrollTrigger — pinned)
      ↓
Story overlays appear on image sequence
Scene 01 → Scene 02 → Scene 03 → Scene 04
      ↓
"One last surprise..."
      ↓
Dining room transforms → Birthday reveal
(Image sequence ends at End Frame: cake + candles)
      ↓
3D transition
      ↓
Interactive 3D cake scene (React Three Fiber)
      ↓
"Make a wish..."
      ↓
User taps / blows
      ↓
Candles extinguish → Celebration
      ↓
HAPPY BIRTHDAY ANTARA
      ↓
Final personal message
```

---

## 4. Scene Structure

### Scene 01 — The Beginning
Short emotional opening statement.
Example: *"Some people enter our lives..."*

### Scene 02 — Memories
Personal moments. Cinematic photo reveals with slow scale + parallax. No slideshow behavior.

### Scene 03 — The Little Things
Qualities that make Antara special.
Traits: Friendly, Calm, Funny, Energetic, Hardworking, Great Personality.
Optional dev-flavored reference acceptable.

### Scene 04 — Personal Message
Emotional personal letter. Not yet finalized — must be configurable via `data/birthdayContent.ts`. Do not hard-code into animation logic.

### Scene 05 — The Reveal
Build anticipation before the transformation.
Example: *"But there's one more thing..."*

### Scene 06 — Birthday Transformation
Image sequence reaches End Frame. Room has transformed into birthday setting.
Transition into the 3D cake experience.

### Scene 07 — Final Message
Final birthday wish delivered after cake interaction.
*"Happy Birthday, Antara."*
Close with sincere personal message.

---

## 5. Loading Screen Requirements

- Must feel like part of the experience — not a generic spinner.
- Cinematic direction:
  ```
  AUGUST 2026
  Preparing something special...
  72%
  ↓
  100%
  Ready?
  ```
- Show actual loading progress where practical.
- Preload critical hero frames first.
- Do NOT block the full experience waiting for all assets.
- Load the 3D cake experience progressively.
- Animate loader exit with GSAP into hero.
- Avoid long unnecessary loading time.

---

## 6. Image Sequence Requirements

- **Source**: AI-generated video between Start Frame and End Frame, extracted as individual frames.
- **Format**: WebP (preferred) or AVIF where supported.
- **Rendering**: HTML Canvas only. Do NOT render hundreds of `<img>` elements into the DOM.
- **Control**: GSAP ScrollTrigger — scroll progress maps to frame index.
- **Behavior**: Canvas is pinned/fixed while user scrolls through the sequence.
- **Loading**: Progressive. Critical first frames load during the loading screen. Remaining frames load as user approaches.
- **Desktop resolution**: 1440p-class sequence.
- **Mobile resolution**: 720p-class sequence. Fewer frames acceptable.

Start Frame description:
- Luxury dark dining room, walnut table, white floral arrangement, scattered petals, sealed envelope, midnight-blue night skyline, warm interior + cool exterior lighting. No cake. No birthday decorations.

End Frame description:
- Same room. Three-tier ivory/champagne birthday cake with gold detailing, white floral decorations, multiple elegant candles with flames, warm candlelight. Same architecture, same camera, same composition.

Critical visual rules for the sequence:
- Same room. Same camera. Same table. Same architecture.
- No cuts, no scene changes, no object teleportation.
- No fantasy particles, no cartoon effects.
- Must look like a real continuous luxury commercial shot.

---

## 7. 3D Birthday Cake Requirements

- Engine: Three.js + React Three Fiber + Drei.
- Model: GLB/GLTF. Optimized. Compressed.
- Visual: Elegant, realistic. Ivory/champagne with gold detailing. Subtle flower decorations. Three tiers.
- Lighting: Soft key light, warm candlelight, cool ambient fill, subtle environment lighting, realistic shadows.
- Candles: Animated flames. Extinguish on user interaction.
- Interaction flow:
  ```
  Cake appears
  → Candles visible
  → "Make a wish..."
  → User taps OR blows (microphone optional)
  → Candles go out
  → Subtle smoke / glow
  → Celebration
  → Final birthday message
  ```
- Click/tap interaction is required and primary.
- Microphone/blow detection is an optional enhancement — never the only path.
- Must load lazily. Must not block the main experience.
- Must degrade gracefully: if 3D model fails, show a high-quality static cake image + birthday message.

---

## 8. Audio Requirements

- Optional but strongly recommended.
- Must NOT force autoplay. User initiates via "Tap to begin" or similar.
- Structure:
  ```
  Opening: quiet ambient
  Story: soft emotional music
  Transformation: music builds
  Cake reveal: warm cinematic rise
  Candles: small musical accent
  Final message: emotional ending
  ```
- Audio must fail silently. If audio fails, experience continues without interruption.
- Assets: `/public/audio/ambient.mp3`, `/public/audio/birthday.mp3`.

---

## 9. Content Configuration

All personal content must live in `src/data/birthdayContent.ts`. Never hard-code text into animation components.

Fields required:
- `hero.title`, `hero.subtitle`
- `memories[]` — image path, title, description per memory
- `messages[]` — array of overlay text blocks
- `finalMessage.title`, `finalMessage.message`
- `recipientName` = "Antara"
- `birthdayDate` = "13th August"
- Qualities / traits array

---

## 10. Design Requirements

### Visual Language
Cinematic, premium, elegant, realistic, minimal, emotional, sophisticated, warm, dark, atmospheric.

### Avoid
Generic birthday templates, bright childish colors, excessive hearts/balloons/confetti, cartoon aesthetics, neon effects, random particles, cheap gradients, overly complicated UI.

### Color Palette
- Deep charcoal
- Midnight blue
- Dark walnut
- Warm ivory
- Champagne gold
- Soft amber
- Neutral dark tones

Color journey: `Dark/Cool → Mystery → Warmth → Wonder → Celebration`

### Typography
- One elegant display/serif font — emotional headings.
- One clean sans-serif font — supporting text.
- Large cinematic scale. Generous letter spacing. Strong negative space. Minimal copy. Slow, elegant reveals.
- Text must never dominate the visual scene unnecessarily.

---

## 11. Performance Requirements

- 60 FPS target where hardware allows.
- No long main-thread blocking.
- No large initial JS bundle.
- Lazy-load non-critical sections and 3D assets.
- Compress all images (WebP/AVIF).
- Compress GLB and textures.
- No unnecessary dependencies.

---

## 12. Accessibility Requirements

- Semantic HTML throughout.
- Meaningful alt text on personal photos.
- Sufficient text contrast.
- Respect `prefers-reduced-motion`:
  - Disable heavy scroll effects
  - Reduce camera movement
  - Reduce animation durations
  - Still show complete story and birthday message
- Interactive controls must have accessible labels.
- Final birthday message must be accessible as real text.

---

## 13. Browser Targets

Chrome, Edge, Safari, Firefox, Modern Android, iOS Safari.
Graceful fallback when WebGL is unavailable (static 2D fallback for cake).

---

## 14. Error Handling

| Failure | Fallback |
|---|---|
| Image sequence fails | Show static hero image + story content |
| 3D model fails | Show static cake image + birthday message |
| Audio fails | Continue silently |
| WebGL unavailable | 2D fallback for cake scene |

Never show a blank screen because one enhancement failed.

---

## 15. Definition of Done

- [ ] Loading screen works and feels cinematic
- [ ] Hero loads smoothly from Start Frame
- [ ] Image sequence works with scroll — smooth, pinned
- [ ] Image sequence is optimized (WebP, progressive)
- [ ] Story sections animate correctly as overlays
- [ ] Personal images (memories) work with cinematic reveals
- [ ] Personal messages are configurable from `birthdayContent.ts`
- [ ] Birthday transformation works (End Frame matches intended composition)
- [ ] 3D cake loads and renders elegantly
- [ ] 3D cake is optimized (compressed GLB, reasonable poly count)
- [ ] Candles animate and extinguish on interaction
- [ ] User interaction works (tap/click required, mic optional)
- [ ] Final birthday message appears correctly
- [ ] Audio works when enabled (user-initiated)
- [ ] Mobile experience works
- [ ] Desktop experience works
- [ ] Reduced-motion mode works
- [ ] WebGL fallback exists
- [ ] Assets lazy-loaded where appropriate
- [ ] No major console errors
- [ ] No duplicate GSAP ScrollTriggers
- [ ] No obvious memory leaks
- [ ] Production build succeeds
- [ ] Final experience feels cinematic and premium

---

## 16. Priority Order

When trade-offs are necessary:

```
1. Emotional storytelling
2. Visual quality
3. Smooth animation
4. Performance
5. Interaction
6. Audio
7. Decorative effects
```

Never sacrifice core performance for unnecessary effects.

---

## 17. Final Creative Direction

> This is not just a birthday message. It is a small cinematic experience created specifically for one person.

The experience begins quietly. It builds curiosity. It reveals the birthday gradually. It creates a memorable interactive moment. It ends with a sincere personal message.

**Elegant. Cinematic. Emotional. Personal. Premium. Memorable.**
