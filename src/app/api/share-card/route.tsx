import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') ?? 'Athlete';
  const streak = Number(searchParams.get('streak') ?? '0');
  const workouts = Number(searchParams.get('workouts') ?? '0');
  const calories = Number(searchParams.get('calories') ?? '0');

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

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '72px' }}>
          {/* Streak */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '16px',
            padding: '28px 24px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#4ade80', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {streak}
            </div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '8px' }}>day streak</div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '6px', fontWeight: 600 }}>🔥 ON FIRE</div>
          </div>

          {/* Workouts */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '16px',
            padding: '28px 24px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {workouts}
            </div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '8px' }}>workouts</div>
            <div style={{ fontSize: '12px', color: '#a78bfa', marginTop: '6px', fontWeight: 600 }}>💪 THIS WEEK</div>
          </div>

          {/* Calories */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141820',
            borderRadius: '16px',
            padding: '28px 24px',
            border: '1px solid #1e2533',
          }}>
            <div style={{ fontSize: calories > 999 ? '42px' : '52px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {calories > 0 ? calories.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '8px' }}>avg cal/day</div>
            <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '6px', fontWeight: 600 }}>🎯 NUTRITION</div>
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
