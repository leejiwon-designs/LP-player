import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { playNeedleDrop, playTactileClick } from '../utils/vinylAudio';

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

  const handleArmDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged to the left (negative offset) towards the LP -> play
    if (info.offset.x < -10) {
      handlePlay();
    } else if (info.offset.x > 10) {
      // If dragged to the right towards the rest cradle -> pause
      handlePause();
    }
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
  // Stopped (resting in cradle OUTSIDE the LP at x = 378px): 0 deg
  // Playing (tracking across grooves ON TOP of the LP): 20 deg to 26 deg
  const tonearmAngle = isPlaying
    ? 20 + (duration > 0 ? (currentTime / duration) * 6 : 0)
    : 0;

  return (
    <div className={`turntable-root ${className}`}>
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

          {/* Stationary Tonearm Rest Cradle on Deck (Outside the LP at x = 378px, y = 252px) */}
          <div className="tonearm-rest-cradle" title="Tonearm rest cradle">
            <div className="rest-cradle-notch" />
          </div>

          {/* Arm Holder Circle on Deck (Centered at x = 378px, y = 58px) */}
          <div className="tonearm-pivot-base">
            <div className="tonearm-pivot-inner-dark">
              {/* ARM AT THE VERY TOP: Rotating Tonearm Assembly */}
              <motion.div
                className="tonearm-rotator"
                animate={{ rotate: tonearmAngle }}
                transition={{ type: 'spring', stiffness: 85, damping: 15 }}
                drag="x"
                dragConstraints={{ left: -45, right: 10 }}
                dragElastic={0.12}
                onDragEnd={handleArmDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                title={isPlaying ? "Tonearm playing on LP (click or drag right to rest & stop)" : "Tonearm at rest outside LP (click or drag left onto LP to play)"}
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

                    {/* Metallic Counterweight Gradient */}
                    <linearGradient id="counterweightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#45424b" />
                      <stop offset="40%" stopColor="#2c2a30" />
                      <stop offset="70%" stopColor="#38353d" />
                      <stop offset="100%" stopColor="#1e1c20" />
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
                    {/* Metallic Counterweight (extends behind pivot axis) */}
                    <rect x="-9" y="-22" width="18" height="15" rx="2" fill="url(#counterweightGrad)" stroke="#1a191d" strokeWidth="0.8" />
                    <line x1="-9" y1="-14" x2="9" y2="-14" stroke="#5d5964" strokeWidth="0.75" />

                    {/* Tonearm Gimbal Center Cap (Seamless with pivot holder) */}
                    <circle cx="0" cy="0" r="10" fill="#1e1d22" stroke="#3d3a43" strokeWidth="1" />
                    <circle cx="0" cy="0" r="3.5" fill="#b0aba5" stroke="#78746e" strokeWidth="0.5" />

                    {/* Solid Orange Tonearm Tube - Slightly Bigger (5.5px thickness) */}
                    <rect x="-2.75" y="4" width="5.5" height="194" rx="2.75" fill="url(#tonearmTubeGrad)" />

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
