---
name: countdown-animation
description: Animated countdown timer with circular progress ring, staggered spring reveals, and burst effects
metadata:
  tags: countdown, timer, spring, svg, staggered-animation
---

## Countdown Timer Pattern

A countdown timer combines several Remotion techniques into a single cohesive animation:

1. **SVG circular progress** driven by `interpolate()` over frames
2. **Staggered spring entrances** for each number
3. **Enter/exit pairing** — each number springs in, then fades out
4. **Final burst** with bouncy spring and glow

## Circular Progress with SVG

Use `strokeDasharray` and `strokeDashoffset` to animate an SVG circle ring:

```tsx
const CircularProgress: React.FC<{progress: number}> = ({progress}) => {
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={SIZE} height={SIZE} style={{transform: 'rotate(-90deg)'}}>
      <circle
        cx={SIZE / 2} cy={SIZE / 2} r={radius}
        fill="none" stroke="#38bdf8"
        strokeWidth={STROKE}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};
```

Drive `progress` from the frame:

```tsx
const ringProgress = interpolate(frame, [0, countdownDuration], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

## Staggered Number Reveals

Give each countdown number an enter frame and exit frame based on segment length:

```tsx
Array.from({length: COUNTDOWN_FROM}).map((_, i) => {
  const num = COUNTDOWN_FROM - i;
  const enterFrame = i * segmentLength;
  const exitFrame = (i + 1) * segmentLength;
  return (
    <CountdownNumber
      key={num}
      number={num}
      enterFrame={enterFrame}
      exitFrame={exitFrame}
    />
  );
});
```

Each number uses two springs — one for enter (bouncy) and one for exit (smooth):

```tsx
const enterProgress = spring({
  frame: frame - enterFrame,
  fps,
  config: {damping: 12, stiffness: 200}, // bouncy entrance
});

const exitProgress = spring({
  frame: frame - exitFrame,
  fps,
  config: {damping: 200}, // smooth exit
});

const scale = interpolate(enterProgress, [0, 1], [0.3, 1]) * (1 - exitProgress);
const opacity = enterProgress * (1 - exitProgress);
```

## Burst Effect with Glow

For the final "GO!" text, use a bouncy spring with `textShadow` for a glow:

```tsx
const progress = spring({
  frame: frame - enterFrame,
  fps,
  config: {damping: 8, stiffness: 180}, // very bouncy
});

const glowRadius = interpolate(progress, [0, 1], [0, 60], {
  extrapolateRight: 'clamp',
});

<div style={{
  transform: `scale(${scale})`,
  textShadow: `0 0 ${glowRadius}px ${COLOR_GO}`,
}}>
  GO!
</div>
```

## Working Example

See [`assets/animations-countdown-timer.tsx`](assets/animations-countdown-timer.tsx) for a complete implementation.

Composition config: `1080x1080`, `30fps`, `150 frames` (5 seconds).
