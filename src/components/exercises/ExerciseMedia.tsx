'use client';

import { useState } from 'react';
import { Dumbbell } from 'lucide-react';

type Props = {
  /** Range-of-motion frames — [start, end]. Absolute URLs. */
  images: string[];
  alt: string;
  /** Sizing/positioning classes for the wrapper (e.g. "h-28"). */
  className?: string;
  /** Play the scrub continuously instead of only on hover (detail pages). */
  autoPlay?: boolean;
};

/**
 * Auto-scrubbing exercise media. Crossfades the end (1) frame over the held
 * start (0) frame to mimic the range of motion — the lightweight stand-in for
 * a GIF, built only from the two frames every Free Exercise DB entry ships.
 * Pure CSS animation (compositor-friendly `opacity`, no JS timers even across
 * a 100+ card grid); `prefers-reduced-motion` is honored by the global motion
 * reset, which holds the start frame.
 */
export function ExerciseMedia({ images, alt, className, autoPlay = false }: Props) {
  const frames = images.slice(0, 2);
  const animated = frames.length >= 2;
  const [failed, setFailed] = useState(false);

  if (failed || frames.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className ?? ''}`}
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        <Dumbbell size={20} style={{ color: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  return (
    <div
      className={`rom-media relative overflow-hidden ${autoPlay ? 'rom-autoplay' : ''} ${className ?? ''}`}
      style={{ background: 'var(--color-surface-elevated)' }}
    >
      {/* Start frame — always visible underneath. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frames[0]}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* End frame — crossfades on top to animate the motion. */}
      {animated && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frames[1]}
          alt=""
          aria-hidden
          loading="lazy"
          className="rom-scrub-end absolute inset-0 w-full h-full object-cover"
        />
      )}
      {animated && (
        <span
          className="absolute bottom-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
        >
          ROM
        </span>
      )}
    </div>
  );
}
