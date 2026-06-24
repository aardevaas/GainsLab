import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') ?? 'Athlete';
  const streak = Number(searchParams.get('streak') ?? '0');
  const workouts = Number(searchParams.get('workouts') ?? '0');
  const calories = Number(searchParams.get('calories') ?? '0');
  const gainsScore = Number(searchParams.get('gains_score') ?? '0');

  const now = new Date();
  const weekLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0c0f',
          padding: '64px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div style={{ width: '48px', height: '4px', backgroundColor: '#4ade80', borderRadius: '2px', marginBottom: '48px' }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.25em', color: '#4ade80', textTransform: 'uppercase' }}>
            GainsLab
          </span>
          <span style={{ fontSize: '13px', color: '#334155', marginLeft: '16px' }}>·</span>
          <span style={{ fontSize: '13px', color: '#475569', marginLeft: '16px' }}>{weekLabel}</span>
        </div>

        {/* Name */}
        <div style={{ fontSize: '72px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '12px' }}>
          {name}
        </div>
        <div style={{ fontSize: '22px', color: '#64748b', marginBottom: '72px', letterSpacing: '-0.01em' }}>
          Weekly Progress
        </div>

        {/* Gains Score hero */}
        {gainsScore > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            backgroundColor: '#0d1a12',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid #1a3a22',
            marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Gains Score</div>
              <div style={{ fontSize: '88px', fontWeight: 900, color: '#4ade80', lineHeight: 1, letterSpacing: '-0.05em' }}>{gainsScore}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '16px' }}>
              <div style={{ fontSize: '14px', color: '#475569' }}>Nutrition · Training</div>
              <div style={{ fontSize: '14px', color: '#475569' }}>Consistency · Recovery</div>
              <div style={{ fontSize: '14px', color: '#4ade80', fontWeight: 600, marginTop: '4px' }}>GainsLab composite score</div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
          {/* Streak */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '14px',
            padding: '22px 20px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: '44px', fontWeight: 800, color: '#4ade80', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {streak}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>day streak</div>
            <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px', fontWeight: 600 }}>🔥 ON FIRE</div>
          </div>

          {/* Workouts */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '14px',
            padding: '22px 20px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: '44px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {workouts}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>workouts</div>
            <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px', fontWeight: 600 }}>💪 THIS WEEK</div>
          </div>

          {/* Calories */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '14px',
            padding: '22px 20px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: calories > 999 ? '36px' : '44px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {calories > 0 ? calories.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>avg cal/day</div>
            <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px', fontWeight: 600 }}>🎯 NUTRITION</div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#334155' }}>Track your gains at gainslab.app</span>
          <div style={{ width: '32px', height: '2px', backgroundColor: '#1e2533' }} />
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
