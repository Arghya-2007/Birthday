# Phases.md — Development Phases
## Premium Interactive Birthday Experience

---

## Core Rule for the AI Agent

> Do NOT build the entire website in one step.

After every phase:
1. Run the project.
2. Check for errors.
3. Verify the visual result.
4. Verify responsiveness.
5. Verify performance.
6. Only then continue to the next phase.

The project is a polished cinematic experience — not a collection of rapidly generated components.

---

## Phase 1 — Project Setup

**Goal**: A clean, running foundation with correct config.

### Tasks

- [ ] Create Next.js 14 project (App Router, TypeScript).
- [ ] Install dependencies:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `gsap`
  - `lenis`
  - `three`, `@react-three/fiber`, `@react-three/drei`
- [ ] Configure `tailwind.config.ts`:
  - Custom colors from Design.md palette.
  - Custom font families (`display`, `body`).
  - Custom letter spacing tokens.
- [ ] Set up `app/globals.css`:
  - CSS variables (colors, spacing, z-index).
  - Base reset.
  - Font-face declarations or Google Fonts import.
- [ ] Create the folder structure exactly as defined in Architecture.md §2.
- [ ] Create `src/data/birthdayContent.ts` with placeholder content (all fields present, text as `[TBD]`).
- [ ] Create `src/animations/gsap.ts` — register ScrollTrigger, set global defaults.
- [ ] Create `src/hooks/useLenis.ts` — Lenis + ScrollTrigger integration (see Architecture.md §3).
- [ ] Create `src/lib/assets.ts` — frame URL builder utility.
- [ ] Set up `app/layout.tsx` — fonts, metadata, theme color.
- [ ] Verify: `npm run dev` runs with no errors.

### Deliverable
Clean running Next.js project. Zero errors. Folder structure in place. Tailwind working. No animations yet.

---

## Phase 2 — Loading Screen

**Goal**: Premium cinematic preloader that tracks real asset loading progress and exits into the hero.

### Tasks

- [ ] Create `components/loading/LoadingScreen.tsx`:
  - Full screen, `--color-bg` background.
  - Date label: `AUGUST 2026` (caption font, uppercase, `--color-champagne`).
  - Progress text: `Preparing something special...`
  - Progress percentage: updates in real time.
  - Thin champagne-gold progress bar at the bottom.
  - State: `isExiting` triggers GSAP exit animation.
- [ ] Create `components/loading/loadingAnimations.ts`:
  - Entrance animation (text fade in, staggered).
  - Exit animation (full-screen wipe or opacity fade out).
  - Returns a promise that resolves when exit is complete.
- [ ] Create `src/lib/preload.ts`:
  - `preloadCriticalAssets(onProgress)` function.
  - Loads first 10 image sequence frames.
  - Calls `onProgress` with 0–100 value.
  - Returns `Promise<void>`.
- [ ] Wire up in `app/page.tsx`:
  - Show `<LoadingScreen>` until critical assets loaded + minimum aesthetic hold.
  - Call `preloadCriticalAssets`, pass progress to `<LoadingScreen>`.
  - When done, trigger exit animation, then unmount `<LoadingScreen>`.
- [ ] Verify: Loading screen shows, progress bar fills, exits smoothly.
- [ ] Verify on mobile: text readable, bar visible.

### Deliverable
Working premium preloader. Tracks real progress. GSAP entrance and exit. Transitions smoothly into page.

---

## Phase 3 — Hero Scene

**Goal**: Premium opening scene — luxury dark dining room, mysterious, calm.

### Tasks

- [ ] Add Start Frame image to `/public/images/hero-start.jpg` (or WebP).
- [ ] Create `components/hero/Hero.tsx`:
  - Full viewport height.
  - Background: Start Frame image, `object-fit: cover`.
  - Subtle Ken Burns entrance: GSAP scale from 1.02 → 1.00 over 4s.
  - Optional: minimal scene label `SCENE 01` top-left, caption style.
  - Optional: very subtle hero text (`"For someone special"`) bottom-center.
  - Vignette overlay (CSS radial gradient, dark edges).
- [ ] Create `animations/heroAnimations.ts`:
  - Hero image fade-in from black after loading screen exits.
  - Optional text entrance (GSAP opacity + Y translate).
  - Export `playHeroEntrance(containerRef)`.
- [ ] Integrate hero into `app/page.tsx` after loading screen unmounts.
- [ ] Verify: Hero image fills screen. Dark, atmospheric. Ken Burns subtle. No UI clutter.
- [ ] Verify on mobile: image crops correctly, text readable.

### Deliverable
Premium opening scene. Cinematic. Mysterious. Sets the visual tone for the entire experience.

---

## Phase 4 — Image Sequence Engine

**Goal**: Scroll-controlled canvas animation of the cinematic transformation.

### Tasks

- [ ] Prepare image sequence frames:
  - Place desktop frames in `/public/sequence/desktop/frame-0001.webp` ... (or use placeholders for now).
  - Place mobile frames in `/public/sequence/mobile/frame-0001.webp` ...
  - If real frames not yet available: generate a placeholder sequence (solid color gradient, 60 frames) to test the engine.
- [ ] Create `components/sequence/SequenceCanvas.tsx`:
  - `<canvas>` element, `position: fixed`, `inset: 0`, `100vw × 100vh`, `z-index: var(--z-canvas)`.
  - Accepts `currentFrame: ImageBitmap | null` as prop.
  - On each render: `ctx.drawImage(currentFrame, ...)` with `object-fit: cover` math.
  - Do NOT use React state for frame index — use ref + direct canvas draw.
- [ ] Create `components/sequence/sequenceLoader.ts`:
  - `loadFrame(url): Promise<ImageBitmap>` using `createImageBitmap`.
  - `preloadFrameRange(start, end, device, onProgress)`.
  - Sliding window cache: keep only N frames in memory.
- [ ] Create `components/sequence/ImageSequence.tsx`:
  - Mounts `SequenceCanvas`.
  - Creates a tall scroll container (height = `frameCount * scrollHeightPerFrame` px).
  - GSAP ScrollTrigger: pin the canvas, scrub frame index to scroll progress.
  - Accepts children (story overlays) positioned inside.
  - Cleans up all ScrollTriggers on unmount.
- [ ] Create `animations/sequenceAnimations.ts`:
  - `createSequenceScrollTrigger(containerRef, frameRef, totalFrames)`.
  - Maps scroll progress to frame index.
  - Calls `drawFrame` on progress change.
- [ ] Create `hooks/useImageSequence.ts`:
  - Manages progressive loading state.
  - Returns `{ currentFrame, loadedFrames, isReady }`.
  - No React state for `currentFrame` — use ref.
- [ ] Integrate into `app/page.tsx` below the Hero.
- [ ] Verify: Scrolling controls frame index. Canvas updates. Smooth (60fps).
- [ ] Verify on mobile: touch scroll works, mobile frames load correctly.
- [ ] Verify: No memory leaks on repeated scroll.

### Deliverable
Smooth, scroll-controlled cinematic image sequence. Pinned canvas. Progressive loading. Clean cleanup.

---

## Phase 5 — Story Content Overlays

**Goal**: Emotional narrative appears as overlays on the image sequence at correct scroll positions.

### Tasks

- [ ] Create `components/story/StorySection.tsx`:
  - Receives: `text`, `framePosition` (at which frame this appears), `position` (left/right/center).
  - Positioned absolutely inside the `ImageSequence` scroll container.
  - GSAP: fade in when scroll reaches `framePosition`, fade out when past.
  - Typography: Cormorant Garamond, `display-lg`, `--color-ivory`.
  - No semi-transparent backdrop unless absolutely necessary for readability.
- [ ] Create `components/story/MemorySection.tsx`:
  - Receives: `image`, `title`, `description`, `framePosition`.
  - Cinematic photo reveal: scale from 1.05 → 1.0 + opacity fade in.
  - Short caption below in Inter, `caption` size.
  - Clean exit before next memory.
  - Positioned inside `ImageSequence` scroll container.
- [ ] Create `components/story/MessageSection.tsx`:
  - Personal message text.
  - Large, centered, slow character-by-character or line-by-line reveal.
  - Cormorant Garamond, `display-md`, `--color-ivory`.
- [ ] Create `animations/storyAnimations.ts`:
  - `createStoryScrollTrigger(el, startFrame, endFrame, totalFrames, containerRef)`.
  - Entrance at `startFrame` (relative to total scroll).
  - Exit at `endFrame`.
- [ ] Populate content from `birthdayContent.ts` — never hard-code text in components.
- [ ] Build all 5 scenes:
  - Scene 01: Opening statement.
  - Scene 02: Memory photos.
  - Scene 03: Traits / Little things about Antara.
  - Scene 04: Personal message.
  - Scene 05: Reveal — `"One last surprise..."`
- [ ] Verify: Text appears and disappears at correct scroll positions. No stale overlays left on screen.
- [ ] Verify on mobile: text is readable, positioned correctly, not clipped.

### Deliverable
Complete emotional narrative overlaid on the image sequence. Cinematic. Personal. Configurable.

---

## Phase 6 — Birthday Transformation

**Goal**: Image sequence reaches End Frame. Room has transformed. Transition into the 3D scene.

### Tasks

- [ ] Ensure the final frames of the sequence are the End Frame (birthday cake reveal).
- [ ] Create `components/transitions/CinematicTransition.tsx`:
  - Triggered when scroll reaches the final sequence frame.
  - Holds on End Frame for a beat.
  - Overlay text: `"One last surprise..."` fades in, then fades out.
  - GSAP timeline handles this hold + transition.
  - At the end: navigation to `/birthday` page OR unmounts sequence + mounts `BirthdayExperience`.
- [ ] Verify: End Frame is visually correct (birthday room composition).
- [ ] Verify: Transition feels continuous — no hard cuts.
- [ ] Verify on mobile: transition works with touch scroll.

### Deliverable
Cinematic birthday reveal. Seamless transition from 2D sequence into 3D experience.

---

## Phase 7 — 3D Cake Scene

**Goal**: Premium interactive 3D birthday cake, elegantly lit, ready for interaction.

### Tasks

- [ ] Prepare cake model:
  - If final GLB available: place in `/public/models/birthday-cake.glb`, optimize (Draco compression, KTX2 textures).
  - If not available: create a procedural placeholder cake (Three.js cylinders, basic materials, candle sticks) — clean, not cartoon.
- [ ] Create `components/three/CakeLights.tsx`:
  - Warm key light (DirectionalLight).
  - Per-candle PointLights (6–8 max) with amber color, animated intensity flicker.
  - Cool ambient fill.
  - Optional: Environment map.
- [ ] Create `components/three/BirthdayCake.tsx`:
  - Load GLB with `useGLTF`.
  - Apply PBR materials (ivory, champagne, gold).
  - Subtle idle rotation or none (prefer stillness for elegance).
- [ ] Create `components/three/Candles.tsx`:
  - Candle group with individual flame meshes.
  - Flame animation: GSAP or shader-based flicker.
  - `onExtinguish` callback per candle.
  - Extinguish animation: flame → out, smoke, point light fades.
- [ ] Create `components/three/Celebration.tsx`:
  - Triggered after all candles extinguished.
  - Elegant gold particle burst (minimal, not confetti explosion).
  - Self-removes after animation completes.
- [ ] Create `components/three/CakeScene.tsx`:
  - R3F `<Canvas>` with `ACESFilmicToneMapping`, `shadows`.
  - Camera: matches End Frame perspective.
  - Subtle idle camera bob.
  - Assembles: `CakeLights`, `BirthdayCake`, `Candles`, `Celebration`.
- [ ] Verify: Cake renders. Lights correct. Flames flicker. No console errors.
- [ ] Verify on mobile: 3D scene loads, performance acceptable.

### Deliverable
Premium 3D cake scene. Correctly lit. Candles animated. Ready for interaction.

---

## Phase 8 — Interaction

**Goal**: "Make a Wish" interaction — user extinguishes candles, celebration fires, final message appears.

### Tasks

- [ ] Create `components/birthday/BirthdayUI.tsx`:
  - `"Make a wish..."` prompt text (Cormorant Garamond, display-md, centered below canvas).
  - Subtle breathing pulse animation (GSAP yoyo scale).
  - On click/tap anywhere on canvas (or on prompt): trigger candle extinguish sequence.
  - After all candles out: prompt fades, celebration fires.
  - Final message fades in.
- [ ] Create `components/birthday/BirthdayExperience.tsx`:
  - Owns `wishMade` state.
  - Composes `<CakeScene>` + `<BirthdayUI>`.
  - Coordinates: interaction → `Candles.extinguish()` → `Celebration` → final message.
- [ ] Final message UI:
  - `HAPPY BIRTHDAY` — display-xl, Cormorant Garamond, `--color-ivory`.
  - `Antara` — display-lg, `--color-champagne`.
  - Personal message — body-lg, centered.
  - `— DevArghya` — caption, `--color-text-secondary`.
  - Fade in sequence via GSAP stagger.
- [ ] Optional: Microphone blow detection.
  - Request mic permission only after user has already interacted (clicked something).
  - Detect audio level spike → trigger extinguish (same as click).
  - If mic permission denied: silently fall back to click-only.
- [ ] Create `animations/birthdayAnimations.ts`:
  - `playWishSequence(onComplete)` — orchestrates candle out + celebration + message reveal.
- [ ] Verify: Clicking triggers candle extinguish sequence. Celebration plays. Final message appears.
- [ ] Verify: Final message is accessible (real text in DOM, not image).
- [ ] Verify on mobile: tap works. Text readable.

### Deliverable
Interactive birthday climax. Candles respond to user. Final message delivers emotional payoff.

---

## Phase 9 — Audio

**Goal**: Optional ambient and birthday music, user-initiated, synced to key moments.

### Tasks

- [ ] Source audio files:
  - `ambient.mp3` — quiet, cinematic, mysterious (open-source or licensed).
  - `birthday.mp3` — warm, emotional, celebratory.
- [ ] Place in `/public/audio/`.
- [ ] Create audio manager in `src/lib/audioManager.ts`:
  - Singleton class.
  - `enable()`: starts ambient.
  - `transitionToBirthday()`: crossfades ambient → birthday.
  - `playCandle()`: small sound on candle extinguish.
  - `disable()`: mutes all.
  - All methods wrapped in try/catch — fail silently.
- [ ] Add audio toggle UI:
  - Fixed position, unobtrusive.
  - Show only after user first gesture.
  - Icon: speaker / muted.
  - Color: `--color-text-secondary`, active: `--color-champagne`.
- [ ] Sync audio events:
  - Loading complete → ambient begins (if enabled).
  - Entering birthday scene → transition to birthday audio.
  - Candle extinguish → candle sound.
- [ ] Verify: Audio plays only after user gesture. Respects browser autoplay policy.
- [ ] Verify: Audio toggle works. Muting works.
- [ ] Verify: If audio fails, experience continues silently.

### Deliverable
Immersive audiovisual experience. User-controlled. Fails gracefully.

---

## Phase 10 — Optimization

**Goal**: Fast, smooth production build.

### Tasks

- [ ] Compress image sequence:
  - WebP quality 80–85 for sequence frames.
  - Verify file sizes acceptable (target: <100KB per desktop frame, <40KB per mobile frame).
- [ ] Optimize GLB:
  - Run through `gltf-pipeline` or `glTF-Optimizer`.
  - Apply Draco compression.
  - Verify poly count reasonable (<100K triangles total).
  - Compress textures (KTX2/Basis).
- [ ] Lazy-load non-critical sections:
  - `BirthdayExperience` (R3F) — dynamic import with `next/dynamic`, `ssr: false`.
  - Memory photos — `loading="lazy"` on `<img>`.
- [ ] Check memory usage:
  - Open DevTools → Memory tab.
  - Scroll through full sequence. No unbounded memory growth.
  - Verify ImageBitmap cleanup working.
- [ ] Check frame rate:
  - Open DevTools → Performance tab.
  - Target 60fps during scroll. No jank.
  - Check on throttled CPU mode.
- [ ] Check loading time:
  - Lighthouse audit.
  - LCP target: <3s on good connection.
  - Reduce initial JS bundle if needed (check `next build` output).
- [ ] Mobile complexity reduction:
  - Verify mobile sequence is used on mobile devices.
  - Verify 3D scene has lower-quality settings on low-end devices.

### Deliverable
Fast, smooth production build. Optimized assets. No memory leaks.

---

## Phase 11 — Responsive QA

**Goal**: Full quality check across all target browsers and devices.

### Test Matrix

| Platform | Check |
|---|---|
| Desktop Chrome | Full experience |
| Desktop Edge | Full experience |
| Desktop Firefox | Full experience |
| Desktop Safari | Canvas, WebGL, audio |
| Android (Chrome) | Touch scroll, 3D, canvas |
| iPhone/iPad (Safari) | Touch scroll, 3D, audio autoplay |

### Check for each platform

- [ ] Loading screen appears and exits correctly.
- [ ] Hero loads, Ken Burns correct.
- [ ] Image sequence responds to scroll smoothly.
- [ ] Story overlays appear at correct positions.
- [ ] Touch / gesture scroll works naturally.
- [ ] Birthday transformation is correct.
- [ ] 3D scene loads and renders.
- [ ] Candle interaction works (tap/click).
- [ ] Final message appears correctly.
- [ ] Audio works when enabled (after gesture).
- [ ] Typography correct (no font loading issues).
- [ ] `prefers-reduced-motion` mode works (static experience, no scroll animations, full content visible).
- [ ] No WebGL crashes.
- [ ] No major console errors.
- [ ] No blank screens.

### Deliverable
Confirmed working experience on all target platforms.

---

## Phase 12 — Final Polish

**Goal**: Perfection. No new features. Only refinement.

### Focus Areas

- [ ] **Timing**: Every animation feels natural. Nothing too fast or too slow.
- [ ] **Typography**: Perfect letter spacing, line heights, sizes at all viewports.
- [ ] **Spacing**: Generous breathing room everywhere.
- [ ] **Micro-interactions**: Hover states (if any). Audio toggle feel. Wish prompt feel.
- [ ] **Lighting (3D)**: Candle flicker rate feels realistic. Shadows correct.
- [ ] **Transitions**: Every section-to-section transition is seamless.
- [ ] **Sound synchronization**: Audio cues land at exactly the right visual moment.
- [ ] **Final birthday message**: The emotional payoff — get the words right. Timing right.
- [ ] **Personal content**: All `[TBD]` placeholders replaced with real content.
  - Memories/photos added.
  - Personal message finalized.
  - Dev reference confirmed.
- [ ] **Production build**: `npm run build` succeeds with no errors.

### Final Check

Read the Definition of Done (PRD.md §15). Every checkbox must be ticked.

> The final experience must feel: **Elegant. Cinematic. Emotional. Personal. Premium. Memorable.**

---

## Summary Timeline

| Phase | Goal |
|---|---|
| Phase 1 | Project foundation |
| Phase 2 | Loading screen |
| Phase 3 | Hero scene |
| Phase 4 | Image sequence engine |
| Phase 5 | Story content overlays |
| Phase 6 | Birthday transformation |
| Phase 7 | 3D cake scene |
| Phase 8 | Interaction |
| Phase 9 | Audio |
| Phase 10 | Optimization |
| Phase 11 | Responsive QA |
| Phase 12 | Final polish |

Build in order. Verify after each phase. Do not skip phases.
