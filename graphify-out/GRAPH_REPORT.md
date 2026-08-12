# Graph Report - Birthday-Gift  (2026-08-12)

## Corpus Check
- 51 files · ~1,668,109 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 442 nodes · 558 edges · 42 communities (35 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2040f1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .render
- Architecture.md — Technical Architecture
- app/page.tsx
- Phases.md — Development Phases
- PRD — Premium Interactive Birthday Experience
- dependencies
- compilerOptions
- ImageTrail.tsx
- StorySection.tsx
- devDependencies
- Design.md — Visual Design System
- 9. 3D Cake Scene Design
- LoadingScreen.tsx
- 11. UI Components
- 12. Motion Design Principles
- 5. Loading Screen Design
- 6. Hero Scene Design
- 7. Image Sequence & Story Overlay Design
- 3. Color System
- 4. Typography System
- 8. Birthday Transformation Design
- README.md
- layout.tsx
- BirthdayUI.tsx
- 2. Visual Identity
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- tailwind.config.ts

## God Nodes (most connected - your core abstractions)
1. `Design.md — Visual Design System` - 19 edges
2. `PRD — Premium Interactive Birthday Experience` - 19 edges
3. `Architecture.md — Technical Architecture` - 17 edges
4. `compilerOptions` - 16 edges
5. `Phases.md — Development Phases` - 16 edges
6. `ImageTrailVariant6` - 10 edges
7. `lerp()` - 9 edges
8. `getLocalPointerPos()` - 9 edges
9. `getMouseDistance()` - 9 edges
10. `ImageTrailVariant1` - 8 edges

## Surprising Connections (you probably didn't know these)
- `useLenis()` --references--> `lenis`  [EXTRACTED]
  src/hooks/useLenis.ts → package.json
- `StorySection()` --calls--> `useSequenceContext()`  [EXTRACTED]
  src/components/story/StorySection.tsx → src/components/sequence/SequenceContext.ts
- `Hero()` --calls--> `playHeroEntrance()`  [EXTRACTED]
  src/components/hero/Hero.tsx → src/animations/heroAnimations.ts
- `LoadingScreen()` --calls--> `playLoaderEntrance()`  [EXTRACTED]
  src/components/loading/LoadingScreen.tsx → src/animations/loadingAnimations.ts
- `LoadingScreen()` --calls--> `playLoaderExit()`  [EXTRACTED]
  src/components/loading/LoadingScreen.tsx → src/animations/loadingAnimations.ts

## Import Cycles
- None detected.

## Communities (42 total, 7 thin omitted)

### Community 0 - ".render"
Cohesion: 0.08
Nodes (10): getLocalPointerPos(), getMouseDistance(), ImageTrailVariant2, ImageTrailVariant3, ImageTrailVariant4, ImageTrailVariant5, ImageTrailVariant6, ImageTrailVariant7 (+2 more)

### Community 1 - "Architecture.md — Technical Architecture"
Cohesion: 0.04
Nodes (47): 10. Performance Architecture, 11. Audio Architecture, 12. Error Boundaries, 13. Routing, 14. Metadata (layout.tsx), 15. AI Agent Rules (from Project Plan §38), 1. Technology Stack, 2. Folder Structure (+39 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.08
Nodes (29): createTraitReveal(), Page(), BirthdayExperience(), ImageSequence(), ImageSequenceProps, SequenceCanvas(), SequenceCanvasProps, SequenceContext (+21 more)

### Community 3 - "Phases.md — Development Phases"
Cohesion: 0.05
Nodes (41): Check for each platform, Core Rule for the AI Agent, Deliverable, Deliverable, Deliverable, Deliverable, Deliverable, Deliverable (+33 more)

### Community 4 - "PRD — Premium Interactive Birthday Experience"
Cohesion: 0.06
Nodes (30): 10. Design Requirements, 11. Performance Requirements, 12. Accessibility Requirements, 13. Browser Targets, 14. Error Handling, 15. Definition of Done, 16. Priority Order, 17. Final Creative Direction (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (29): gsap, howler, lenis, next, dependencies, gsap, howler, lenis (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "ImageTrail.tsx"
Cohesion: 0.12
Nodes (13): cachedRect(), getNewPosition(), ImageItem, ImageTrail, ImageTrailConstructor, ImageTrailProps, ImageTrailVariant1, _point (+5 more)

### Community 8 - "StorySection.tsx"
Cohesion: 0.12
Nodes (16): HeroRefs, playHeroEntrance(), Hero(), HeroProps, Marquee(), MarqueeProps, Content, CURRENT_YEAR (+8 more)

### Community 9 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, sharp, tailwindcss, @tailwindcss/postcss (+13 more)

### Community 10 - "Design.md — Visual Design System"
Cohesion: 0.20
Nodes (9): 10. Final Message Design, 13. Spacing System, 14. Z-Index Stack, 15. Tailwind Configuration Notes, 16. Asset Naming Convention, 17. Responsive Breakpoints, 1. Design Philosophy, Design.md — Visual Design System (+1 more)

### Community 11 - "9. 3D Cake Scene Design"
Cohesion: 0.33
Nodes (6): 9. 3D Cake Scene Design, Camera, Candle Behavior, Lighting Setup, Post-Extinguish, Visual Target

### Community 12 - "LoadingScreen.tsx"
Cohesion: 0.60
Nodes (4): playLoaderEntrance(), playLoaderExit(), LoadingScreen(), LoadingScreenProps

### Community 13 - "11. UI Components"
Cohesion: 0.40
Nodes (5): 11. UI Components, Audio Toggle, Interaction Button (Click/Tap to blow), "Make a Wish" Prompt, Progress Bar (Loading)

### Community 14 - "12. Motion Design Principles"
Cohesion: 0.40
Nodes (5): 12. Motion Design Principles, GSAP Easing Philosophy, Reduced Motion, Scroll Animation Rules, Timing

### Community 15 - "5. Loading Screen Design"
Cohesion: 0.40
Nodes (5): 5. Loading Screen Design, Do Not, Layout, Transition to Hero, Visual Direction

### Community 16 - "6. Hero Scene Design"
Cohesion: 0.40
Nodes (5): 6. Hero Scene Design, Concept, Hero Animation, Hero Text Overlay (optional / minimal), Start Frame visual description

### Community 17 - "7. Image Sequence & Story Overlay Design"
Cohesion: 0.40
Nodes (5): 7. Image Sequence & Story Overlay Design, Image Sequence, Memory Photo Design, Scene Label Style, Story Text Overlays

### Community 18 - "3. Color System"
Cohesion: 0.50
Nodes (4): 3. Color System, Color Journey (follows the story arc), CSS Variables (globals.css), Primary Palette

### Community 19 - "4. Typography System"
Cohesion: 0.50
Nodes (4): 4. Typography System, Font Stack, Type Scale, Typography Rules

### Community 20 - "8. Birthday Transformation Design"
Cohesion: 0.50
Nodes (4): 8. Birthday Transformation Design, Concept, End Frame visual description, Transition to 3D

### Community 21 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 24 - "2. Visual Identity"
Cohesion: 0.67
Nodes (3): 2. Visual Identity, Anti-Keywords (things to avoid completely), Keywords

## Knowledge Gaps
- **221 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+216 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLenis()` connect `app/page.tsx` to `dependencies`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `lenis` connect `dependencies` to `app/page.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _221 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.render` be split into smaller, more focused modules?**
  _Cohesion score 0.0815686274509804 - nodes in this community are weakly interconnected._
- **Should `Architecture.md — Technical Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08067375886524823 - nodes in this community are weakly interconnected._
- **Should `Phases.md — Development Phases` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._