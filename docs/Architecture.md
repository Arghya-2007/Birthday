# Architecture.md — Technical Architecture
## Premium Interactive Birthday Experience

---

## 1. Technology Stack

### Required (do not remove)

| Library | Version | Role |
|---|---|---|
| Next.js | 14+ (App Router) | Framework |
| React | 18+ | UI layer |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Layout + static styles |
| GSAP | 3+ | Primary animation engine |
| GSAP ScrollTrigger | (bundled with GSAP) | Scroll-linked animation |
| Lenis | Latest | Smooth scroll layer |
| Three.js | Latest | 3D rendering core |
| React Three Fiber | Latest | React bindings for Three.js |
| @react-three/drei | Latest | Three.js helpers |

### Allowed Supporting (use only when necessary)

| Library | Allowed Use |
|---|---|
| Native Canvas API | Image sequence rendering |
| Web Audio API | Audio management |
| GSAP CustomEase | Custom timing curves if needed |

### Do NOT Add

- Framer Motion
- React Spring
- Anime.js
- Any other animation library
- Any UI component library (shadcn, MUI, etc.)
- Any 3D framework beyond R3F + Drei

---

## 2. Folder Structure

```
src/
│
├── app/
│   ├── layout.tsx              ← Root layout, fonts, metadata
│   ├── page.tsx                ← Main experience entry (scene 01–05)
│   ├── birthday/
│   │   └── page.tsx            ← 3D cake experience (scene 06–07)
│   └── globals.css             ← CSS variables, base styles
│
├── components/
│   │
│   ├── loading/
│   │   ├── LoadingScreen.tsx   ← Loading UI + progress
│   │   └── loadingAnimations.ts← GSAP loader entrance/exit
│   │
│   ├── hero/
│   │   └── Hero.tsx            ← Hero section (Start Frame + text)
│   │
│   ├── sequence/
│   │   ├── ImageSequence.tsx   ← Canvas + ScrollTrigger wrapper
│   │   ├── SequenceCanvas.tsx  ← Canvas draw logic
│   │   └── sequenceLoader.ts   ← Progressive frame loader
│   │
│   ├── story/
│   │   ├── StorySection.tsx    ← Generic scroll-triggered story section
│   │   ├── MemorySection.tsx   ← Photo + caption reveal
│   │   └── MessageSection.tsx  ← Personal message overlay
│   │
│   ├── transitions/
│   │   └── CinematicTransition.tsx ← Sequence → 3D scene transition
│   │
│   └── birthday/
│       ├── BirthdayExperience.tsx  ← 3D scene lifecycle wrapper
│       └── BirthdayUI.tsx          ← "Make a wish" UI, final message
│
├── components/three/
│   ├── CakeScene.tsx           ← R3F Canvas + scene setup
│   ├── BirthdayCake.tsx        ← GLB model loader + materials
│   ├── Candles.tsx             ← Candle group, flame animation, extinguish
│   ├── CakeLights.tsx          ← Lighting setup
│   └── Celebration.tsx         ← Post-wish particle effect
│
├── animations/
│   ├── gsap.ts                 ← GSAP + ScrollTrigger init, global config
│   ├── heroAnimations.ts       ← Hero entrance timeline
│   ├── storyAnimations.ts      ← Story section timelines
│   ├── sequenceAnimations.ts   ← Image sequence scroll binding
│   └── birthdayAnimations.ts   ← Birthday reveal + finale timelines
│
├── hooks/
│   ├── useLenis.ts             ← Lenis init + GSAP ScrollTrigger integration
│   ├── useImageSequence.ts     ← Canvas frame state + render loop
│   ├── useDevicePerformance.ts ← Detect device tier (high/low)
│   └── useMediaQuery.ts        ← Responsive breakpoint detection
│
├── lib/
│   ├── preload.ts              ← Asset preload orchestration
│   ├── assets.ts               ← Asset path helpers, frame URL builders
│   └── utils.ts                ← General utility functions
│
├── data/
│   └── birthdayContent.ts      ← ALL personal content (text, image paths)
│
└── styles/
    └── globals.css             ← Moved to app/globals.css per Next.js convention

public/
│
├── sequence/
│   ├── desktop/                ← frame-0001.webp ... frame-NNNN.webp
│   └── mobile/                 ← frame-0001.webp ... frame-NNNN.webp
│
├── images/
│   ├── memories/               ← memory-01.jpg ...
│   └── hero-start.jpg          ← Static fallback for Start Frame
│
├── models/
│   └── birthday-cake.glb       ← Optimized 3D cake model
│
├── textures/                   ← GLB textures if separated
│
├── audio/
│   ├── ambient.mp3
│   └── birthday.mp3
│
└── fonts/
    ├── cormorant-garamond.woff2
    └── inter.woff2
```

---

## 3. Scroll Architecture

### The Scroll Stack

```
User scroll input
      ↓
Lenis (smooth scroll normalization)
      ↓
Lenis emits scroll position
      ↓
GSAP ScrollTrigger reads position
      ↓
ScrollTrigger drives:
  - Canvas frame index (image sequence)
  - Story overlay animations
  - Section pin/unpin
  - Transition triggers
```

### Critical Rules

- Lenis must be initialized once, globally, in `useLenis.ts`.
- GSAP ScrollTrigger must be updated via Lenis's `on('scroll')` callback: `ScrollTrigger.update()`.
- Never create a second scroll listener that competes with Lenis.
- Never use `window.scrollY` directly for animation — always go through GSAP ScrollTrigger.

### useLenis.ts pattern

```ts
import Lenis from 'lenis'
import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis()

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(ScrollTrigger.update)
    }
  }, [])
}
```

---

## 4. Image Sequence Architecture

### Concept

```
scroll progress 0.0 → frame 0000
scroll progress 0.5 → frame N/2
scroll progress 1.0 → frame NNNN
```

### Canvas Rendering

- Single `<canvas>` element, `position: fixed`, `width: 100vw`, `height: 100vh`.
- Frame images are decoded into `ImageBitmap` objects for GPU-ready rendering.
- On each scroll tick: compute `frameIndex = Math.floor(progress * totalFrames)`.
- Draw: `ctx.drawImage(frames[frameIndex], 0, 0, canvas.width, canvas.height)`.
- Use `object-fit: cover` equivalent logic — scale/crop to maintain composition.

### Progressive Loading Strategy

```
Phase 1 (during loading screen):
  → Load frames 0000–0009 (first 10 critical frames)
  → Loading screen completes when these are ready

Phase 2 (hero visible):
  → Load frames 0010–0039 in background

Phase 3 (user starts scrolling):
  → Load remaining frames progressively
  → Prioritize near-current-frame window

Phase 4 (sequence nearing end):
  → Load 3D model + textures

Phase 5 (on demand):
  → Audio loaded after user gesture
```

### Frame URL Builder (assets.ts)

```ts
export function getFrameUrl(index: number, device: 'desktop' | 'mobile'): string {
  const padded = String(index).padStart(4, '0')
  return `/sequence/${device}/frame-${padded}.webp`
}
```

### Memory Management

- Do not store all ImageBitmap objects simultaneously if frame count is large.
- Maintain a sliding window of loaded frames around the current position.
- Close/release ImageBitmaps for frames far from current position on low-memory devices.

### Fallback

If canvas rendering fails or images fail to load:
- Show static `hero-start.jpg` (Start Frame) as background.
- Story sections appear over static image.
- Experience continues.

---

## 5. GSAP Architecture

### Initialization (gsap.ts)

```ts
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Global GSAP defaults
gsap.defaults({
  ease: 'power2.out',
  duration: 1.0,
})
```

Register plugins once, at the application root. Never register inside component render.

### ScrollTrigger Rules

- Every ScrollTrigger must be killed on component unmount.
- Use GSAP context (`gsap.context()`) inside `useEffect` for automatic cleanup.
- Never create ScrollTriggers outside of `useEffect`.

### Pattern for animation hooks

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // All GSAP animations and ScrollTriggers here
    ScrollTrigger.create({ ... })
    gsap.timeline({ scrollTrigger: { ... } })
  }, containerRef)

  return () => ctx.revert() // Cleans up ALL animations in this context
}, [])
```

### Do NOT use React state for animation values

```ts
// WRONG — causes re-render every frame
const [frame, setFrame] = useState(0)
// in scroll handler: setFrame(newFrame) ← triggers React re-render

// CORRECT — GSAP or ref
const frameRef = useRef(0)
// in scroll handler: frameRef.current = newFrame; drawFrame(newFrame)
```

---

## 6. Component Responsibilities

### LoadingScreen

Owns:
- Asset loading progress tracking.
- Loading UI animation (GSAP).
- Exit transition into hero.

Does NOT own:
- Story content.
- 3D scene.
- Any business logic beyond loading.

### ImageSequence

Owns:
- `<canvas>` element lifecycle.
- Frame preloading and management.
- Frame rendering on scroll.
- ScrollTrigger for pinning.

Does NOT own:
- Story content that overlays it.
- Personal text or photos.

### StorySection / MemorySection / MessageSection

Own:
- Text content and structure.
- Section-specific GSAP entrance/exit.
- Image display (memories).

Do NOT own:
- Canvas rendering.
- Scroll management.

### BirthdayExperience

Owns:
- Lifecycle of the 3D scene (mount/unmount).
- Transition in from image sequence.
- "Make a wish" UI.
- Candle interaction state.
- Final message reveal.

### CakeScene

Owns:
- R3F `<Canvas>` setup.
- Camera, lighting, environment.
- Cake model, candles, celebration.

Does NOT own:
- 2D image sequence.
- Story sections.
- UI overlays.

---

## 7. 3D Scene Architecture

### React Three Fiber Setup

```tsx
<Canvas
  camera={{ position: [0, 1.5, 5], fov: 45 }}
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
  shadows
>
  <CakeLights />
  <BirthdayCake />
  <Candles onExtinguish={handleWish} />
  <Celebration active={wishMade} />
  <Environment preset="apartment" /> {/* or custom HDRI */}
</Canvas>
```

### Performance Rules for 3D

- Load GLB lazily — do not block main bundle.
- Use `useGLTF.preload('/models/birthday-cake.glb')` to warm the cache.
- Compressed textures: KTX2 or basis compressed.
- Point lights per candle — limit to max 6–8.
- No expensive post-processing (no bloom, no SSAO) unless performance allows.
- On low-end devices: disable shadows, reduce light count.

### Candle Flame Animation

Option A (preferred): GSAP animates scale/opacity on flame mesh.
Option B: Shader-based flicker (simple noise-based vertex displacement).
Option C: Animated sprite texture for flame.

On extinguish:
- GSAP timeline: flame scale → 0, opacity → 0.
- Small upward smoke particle (CSS or Three.js).
- Point light intensity → 0 over 0.5s.

---

## 8. Data Architecture

### birthdayContent.ts

```ts
export const birthdayContent = {
  recipientName: 'Antara',
  birthdayDate: '13th August',

  hero: {
    title: 'For someone special',
    subtitle: 'This is for you.',
  },

  scenes: [
    {
      id: 'scene-01',
      text: 'Some people enter our lives quietly...',
      frameRange: [0, 20], // image sequence frames this scene spans
    },
    {
      id: 'scene-02',
      text: 'And somehow, they change everything.',
      frameRange: [20, 45],
    },
    // ...
  ],

  memories: [
    {
      image: '/images/memories/memory-01.jpg',
      title: 'The little things',
      description: 'A caption here.',
      framePosition: 50, // at which frame this memory appears
    },
    // ...
  ],

  traits: [
    'Friendly',
    'Calm',
    'Funny',
    'Energetic',
    'Hardworking',
  ],

  devReference: 'Still debugging life, one commit at a time. 🚀',

  personalMessage: `
    [Personal letter — to be filled in]
  `,

  finalMessage: {
    title: 'Happy Birthday',
    name: 'Antara',
    message: '[Final personal birthday wish — to be filled in]',
    from: 'DevArghya',
  },

  audio: {
    ambient: '/audio/ambient.mp3',
    birthday: '/audio/birthday.mp3',
  },
}
```

**Rule**: Animation code never reads text directly. It always reads from `birthdayContent`.

---

## 9. Loading Strategy

### Priority Order

```
1. HTML + Critical CSS + Fonts                  ← Browser handles
2. LoadingScreen component renders              ← Immediately visible
3. First 10 image sequence frames load          ← Loading progress tracks this
4. LoadingScreen exit → Hero visible            ← Experience begins
5. Remaining sequence frames load in bg         ← User can scroll
6. Story images / memory photos load            ← Lazy, near their position
7. GLB model preload begins                     ← When sequence is ~80% loaded
8. Audio files load                             ← Only after user gesture
```

### Asset Preload (preload.ts)

```ts
export async function preloadCriticalAssets(
  onProgress: (pct: number) => void
): Promise<void> {
  const criticalFrames = Array.from({ length: 10 }, (_, i) =>
    getFrameUrl(i, detectDevice())
  )
  let loaded = 0
  await Promise.all(
    criticalFrames.map(url =>
      loadImage(url).then(() => {
        loaded++
        onProgress((loaded / criticalFrames.length) * 100)
      })
    )
  )
}
```

---

## 10. Performance Architecture

### Device Detection (useDevicePerformance.ts)

```ts
type DeviceTier = 'high' | 'low'

export function useDevicePerformance(): DeviceTier {
  // Heuristics:
  // - navigator.hardwareConcurrency < 4 → low
  // - deviceMemory < 4 → low
  // - mobile UA → low
  // Default: high
}
```

Low-tier device adjustments:
- Use mobile sequence regardless of screen size.
- Disable 3D shadows.
- Reduce candle count.
- Disable optional particle effects.
- Reduce animation complexity.

### React Performance Rules

- Never use React state for values that update every frame.
- Use `useRef` for: canvas reference, current frame index, scroll position.
- Use `useState` only for: load complete flag, wish made flag, audio enabled flag.
- Avoid unnecessary re-renders during scroll and animation.

---

## 11. Audio Architecture

### Strategy

```ts
class AudioManager {
  private ambientAudio: HTMLAudioElement
  private birthdayAudio: HTMLAudioElement
  private enabled: boolean = false

  enable() { /* resume AudioContext, start ambient */ }
  disable() { /* pause all */ }
  transitionToBirthday() { /* crossfade ambient → birthday */ }
  playCandle() { /* small candle sound */ }
}
```

- Singleton pattern — one AudioManager instance.
- Initialized only after user gesture (click/tap).
- Respects browser autoplay policy.
- Fails silently — wrapped in try/catch.

---

## 12. Error Boundaries

Wrap sections in React Error Boundaries:
- `ImageSequence` → fallback: static Start Frame image.
- `BirthdayExperience` (R3F canvas) → fallback: static cake image + birthday message.
- Audio → silent failure (no boundary needed, just try/catch).

---

## 13. Routing

| Route | Content |
|---|---|
| `/` | Main cinematic experience (scenes 01–05 + transformation) |
| `/birthday` | 3D cake experience (scenes 06–07) |

Transition: GSAP-driven page transition when navigating from `/` to `/birthday`. Use Next.js router.

Alternative: Single page, no routing — scroll-based reveal. Either approach is valid. Coordinate with Phases.md.

---

## 14. Metadata (layout.tsx)

```ts
export const metadata: Metadata = {
  title: 'A Special Day',
  description: 'Something just for you.',
  openGraph: {
    title: 'A Special Day',
    description: 'Something just for you.',
    images: ['/images/og-preview.jpg'],
  },
  themeColor: '#0A0A0B',
}
```

Do not expose Antara's full name in public metadata unless intended.

---

## 15. AI Agent Rules (from Project Plan §38)

The agent working on this project must follow:

1. **Preserve the visual concept** — interactive cinematic birthday film. Not a generic website.
2. **Avoid unnecessary dependencies** — check if GSAP/Canvas/R3F can do it before adding a library.
3. **GSAP is the primary animation system** — do not mix animation libraries.
4. **Do not overuse React state** — high-frequency animation uses refs, GSAP, Canvas, or R3F.
5. **Performance is a feature** — evaluate CPU, GPU, memory, network, mobile for every visual feature.
6. **Mobile matters** — every component has a mobile strategy.
7. **Keep content configurable** — birthday text lives in `birthdayContent.ts`, not inside animations.
8. **Clean up animations** — GSAP timelines and ScrollTriggers must be killed on unmount.
9. **No fake functionality** — missing asset = clean placeholder/fallback, not a pretend complete feature.
10. **Do not destroy working features** — when modifying a section, preserve unrelated functionality.
