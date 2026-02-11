import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

/**
 * Animated countdown timer with a circular progress ring,
 * staggered number reveals, and a final "GO!" burst.
 *
 * Ideal composition size: 1080x1080, 30fps, 150 frames (5 seconds)
 */

const {fontFamily} = loadFont();

const COLOR_BG = '#0f172a';
const COLOR_RING_TRACK = '#1e293b';
const COLOR_RING_FILL = '#38bdf8';
const COLOR_TEXT = '#f1f5f9';
const COLOR_GO = '#22d3ee';

const COUNTDOWN_FROM = 3;
const RING_SIZE = 400;
const RING_STROKE = 16;

const CircularProgress: React.FC<{progress: number}> = ({progress}) => {
	const radius = (RING_SIZE - RING_STROKE) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference * (1 - progress);

	return (
		<svg
			width={RING_SIZE}
			height={RING_SIZE}
			style={{position: 'absolute', transform: 'rotate(-90deg)'}}
		>
			{/* Track */}
			<circle
				cx={RING_SIZE / 2}
				cy={RING_SIZE / 2}
				r={radius}
				fill="none"
				stroke={COLOR_RING_TRACK}
				strokeWidth={RING_STROKE}
			/>
			{/* Fill */}
			<circle
				cx={RING_SIZE / 2}
				cy={RING_SIZE / 2}
				r={radius}
				fill="none"
				stroke={COLOR_RING_FILL}
				strokeWidth={RING_STROKE}
				strokeDasharray={circumference}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap="round"
			/>
		</svg>
	);
};

const CountdownNumber: React.FC<{
	number: number;
	enterFrame: number;
	exitFrame: number;
}> = ({number, enterFrame, exitFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enterProgress = spring({
		frame: frame - enterFrame,
		fps,
		config: {damping: 12, stiffness: 200},
	});

	const exitProgress = spring({
		frame: frame - exitFrame,
		fps,
		config: {damping: 200},
	});

	const scale = interpolate(enterProgress, [0, 1], [0.3, 1]) * (1 - exitProgress);
	const opacity = enterProgress * (1 - exitProgress);

	if (frame < enterFrame || opacity <= 0) return null;

	return (
		<div
			style={{
				position: 'absolute',
				fontSize: 180,
				fontWeight: 800,
				color: COLOR_TEXT,
				fontFamily,
				transform: `scale(${scale})`,
				opacity,
			}}
		>
			{number}
		</div>
	);
};

const GoBurst: React.FC<{enterFrame: number}> = ({enterFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - enterFrame,
		fps,
		config: {damping: 8, stiffness: 180},
	});

	const scale = interpolate(progress, [0, 1], [0.2, 1.2]);
	const opacity = frame >= enterFrame ? 1 : 0;

	const glowRadius = interpolate(progress, [0, 1], [0, 60], {
		extrapolateRight: 'clamp',
	});

	if (frame < enterFrame) return null;

	return (
		<div
			style={{
				position: 'absolute',
				fontSize: 160,
				fontWeight: 900,
				color: COLOR_GO,
				fontFamily,
				transform: `scale(${scale})`,
				opacity,
				textShadow: `0 0 ${glowRadius}px ${COLOR_GO}`,
			}}
		>
			GO!
		</div>
	);
};

const PulseRing: React.FC<{enterFrame: number}> = ({enterFrame}) => {
	const frame = useCurrentFrame();

	if (frame < enterFrame) return null;

	const elapsed = frame - enterFrame;
	const scale = interpolate(elapsed, [0, 20], [1, 1.8], {
		extrapolateRight: 'clamp',
	});
	const opacity = interpolate(elapsed, [0, 20], [0.6, 0], {
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				position: 'absolute',
				width: RING_SIZE,
				height: RING_SIZE,
				borderRadius: '50%',
				border: `3px solid ${COLOR_RING_FILL}`,
				transform: `scale(${scale})`,
				opacity,
			}}
		/>
	);
};

export const MyAnimation = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const countdownDuration = COUNTDOWN_FROM * fps;
	const segmentLength = fps;

	// Overall ring progress from 0 to 1 over the countdown portion
	const ringProgress = interpolate(frame, [0, countdownDuration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.linear,
	});

	// Background subtle pulse
	const bgPulse = interpolate(
		Math.sin((frame / fps) * Math.PI * 2),
		[-1, 1],
		[0.95, 1.05],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLOR_BG,
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily,
			}}
		>
			{/* Subtle radial gradient background pulse */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: `radial-gradient(circle at center, ${COLOR_RING_FILL}10 0%, transparent 60%)`,
					transform: `scale(${bgPulse})`,
				}}
			/>

			{/* Circular progress ring */}
			<CircularProgress progress={ringProgress} />

			{/* Pulse rings at each countdown beat */}
			{Array.from({length: COUNTDOWN_FROM}).map((_, i) => (
				<PulseRing key={i} enterFrame={(i + 1) * segmentLength} />
			))}

			{/* Countdown numbers: 3, 2, 1 */}
			{Array.from({length: COUNTDOWN_FROM}).map((_, i) => {
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
			})}

			{/* GO! burst */}
			<GoBurst enterFrame={countdownDuration} />
		</AbsoluteFill>
	);
};
