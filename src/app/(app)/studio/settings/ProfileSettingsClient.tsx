'use client';

import { useRef, useState, useTransition } from 'react';
import { Check, Upload } from 'lucide-react';
import { updateProfile, uploadCreatorAvatar, type ProfileUpdateData } from './actions';

const SPECIALTIES: { value: string; label: string }[] = [
  { value: 'fat_loss',          label: 'Fat Loss' },
  { value: 'muscle_gain',       label: 'Muscle Gain' },
  { value: 'powerlifting',      label: 'Powerlifting' },
  { value: 'bodybuilding',      label: 'Bodybuilding' },
  { value: 'calisthenics',      label: 'Calisthenics' },
  { value: 'nutrition',         label: 'Nutrition' },
  { value: 'mindset',           label: 'Mindset' },
  { value: 'rehabilitation',    label: 'Rehab' },
  { value: 'cardio',            label: 'Cardio' },
  { value: 'yoga',              label: 'Yoga' },
  { value: 'crossfit',          label: 'CrossFit' },
  { value: 'general_fitness',   label: 'General Fitness' },
  { value: 'sports_performance',label: 'Sports' },
];

type Props = {
  profile: {
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    specialty: string[];
    instagram_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    website_url: string | null;
    experience_years: number | null;
    country: string | null;
    city: string | null;
    community_price_bob: number | null;
    slug: string;
    is_accepting_clients: boolean;
  };
};

export function ProfileSettingsClient({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isUploadingAvatar, startUploadTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [specialty, setSpecialty] = useState<string[]>(profile.specialty);
  const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url ?? '');
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktok_url ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? '');
  const [experienceYears, setExperienceYears] = useState<string>(
    profile.experience_years != null ? String(profile.experience_years) : ''
  );
  const [country, setCountry] = useState(profile.country ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [communityPrice, setCommunityPrice] = useState<string>(
    profile.community_price_bob != null ? String(profile.community_price_bob) : ''
  );
  const [isAcceptingClients, setIsAcceptingClients] = useState(profile.is_accepting_clients);

  function toggleSpecialty(value: string) {
    setSpecialty(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    const fd = new FormData();
    fd.append('avatar', file);
    startUploadTransition(async () => {
      const res = await uploadCreatorAvatar(fd);
      if ('error' in res) { setAvatarError(res.error); return; }
      setAvatarUrl(res.url);
    });
    // Reset so the same file can be re-selected if needed
    e.target.value = '';
  }

  function handleSave() {
    setError(null);
    setSaved(false);

    const data: ProfileUpdateData = {
      displayName,
      bio,
      avatarUrl,
      specialty,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      websiteUrl,
      experienceYears: experienceYears ? Number(experienceYears) : null,
      country,
      city,
      communityPrice: communityPrice ? Number(communityPrice) : null,
      isAcceptingClients,
    };

    startTransition(async () => {
      const res = await updateProfile(data);
      if (res.error) { setError(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit',
  };

  const sectionLabel = (text: string) => (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em',
      color: 'var(--color-text-muted)', margin: '0 0 12px', fontFamily: 'var(--font-mono)',
    }}>{text}</p>
  );

  const fieldLabel = (text: string) => (
    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 5px' }}>
      {text}
    </p>
  );

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Public profile link */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Public profile: <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            /creator/{profile.slug}
          </span>
        </span>
        <a
          href={`/creator/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11, fontWeight: 700, color: '#60a5fa',
            textDecoration: 'none', padding: '3px 9px',
            background: 'rgba(96,165,250,0.1)', borderRadius: 6,
          }}
        >
          View →
        </a>
      </div>

      {/* Identity */}
      <section>
        {sectionLabel('Profile')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            {fieldLabel('Display name *')}
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={fieldStyle}
            />
          </div>
          <div>
            {fieldLabel('Bio')}
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell your potential clients who you are…"
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>
          <div>
            {fieldLabel('Profile photo')}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Avatar preview */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                border: '2px solid var(--color-border)',
                background: 'var(--color-surface-elevated)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-muted)' }}>
                    {displayName.slice(0, 1).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {/* Upload button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-elevated)',
                    color: 'var(--color-text-secondary)', cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                    opacity: isUploadingAvatar ? 0.6 : 1,
                  }}
                >
                  <Upload size={13} />
                  {isUploadingAvatar ? 'Uploading…' : 'Upload photo'}
                </button>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                  JPG, PNG or WEBP · max 5 MB
                </p>
                {avatarError && (
                  <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{avatarError}</p>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {fieldLabel('Years of experience')}
              <input
                type="number"
                min={0}
                max={60}
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="e.g. 5"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        {sectionLabel('Location')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            {fieldLabel('Country')}
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g. Bolivia"
              style={fieldStyle}
            />
          </div>
          <div>
            {fieldLabel('City')}
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Cochabamba"
              style={fieldStyle}
            />
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section>
        {sectionLabel(`Specialties (${specialty.length} selected)`)}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SPECIALTIES.map(({ value, label }) => {
            const active = specialty.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleSpecialty(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: active ? 'rgba(96,165,250,0.15)' : 'var(--color-surface-elevated)',
                  color: active ? '#60a5fa' : 'var(--color-text-muted)',
                  transition: 'all 120ms ease',
                }}
              >
                {active && <Check size={10} />}
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Social links */}
      <section>
        {sectionLabel('Social links')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Instagram URL', value: instagramUrl, set: setInstagramUrl },
            { label: 'YouTube URL',   value: youtubeUrl,   set: setYoutubeUrl },
            { label: 'TikTok URL',    value: tiktokUrl,    set: setTiktokUrl },
            { label: 'Website URL',   value: websiteUrl,   set: setWebsiteUrl },
          ].map(({ label, value, set }) => (
            <div key={label}>
              {fieldLabel(label)}
              <input
                type="url"
                value={value}
                onChange={e => set(e.target.value)}
                placeholder="https://…"
                style={fieldStyle}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section>
        {sectionLabel('Community pricing')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            min={0}
            value={communityPrice}
            onChange={e => setCommunityPrice(e.target.value)}
            placeholder="0"
            style={{ ...fieldStyle, width: 140 }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>
            BOB / month
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
          Leave at 0 for a free community.
        </p>
      </section>

      {/* Accepting clients toggle */}
      <section>
        {sectionLabel('Intake')}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          padding: '14px 16px', borderRadius: 12,
          background: isAcceptingClients ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${isAcceptingClients ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          transition: 'all 200ms ease',
        }}>
          {/* pill toggle */}
          <div
            onClick={() => setIsAcceptingClients(p => !p)}
            style={{
              width: 44, height: 24, borderRadius: 12, flexShrink: 0,
              background: isAcceptingClients ? '#4ade80' : '#f87171',
              position: 'relative', cursor: 'pointer', transition: 'background 200ms ease',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: isAcceptingClients ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left 200ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 2px' }}>
              {isAcceptingClients ? 'Accepting new clients' : 'Not accepting clients'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
              {isAcceptingClients
                ? 'The "Request to Join" button is visible on your public page.'
                : 'Join requests are hidden and blocked on your public page.'}
            </p>
          </div>
        </label>
      </section>

      {/* Error / save */}
      {error && (
        <p style={{ fontSize: 13, color: '#f87171', margin: 0, fontWeight: 600 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: isPending ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.15)',
            color: '#60a5fa', fontSize: 13, fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, fontWeight: 600, color: '#4ade80',
          }}>
            <Check size={13} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
