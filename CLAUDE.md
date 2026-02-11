# CLAUDE.md

## Project Overview

`@remotion/skills` is an internal package within the [Remotion](https://github.com/remotion-dev/remotion) monorepo. It contains skill documentation and example components for Remotion — a React framework for programmatically creating videos. The package serves as a knowledge base of best practices, rule documentation, and reference implementations for video creation patterns.

This is a **private, documentation-heavy** package (not published to npm). It is not a library with runtime consumers — it provides educational rules and working example components.

## Repository Structure

```
├── src/
│   ├── index.ts                  # Entry point — registers RemotionRoot
│   └── Root.tsx                  # Remotion root defining example compositions
├── skills/
│   └── remotion/
│       ├── SKILL.md              # Skill metadata and index of all rules
│       └── rules/               # 35 markdown rule files + example assets
│           ├── *.md             # Documentation for each Remotion pattern
│           └── assets/          # Working example component implementations
│               ├── charts-bar-chart.tsx
│               ├── text-animations-typewriter.tsx
│               └── text-animations-word-highlight.tsx
├── package.json
├── tsconfig.json
├── .prettierrc
└── README.md
```

### Key Directories

- **`src/`** — Minimal source code. `index.ts` registers the root; `Root.tsx` defines example compositions using the asset components.
- **`skills/remotion/rules/`** — The core of the package. 35 markdown files documenting Remotion patterns (animations, timing, audio, video, captions, 3D, charts, etc.). Each file contains explanations and code examples.
- **`skills/remotion/rules/assets/`** — Working TypeScript/React component implementations that demonstrate the documented patterns.

## Tech Stack

- **TypeScript** with React JSX (`"jsx": "react-jsx"`)
- **Remotion** v4.0.x — core video creation framework
- **React** — component model (via monorepo catalog)
- Key Remotion packages: `@remotion/cli`, `@remotion/bundler`, `@remotion/shapes`, `@remotion/three`, `@remotion/lottie`, `@remotion/google-fonts`

## Development Commands

```bash
# Start the Remotion Studio dev environment (preview compositions in browser)
npm run dev
```

This is the only script. There are no build, test, or lint scripts defined at this package level — those are managed at the monorepo root.

## Code Style and Formatting

- **Prettier** with: 2-space indentation, no tabs, bracket spacing enabled (`.prettierrc`)
- **ESLint** via `@remotion/eslint-config-internal` (shared monorepo config, no local `.eslintrc`)
- **TypeScript** config: `"module": "Preserve"`, `"noEmit": true`, `"skipLibCheck": true`
- Uses `type` (not `interface`) for component props
- Tab-based indentation in source files (matching the existing codebase style in `Root.tsx`, `index.ts`)

## Remotion Conventions (Critical for AI Assistants)

### Animation Rules

1. **All animations MUST use `useCurrentFrame()`** — this is the fundamental rule. Every motion, opacity change, or transform must be driven by the current frame number.
2. **Never use CSS transitions, CSS animations, `setTimeout`, `setInterval`, or Tailwind animation classes.** Remotion renders frame-by-frame; CSS-based timing will not work during rendering.
3. Use `interpolate()` for linear/eased motion and `spring()` for organic, physics-based motion.
4. Time is always expressed in **frames**, not seconds. Convert with: `seconds * fps`.

### Component Patterns

```tsx
// Standard Remotion component structure
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

type MyComponentProps = { /* props here */ };

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Drive all animation from `frame`
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return <div style={{ opacity }}>...</div>;
};
```

### Composition Definition

```tsx
<Composition
  id="MyVideo"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{}}
/>
```

### Asset Usage

- Place media files in the `public/` folder, reference with `staticFile('filename.mp4')`
- Use Remotion components (`<Img>`, `<Video>`, `<Audio>`) — not native HTML `<img>`, `<video>`, `<audio>`
- Use `delayRender()` / `continueRender()` for async asset loading

### Spring Presets

| Effect | Config |
|--------|--------|
| Smooth (no bounce) | `{ damping: 200 }` |
| Snappy | `{ damping: 20, stiffness: 200 }` |
| Bouncy | `{ damping: 8 }` |
| Heavy | `{ damping: 15, stiffness: 80, mass: 2 }` |

## Rules Documentation Index

The `skills/remotion/SKILL.md` file is the master index. Key topic areas:

| Category | Files |
|----------|-------|
| Core Animation | `animations.md`, `timing.md`, `transitions.md`, `sequencing.md`, `trimming.md` |
| Media | `assets.md`, `images.md`, `videos.md`, `audio.md`, `fonts.md`, `gifs.md` |
| Text | `text-animations.md`, `measuring-text.md` |
| Captions | `subtitles.md`, `display-captions.md`, `import-srt-captions.md`, `transcribe-captions.md` |
| Data Viz | `charts.md` |
| Advanced | `3d.md`, `lottie.md`, `light-leaks.md`, `audio-visualization.md`, `maps.md` |
| Composition | `compositions.md`, `calculate-metadata.md`, `parameters.md`, `measuring-dom-nodes.md` |
| Video Utils | `can-decode.md`, `extract-frames.md`, `get-video-duration.md`, `get-audio-duration.md`, `get-video-dimensions.md`, `transparent-videos.md` |
| Tooling | `ffmpeg.md`, `tailwind.md` |

## Editing Guidelines for AI Assistants

- When adding new rule files, follow the existing pattern: create a `.md` file in `skills/remotion/rules/` and add its entry to `skills/remotion/SKILL.md`.
- When adding new example components, place them in `skills/remotion/rules/assets/` and register them as compositions in `src/Root.tsx`.
- Export components as `MyAnimation` (the convention used by existing assets).
- All example components must be self-contained and demonstrate the pattern they document.
- Props should use `type` declarations and be JSON-serializable.
- No tests exist in this package. Validate changes by running `npm run dev` and previewing in Remotion Studio.
