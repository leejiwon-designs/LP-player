import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, type PanInfo } from 'framer-motion';
// Procedural Web Audio API sound synthesis (zero external audio files or dependencies)
let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playNeedleDrop(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
  oscGain.gain.setValueAtTime(0.35, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  const bufferSize = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() < 0.08 ? (Math.random() * 2 - 1) : 0) * 0.4;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(2.5, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now + 0.02);
}

export function playTactileClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.035);
}


export interface LPPlayerProps {
  /** Audio track source URL */
  audioSrc?: string;
  /** Song title */
  trackName?: string;
  /** Artist name */
  artist?: string;
  /** Custom CSS class */
  className?: string;
  /** Play state callback */
  onPlayStateChange?: (isPlaying: boolean) => void;
}

/**
 * Animated Dotted Audio Wave / Volume Visualizer (Braun style)
 */
const AnimatedDottedWave: React.FC<{ isPlaying: boolean; volume: number }> = ({ isPlaying, volume }) => {
  const [animTick, setAnimTick] = useState<number>(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimTick((t) => t + 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 9 columns of dots
  const baseHeights = [7, 7, 5, 5, 4, 3, 2, 1, 1];

  return (
    <div className="flex items-center" title={`Volume: ${Math.round(volume * 100)}%`}>
      <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {baseHeights.map((baseH, colIdx) => {
          let currentDots = baseH;
          if (isPlaying) {
            const waveOffset = Math.sin((animTick + colIdx * 0.8) * 1.2);
            currentDots = Math.max(1, Math.min(7, Math.round(baseH + waveOffset * 2.2)));
          }

          const dotElements = [];
          const startY = 8 - Math.floor(currentDots / 2) * 2;
          for (let d = 0; d < currentDots; d++) {
            dotElements.push(
              <circle
                key={d}
                cx={colIdx * 4 + 2}
                cy={startY + d * 2}
                r="0.9"
                fill={isPlaying ? '#ff9470' : '#8a8594'}
              />
            );
          }
          return <g key={colIdx}>{dotElements}</g>;
        })}
      </svg>
    </div>
  );
};


const TURNTABLE_CSS = `
/* Turntable Container */
.turntable-root {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Top Orange Cables: Starting from the very top of the screen (100vh height above player) */
.top-cables-only {
  position: absolute;
  bottom: 100%;
  height: 100vh;
  left: 383px; /* Centered right above the arm holder circle (388px) */
  display: flex;
  gap: 9px;
  z-index: 1;
  pointer-events: none;
}

.top-cable-line {
  width: 8px; /* Thicker tactile cord */
  height: 100%;
  background: linear-gradient(90deg, #ff7e4d 0%, #f05523 45%, #d84315 100%);
  box-shadow: 0 4px 12px rgba(240, 85, 35, 0.25), 0 2px 6px rgba(0, 0, 0, 0.12);
  border-radius: 4px 4px 0 0;
}

/* Main Turntable Chassis */
.chassis-box {
  position: relative;
  z-index: 10;
  width: 720px;
  height: 440px;
  background-color: #f5f0eb;
  border-radius: 2px;
  border: 1px solid #e2dad4;
  box-shadow: 
    0 32px 70px -15px rgba(25, 20, 30, 0.22),
    0 16px 30px -12px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(255, 255, 255, 0.95) inset;
  display: flex;
  overflow: visible;
  user-select: none;
}

/* LEFT SECTION (60% width): Concentric Platter & Tonearm */
.chassis-left {
  position: relative;
  width: 60%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ded6d0;
  overflow: visible;
}

/* Concentric Platter Anchor (Center at 200px, 220px: perfectly center-aligned with tonearm in left deck) */
.platter-center-anchor {
  position: absolute;
  top: 50%;
  left: 200px;
  transform: translate(-50%, -50%);
  width: 350px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

/* Spinning Concentric Vinyl Assembly */
.spinning-vinyl-assembly {
  position: relative;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
}

/* 1. Underlying Concentric Charcoal / Warm Brown Groove Disc (UNDERNEATH the glass) */
.black-circles-base {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.charcoal-groove-disc {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #3e3338 0%, #30262b 68%, #241c20 100%);
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Micro-grooves texture */
.vinyl-micro-grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.38;
  background: repeating-radial-gradient(
    circle at 50% 50%,
    transparent 0px,
    transparent 3px,
    rgba(255, 255, 255, 0.08) 4px,
    transparent 5px
  );
}

/* Specular reflection sheen */
.vinyl-specular-sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.3;
  mix-blend-mode: overlay;
  background: conic-gradient(
    from 45deg at 50% 50%,
    transparent 0deg,
    rgba(255, 255, 255, 0.45) 45deg,
    transparent 100deg,
    rgba(255, 255, 255, 0.45) 225deg,
    transparent 280deg
  );
}

/* 2. Underlying Deep Black Center Core Ring (UNDERNEATH the glass) */
.black-core-ring {
  position: absolute;
  width: 176px;
  height: 176px;
  border-radius: 50%;
  background: #1e1c21;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 3. Translucent Orange Frosted Glass LP ON TOP (Covers entire 350px disc with genuine glassmorphism) */
.translucent-lp-glass {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /* True Frosted Glassmorphism: semi-transparent peach/frosted glass at bottom, radiant translucent orange at top */
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(255, 230, 215, 0.45) 28%,
    rgba(255, 160, 115, 0.6) 65%,
    rgba(240, 85, 35, 0.82) 100%
  );
  backdrop-filter: blur(5px) saturate(1.15);
  -webkit-backdrop-filter: blur(5px) saturate(1.15);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 3px rgba(255, 255, 255, 0.85),
    inset 0 -1px 3px rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 30;
}

/* 4. Orange Axis Supporter (On top of the glass LP, underneath the silver axis) */
.orange-axis-supporter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: radial-gradient(circle at 45% 40%, #ff6e40 0%, #f05523 75%, #d84315 100%);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5);
  z-index: 40;
}

/* 5. Center Silver Spindle Axis (On top holding the LP and player together) */
.center-silver-spindle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffffff 0%, #dedcd9 55%, #aba8a5 100%);
  border: 1px solid #7d7a77;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.center-spindle-pin {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1e1d21;
}

/* Stationary Tonearm Rest Cradle Post (Outside LP at x = 388px, y = 252px) */
.tonearm-rest-cradle {
  position: absolute;
  left: 388px;
  top: 252px;
  transform: translate(-50%, -50%);
  width: 9px;
  height: 15px;
  background: #ded5cf;
  border: 1px solid #ccc3bc;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 65;
  pointer-events: none;
}

.rest-cradle-notch {
  width: 5.5px;
  height: 3px;
  background: #27252a;
  border-radius: 1px;
}

/* Arm Holder Circle on Deck (Centered at x = 388px, y = 58px) */
.tonearm-pivot-base {
  position: absolute;
  top: 58px;
  left: 388px;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #e8e1dc;
  border: 1px solid #d8cfc9;
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 70;
}

.tonearm-pivot-inner-dark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #27252a;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Fixed Stationary Counterweight & Gimbal Anchor (At pivot center 14px, 14px) */
.tonearm-fixed-base-anchor {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 75;
}

/* The Movable Orange Tonearm Assembly (Z-index 80, pivots purely around origin) */
.tonearm-rotator {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 0;
  height: 0;
  cursor: grab;
  z-index: 80;
  touch-action: none;
}

.tonearm-rotator:active {
  cursor: grabbing;
}

/* Stationary Center Bearing Pin (At pivot center 14px, 14px) */
.tonearm-center-pin-anchor {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 85;
}

/* RIGHT SECTION (40% width): LCD + Slats + Perforated Speaker */
.chassis-right {
  position: relative;
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f0eb;
}

/* Slat 1 (Top): Digital LCD Window */
.lcd-slat-window {
  height: 66px;
  background: #18171a;
  border-bottom: 1px solid #ded5d0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.75);
  user-select: none;
}

.lcd-meta-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 175px;
}

.lcd-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lcd-track-name {
  font-family: var(--font-doto);
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 0.05em;
  color: #ff9470;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lcd-artist-name {
  font-family: var(--font-doto);
  font-size: 10px;
  color: #9d98a6;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lcd-meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* Countdown in Warm Amber / White */
.lcd-countdown-digits {
  font-family: var(--font-doto);
  font-weight: 900;
  font-size: 16px;
  color: #ff9470;
  line-height: 1;
}

.lcd-status-label {
  font-family: var(--font-doto);
  font-size: 8px;
  letter-spacing: 0.12em;
  color: #726e7a;
  margin-top: 3px;
}

/* 4 White Skeuomorphic Slats (All clean flush white by default) */
.slats-fader-column {
  display: flex;
  flex-direction: column;
}

.skeuo-slat-bar {
  width: 100%;
  height: 38px;
  background: #fdfbf9;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #ddd5cf;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.12s ease;
  position: relative;
}

.skeuo-slat-bar:hover {
  background: #f7f2ed;
}

.skeuo-slat-bar:active {
  background: #eae2dc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.16);
  transform: translateY(1px);
}

/* Perforated White Speaker Grille Panel (Expanded 24 cols × 18 rows grid with less corner margins) */
.speaker-perforated-panel {
  flex: 1;
  width: 100%;
  background-color: #f5f0eb;
  border-top: 1px solid #dcd4ce;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 12px 14px;
}

/* 24 Columns × 18 Rows of Circular Holes */
.perforated-holes-grid-centered {
  display: grid;
  grid-template-columns: repeat(24, 5px);
  grid-template-rows: repeat(18, 5px);
  gap: 5.5px;
  place-content: center;
  align-items: center;
  justify-content: center;
}

.speaker-hole-circle {
  width: 5px;
  height: 5px;
  min-width: 5px;
  min-height: 5px;
  max-width: 5px;
  max-height: 5px;
  aspect-ratio: 1 / 1;
  border-radius: 9999px !important;
  flex-shrink: 0;
  display: block;
  box-sizing: border-box;
  background-color: #1a191d;
  box-shadow: inset 0 1px 1.5px rgba(0, 0, 0, 0.95), 0 0.5px 1px rgba(255, 255, 255, 0.6);
}

/* Speed Selector Knob (33 / 45 RPM) - Exact screenshot match */
.speed-knob-container {
  position: absolute;
  left: 66px;
  bottom: 42px;
  transform: translate(-50%, 50%);
  z-index: 60;
  user-select: none;
}

.speed-knob-dial {
  position: relative;
  width: 58px;
  height: 58px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

/* Thin Hairline Circle Outline */
.speed-dial-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1px solid #cdc6be;
  pointer-events: none;
  background: transparent;
}

/* Stations for 33 and 45 */
.speed-dial-station {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 3.5px;
  pointer-events: none;
}

/* 33 RPM: Upper-right arc (~ -35 deg) */
.station-33 {
  left: 49px;
  top: 7px;
}

.station-33 .speed-station-tick {
  width: 6px;
  height: 1px;
  background-color: #9e968f;
  transform: rotate(-35deg);
  transform-origin: center;
}

.station-33 .speed-station-num {
  font-family: var(--font-inter);
  font-size: 8px;
  font-weight: 600;
  color: #8c857e;
  line-height: 1;
  transition: color 0.15s ease;
}

/* 45 RPM: Horizontal right arc (0 deg) */
.station-45 {
  left: 56px;
  top: 25px;
}

.station-45 .speed-station-tick {
  width: 6px;
  height: 1px;
  background-color: #9e968f;
}

.station-45 .speed-station-num {
  font-family: var(--font-inter);
  font-size: 8px;
  font-weight: 600;
  color: #8c857e;
  line-height: 1;
  transition: color 0.15s ease;
}

.speed-dial-station.active .speed-station-num {
  color: #f05523;
  font-weight: 700;
}

.speed-dial-station.active .speed-station-tick {
  background-color: #f05523;
}

/* Single Directional White Pointer Lever */
.speed-pointer-rotator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.speed-pointer-lever {
  position: absolute;
  top: -2.25px;
  left: -2px; /* starts at pivot center */
  width: 25px; /* extends from center outward to circle rim */
  height: 4.5px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 
    0 2.5px 4.5px rgba(0, 0, 0, 0.28),
    0 0.5px 1px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 1);
  border: 0.5px solid rgba(0, 0, 0, 0.08);
}
`;

export const LPPlayer: React.FC<LPPlayerProps> = ({
  audioSrc = '/audio/ocean-bubbles.mp3',
  trackName = 'Ocean Bubble',
  artist = '9jackjack8',
  className = '',
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speedRpm, setSpeedRpm] = useState<33 | 45>(33);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playback speed with RPM
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speedRpm === 45 ? 1.35 : 1.0;
    }
  }, [speedRpm]);

  const handlePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      playNeedleDrop();
      audioRef.current.playbackRate = speedRpm === 45 ? 1.35 : 1.0;
      await audioRef.current.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    } catch {
      setIsPlaying(false);
    }
  }, [onPlayStateChange, speedRpm]);

  const handlePause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  const togglePlayPause = useCallback(() => {
    playTactileClick();
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const toggleSpeed = useCallback(() => {
    playTactileClick();
    setSpeedRpm((prev) => (prev === 33 ? 45 : 33));
  }, []);

  const isPanningRef = useRef<boolean>(false);

  const handleArmPanStart = () => {
    isPanningRef.current = true;
  };

  const handleArmPanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If flicked or dragged to the left (negative offset or leftward velocity) -> play
    if (info.offset.x < -10 || info.velocity.x < -100) {
      if (!isPlaying) handlePlay();
    } else if (info.offset.x > 10 || info.velocity.x > 100) {
      // If flicked or dragged to the right (positive offset or rightward velocity) -> pause
      if (isPlaying) handlePause();
    }
    // Release pan lock after tiny delay to prevent subsequent click event from toggling
    setTimeout(() => {
      isPanningRef.current = false;
    }, 50);
  };

  // 4 Stepped Volume Levels: 100%, 75%, 50%, 25%
  const volumeSteps = [1.0, 0.75, 0.5, 0.25];
  const handleSlatClick = (index: number) => {
    playTactileClick();
    setVolume(volumeSteps[index]);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(0, duration - currentTime);

  // Calculated Tonearm Angle:
  // Stopped (resting in cradle OUTSIDE the LP at x = 388px): 0 deg
  // Playing (tracking across grooves ON TOP of the LP): 20 deg to 26 deg
  const tonearmAngle = isPlaying
    ? 20 + (duration > 0 ? (currentTime / duration) * 6 : 0)
    : 0;

  return (
    <div className={`turntable-root ${className}`}>
      {/* Self-contained encapsulated component styles */}
      <style>{TURNTABLE_CSS}</style>
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={handlePause}
      />

      {/* Top Orange Cables: Starting from the very top of the screen (100vh) down to the chassis edge */}
      <div className="top-cables-only">
        <div className="top-cable-line" />
        <div className="top-cable-line" />
      </div>

      {/* Main Turntable Chassis */}
      <div className="chassis-box">
        {/* LEFT SECTION (60%): Concentric Platter & Tonearm */}
        <div className="chassis-left">
          {/* Concentric Platter Anchor (Center at 200px, 220px: perfectly center-aligned with tonearm) */}
          <div className="platter-center-anchor">
            {/* Spinning Concentric Vinyl Assembly */}
            <motion.div
              className="spinning-vinyl-assembly"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{
                rotate: {
                  repeat: isPlaying ? Infinity : 0,
                  duration: speedRpm === 45 ? 1.33 : 1.82,
                  ease: 'linear',
                },
              }}
              onClick={togglePlayPause}
              title="Click vinyl to play or pause"
            >
              {/* 1. BOTTOM BASE: Black & Brown Vinyl Circles Base */}
              <div className="black-circles-base">
                <div className="charcoal-groove-disc">
                  <div className="vinyl-micro-grooves" />
                  <div className="vinyl-specular-sheen" />
                  <div className="black-core-ring" />
                </div>
              </div>

              {/* 2. LP: The Orange Glassy LP Disc (Frosted Glassmorphism on top of the black circles) */}
              <div className="translucent-lp-glass" />

              {/* 3. ORANGE SUPPORTER: Supporter of the axis on top of the glass LP */}
              <div className="orange-axis-supporter" />

              {/* 4. AXIS: The Silver Spindle Axis on top holding everything together */}
              <div className="center-silver-spindle">
                <div className="center-spindle-pin" />
              </div>
            </motion.div>
          </div>

          {/* Speed Selector Knob (33 / 45 RPM) - Exact screenshot match */}
          <div className="speed-knob-container">
            <button
              type="button"
              className="speed-knob-dial"
              onClick={toggleSpeed}
              title={`Speed: ${speedRpm} RPM (Click to switch to ${speedRpm === 33 ? 45 : 33} RPM)`}
              aria-label={`Toggle Speed between 33 and 45 RPM. Current: ${speedRpm} RPM`}
            >
              {/* Thin Hairline Circle Outline */}
              <div className="speed-dial-ring" />

              {/* 33 RPM: Tick line + number placed outside the circle at upper-right (~ -35 deg) */}
              <div className={`speed-dial-station station-33 ${speedRpm === 33 ? 'active' : ''}`}>
                <span className="speed-station-tick" />
                <span className="speed-station-num">33</span>
              </div>

              {/* 45 RPM: Tick line + number placed outside the circle at horizontal right (0 deg) */}
              <div className={`speed-dial-station station-45 ${speedRpm === 45 ? 'active' : ''}`}>
                <span className="speed-station-tick" />
                <span className="speed-station-num">45</span>
              </div>

              {/* Single Directional White Lever pivoting from center outward */}
              <motion.div
                className="speed-pointer-rotator"
                animate={{ rotate: speedRpm === 33 ? -35 : 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              >
                <div className="speed-pointer-lever" />
              </motion.div>
            </button>
          </div>

          {/* Stationary Tonearm Rest Cradle on Deck (Outside the LP at x = 388px, y = 252px) */}
          <div className="tonearm-rest-cradle" title="Tonearm rest cradle">
            <div className="rest-cradle-notch" />
          </div>

          {/* Arm Holder Circle on Deck (Centered at x = 388px, y = 58px) */}
          <div className="tonearm-pivot-base">
            <div className="tonearm-pivot-inner-dark">
              {/* 1. FIXED STATIONARY BASE & COUNTERWEIGHT (Centered at 14px, 14px) */}
              <div className="tonearm-fixed-base-anchor">
                <svg
                  width="60"
                  height="60"
                  viewBox="-30 -30 60 60"
                  className="tonearm-fixed-base-svg"
                  style={{
                    position: 'absolute',
                    left: -30,
                    top: -30,
                    width: 60,
                    height: 60,
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <defs>
                    {/* Metallic Counterweight Gradient */}
                    <linearGradient id="counterweightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#45424b" />
                      <stop offset="40%" stopColor="#2c2a30" />
                      <stop offset="70%" stopColor="#38353d" />
                      <stop offset="100%" stopColor="#1e1c20" />
                    </linearGradient>

                    <filter id="baseShadow" x="-30%" y="-20%" width="160%" height="150%">
                      <feDropShadow dx="-1" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  <g filter="url(#baseShadow)">
                    {/* Metallic Counterweight (Extends upward behind pivot axis, stationary) */}
                    <rect x="-9" y="-22" width="18" height="15" rx="2" fill="url(#counterweightGrad)" stroke="#1a191d" strokeWidth="0.8" />
                    <line x1="-9" y1="-14" x2="9" y2="-14" stroke="#5d5964" strokeWidth="0.75" />

                    {/* Tonearm Gimbal Center Ring (Stationary socket base, centered at 0, 0) */}
                    <circle cx="0" cy="0" r="10" fill="#1e1d22" stroke="#3d3a43" strokeWidth="1" />
                  </g>
                </svg>
              </div>

              {/* 2. ROTATING ORANGE TONEARM ASSEMBLY (Only the orange arm rotates, zero translation displacement) */}
              <motion.div
                className="tonearm-rotator"
                animate={{ rotate: tonearmAngle }}
                transition={{ type: 'spring', stiffness: 85, damping: 15 }}
                onPanStart={handleArmPanStart}
                onPanEnd={handleArmPanEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPanningRef.current) return;
                  togglePlayPause();
                }}
                title={isPlaying ? "Tonearm playing on LP (click or swipe right to rest & stop)" : "Tonearm at rest outside LP (click or swipe left onto LP to play)"}
              >
                <svg
                  width="90"
                  height="290"
                  viewBox="-45 -25 90 290"
                  className="tonearm-svg-graphic"
                  style={{
                    position: 'absolute',
                    left: -45,
                    top: -25,
                    width: 90,
                    height: 290,
                    overflow: 'visible',
                    pointerEvents: 'auto',
                    cursor: 'grab',
                  }}
                >
                  <defs>
                    {/* 3D Cylindrical Gradient for Tonearm Wand */}
                    <linearGradient id="tonearmTubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff7a45" />
                      <stop offset="35%" stopColor="#f05523" />
                      <stop offset="70%" stopColor="#d84315" />
                      <stop offset="100%" stopColor="#bf360c" />
                    </linearGradient>

                    {/* Cartridge Gradient */}
                    <linearGradient id="cartridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2e2b32" />
                      <stop offset="100%" stopColor="#18171a" />
                    </linearGradient>

                    {/* Physical Tonearm Drop Shadow */}
                    <filter id="armShadow" x="-30%" y="-10%" width="160%" height="130%">
                      <feDropShadow dx="-2" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  <g filter="url(#armShadow)">
                    {/* Orange Root Collar (Smooth pivot under fixed gimbal cap) */}
                    <circle cx="0" cy="0" r="4.5" fill="#f05523" />

                    {/* Solid Orange Tonearm Tube (5.5px thickness) */}
                    <rect x="-2.75" y="0" width="5.5" height="198" rx="2.75" fill="url(#tonearmTubeGrad)" />

                    {/* Cueing Finger Lift tab */}
                    <path
                      d="M 2.75,190 C 7.5,189 12,183 13,178"
                      stroke="#dedcd9"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Cartridge & Headshell (Angled 20° inward towards the record) */}
                    <polygon
                      points="-2.75,194 2.75,194 -6.5,224 -14.5,221"
                      fill="url(#cartridgeGrad)"
                      stroke="#141316"
                      strokeWidth="0.8"
                    />
                    {/* Stylus Cartridge Accent Stripe */}
                    <line x1="-6" y1="202" x2="-11.5" y2="218" stroke="#ff5722" strokeWidth="1.3" />
                    {/* Stylus needle pin indicator */}
                    <circle cx="-10.5" cy="222.5" r="1.3" fill="#ffffff" />
                  </g>
                </svg>
              </motion.div>

              {/* 3. STATIONARY BEARING PIN (Centered at 14px, 14px) */}
              <div className="tonearm-center-pin-anchor">
                <svg
                  width="20"
                  height="20"
                  viewBox="-10 -10 20 20"
                  className="tonearm-center-pin-svg"
                  style={{
                    position: 'absolute',
                    left: -10,
                    top: -10,
                    width: 20,
                    height: 20,
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <circle cx="0" cy="0" r="3.5" fill="#b0aba5" stroke="#78746e" strokeWidth="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (40%): LCD Display + Slats + Perforated Speaker Panel */}
        <div className="chassis-right">
          {/* SLAT 1 (Top): Digital LCD Window with Doto Typography & Animated Wave */}
          <div className="lcd-slat-window">
            <div className="lcd-meta-left">
              <span className="lcd-track-name">{isPlaying ? trackName : 'STANDBY'}</span>
              <div className="lcd-title-row">
                <span className="lcd-artist-name">{artist}</span>
                {/* Dynamically Animated Dotted Wave / Equalizer */}
                <AnimatedDottedWave isPlaying={isPlaying} volume={volume} />
              </div>
            </div>
            <div className="lcd-meta-right">
              {/* Countdown in Amber / White (NOT Green) */}
              <span className="lcd-countdown-digits">
                {isPlaying ? `-${formatTime(timeRemaining)}` : formatTime(duration || 0)}
              </span>
              <span className="lcd-status-label">{isPlaying ? 'PLAYING' : 'OFFLINE'}</span>
            </div>
          </div>

          {/* SLATS 2-5: 4 White Skeuomorphic Slats */}
          <div className="slats-fader-column">
            {volumeSteps.map((vStep, idx) => (
              <button
                key={idx}
                type="button"
                className="skeuo-slat-bar"
                onClick={() => handleSlatClick(idx)}
                aria-label={`Set Volume to ${vStep * 100}%`}
                title={`Volume: ${vStep * 100}%`}
              />
            ))}
          </div>

          {/* LOWER SECTION: Perforated White Speaker Grille Panel (24 × 18 Circular Dots Grid) */}
          <div className="speaker-perforated-panel">
            <div className="perforated-holes-grid-centered">
              {Array.from({ length: 24 * 18 }).map((_, holeIdx) => (
                <div key={holeIdx} className="speaker-hole-circle" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPPlayer;
