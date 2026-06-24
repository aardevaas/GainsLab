type CalorieRingProps = {
  /** 0–100 fill percentage. */
  percent: number;
  /** Large value shown in the center (e.g. consumed calories). */
  value: string;
  /** Small label under the value (e.g. "of 3,012"). */
  label?: string;
  /** Pixel diameter of the ring. */
  size?: number;
  /** Stroke color of the progress arc. */
  color?: string;
};

/**
 * Circular progress ring used for daily intake / goal progress.
 * Pure SVG, no client JS — safe in server components.
 */
export function CalorieRing({
  percent,
  value,
  label,
  size = 112,
  color = 'var(--color-accent)',
}: CalorieRingProps) {
  const stroke = 8;
  const r = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset var(--duration-slow) var(--ease-out-expo)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none" style={{ color: 'var(--color-text)' }}>
          {value}
        </span>
        {label && (
          <span className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
