'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const STORAGE_KEY = 'gainslab:favorite-exercises';

function readFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeFavorites(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable (private mode, quota) — favorite just won't persist
  }
}

type Props = {
  exerciseId: string;
  /** Compact icon-only variant for grid cards vs. labeled button on detail pages. */
  variant?: 'icon' | 'full';
};

/** Client-only favorite toggle, persisted to localStorage (no account sync yet). */
export function FavoriteButton({ exerciseId, variant = 'icon' }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorited(readFavorites().has(exerciseId));
  }, [exerciseId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const favs = readFavorites();
    if (favs.has(exerciseId)) {
      favs.delete(exerciseId);
      setFavorited(false);
    } else {
      favs.add(exerciseId);
      setFavorited(true);
    }
    writeFavorites(favs);
  }

  if (!mounted) return null;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
        style={{
          borderColor: favorited ? 'var(--color-accent)' : 'var(--color-border)',
          color: favorited ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          background: favorited ? 'var(--color-accent-subtle)' : 'transparent',
        }}
      >
        <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
        {favorited ? 'Favorited' : 'Favorite'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className="absolute top-1.5 right-1.5 size-7 flex items-center justify-center rounded-full transition-colors"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <Heart
        size={13}
        fill={favorited ? '#FF8000' : 'none'}
        color={favorited ? '#FF8000' : '#fff'}
      />
    </button>
  );
}
