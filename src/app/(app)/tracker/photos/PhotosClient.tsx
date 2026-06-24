'use client';

import { useRef, useState, useTransition, useCallback } from 'react';
import { Camera, Upload, Trash2, Globe, Lock, X, GitCompare, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { recordPhoto, deletePhoto, togglePublic } from './actions';
import type { PhotoRecord } from './actions';

type Props = {
  photos: PhotoRecord[];
  userId: string;
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Drag-to-compare slider ────────────────────────────────────────────────────
function CompareSlider({ before, after }: { before: PhotoRecord; after: PhotoRecord }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-xl"
      style={{ aspectRatio: '3/4', cursor: 'ew-resize', maxHeight: 480 }}
      onMouseMove={e => handleMove(e.clientX)}
      onTouchMove={e => handleMove(e.touches[0].clientX)}
    >
      {/* After (full width behind) */}
      <img src={after.signedUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Before (clipped to left of divider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={before.signedUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: `${pos}%`, background: 'white', transform: 'translateX(-50%)' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex gap-0.5">
            <ChevronLeft size={10} className="text-white" />
            <ChevronRight size={10} className="text-white" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-xs font-semibold text-white backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
        {formatDate(before.date)}
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-xs font-semibold text-white backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
        {formatDate(after.date)}
      </div>
    </div>
  );
}

// ─── Upload form ───────────────────────────────────────────────────────────────
function UploadForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File) {
    if (f.size > 10 * 1024 * 1024) { setError('Max file size is 10 MB'); return; }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}.${ext}`;
      const supabase = createClient();
      const { error: uploadErr } = await supabase.storage.from('progress-photos').upload(path, file, { upsert: false });
      if (uploadErr) throw new Error(uploadErr.message);
      const result = await recordPhoto({ storagePath: path, date, notes: notes || null });
      if ('error' in result) throw new Error(result.error);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Add photo</p>

      {/* Drop zone */}
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <Upload size={24} />
          <span className="text-sm">Click to select a photo</span>
          <span className="text-xs">JPEG, PNG, WEBP · max 10 MB</span>
        </button>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 size-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Notes</label>
          <input type="text" placeholder="Optional note..." value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
      </div>

      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? 'Uploading…' : 'Save photo'}
      </button>
    </div>
  );
}

// ─── Photo thumbnail ───────────────────────────────────────────────────────────
function PhotoThumb({
  photo,
  selected,
  onSelect,
  onDelete,
  onTogglePublic,
}: {
  photo: PhotoRecord;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePublic: () => void;
}) {
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      await deletePhoto(photo.id, photo.url);
      setDeleting(false);
    });
  }

  function handleToggle() {
    startTransition(() => togglePublic(photo.id, !photo.is_public));
    onTogglePublic();
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 cursor-pointer group"
      style={{
        borderColor: selected ? 'var(--color-accent)' : 'transparent',
        aspectRatio: '3/4',
      }}
      onClick={onSelect}
    >
      <img src={photo.signedUrl} alt={formatDate(photo.date)} className="w-full h-full object-cover" />

      {/* Date label */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.7))' }}>
        <p className="text-xs font-semibold text-white">{formatDate(photo.date)}</p>
      </div>

      {/* Actions (appear on hover) */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          title={photo.is_public ? 'Make private' : 'Make public'}
          onClick={handleToggle}
          className="size-6 rounded-md flex items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)', color: photo.is_public ? '#4ade80' : 'white' }}
        >
          {photo.is_public ? <Globe size={12} /> : <Lock size={12} />}
        </button>
        <button
          type="button"
          title="Delete"
          onClick={handleDelete}
          disabled={deleting}
          className="size-6 rounded-md flex items-center justify-center backdrop-blur-sm disabled:opacity-40"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#f87171' }}
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>

      {/* Selection ring */}
      {selected && (
        <div className="absolute top-1.5 left-1.5 size-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <GitCompare size={11} style={{ color: '#0a0c0f' }} />
        </div>
      )}
    </div>
  );
}

// ─── Main client ───────────────────────────────────────────────────────────────
export function PhotosClient({ photos: initial, userId }: Props) {
  const [photos, setPhotos] = useState(initial);
  const [showUpload, setShowUpload] = useState(photos.length === 0);
  const [comparing, setComparing] = useState<[string | null, string | null]>([null, null]);

  // Refresh by toggling public (state is updated optimistically through server revalidation)
  // For simplicity we refresh through router.refresh() equivalent — just re-render with revalidated data

  function toggleSelect(id: string) {
    setComparing(([a, b]) => {
      if (a === id) return [null, b];
      if (b === id) return [a, null];
      if (!a) return [id, b];
      if (!b) return [a, id];
      return [id, b]; // replace first slot
    });
  }

  const beforePhoto = photos.find(p => p.id === comparing[0]);
  const afterPhoto = photos.find(p => p.id === comparing[1]);
  const canCompare = !!beforePhoto && !!afterPhoto;

  const compareMode = comparing[0] !== null || comparing[1] !== null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          {photos.length >= 2 && (
            <button
              type="button"
              onClick={() => setComparing(compareMode ? [null, null] : [photos[0].id, photos[photos.length > 1 ? 1 : 0].id])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold"
              style={{
                borderColor: compareMode ? 'var(--color-accent)' : 'var(--color-border)',
                color: compareMode ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                background: compareMode ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              }}
            >
              <GitCompare size={12} />
              {compareMode ? 'Exit compare' : 'Compare'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: showUpload ? 'var(--color-surface-elevated)' : 'var(--color-accent)', color: showUpload ? 'var(--color-text-secondary)' : '#0a0c0f' }}
          >
            <Camera size={12} />
            {showUpload ? 'Hide' : 'Add photo'}
          </button>
        </div>
      </div>

      {showUpload && <UploadForm userId={userId} onDone={() => setShowUpload(false)} />}

      {/* Compare hint */}
      {compareMode && (
        <div
          className="px-4 py-2.5 rounded-xl border text-xs flex items-center gap-2"
          style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)' }}
        >
          <GitCompare size={13} style={{ color: 'var(--color-accent)' }} />
          Select 2 photos to compare · {[comparing[0], comparing[1]].filter(Boolean).length} / 2 selected
        </div>
      )}

      {/* Comparison slider */}
      {canCompare && (
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Drag to compare
          </p>
          <CompareSlider before={beforePhoto!} after={afterPhoto!} />
        </div>
      )}

      {/* Gallery grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              selected={comparing[0] === photo.id || comparing[1] === photo.id}
              onSelect={() => compareMode && toggleSelect(photo.id)}
              onDelete={() => setPhotos(ps => ps.filter(p => p.id !== photo.id))}
              onTogglePublic={() => setPhotos(ps => ps.map(p => p.id === photo.id ? { ...p, is_public: !p.is_public } : p))}
            />
          ))}
        </div>
      ) : !showUpload && (
        <div
          className="rounded-xl border p-12 flex flex-col items-center justify-center text-center gap-3"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <Camera size={32} style={{ color: 'var(--color-text-muted)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No photos yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Document your transformation — one photo at a time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)] transition-colors';
const inputStyle: React.CSSProperties = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
