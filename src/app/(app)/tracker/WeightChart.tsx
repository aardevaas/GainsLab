'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type DataPoint = {
  date: string;
  label: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
};

type Props = {
  data: DataPoint[];
  showBodyFat?: boolean;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg border text-xs space-y-1"
      style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
    >
      <p style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name === 'weight_kg' ? 'Weight' : 'Body fat'}: {p.value}{p.name === 'weight_kg' ? ' kg' : '%'}
        </p>
      ))}
    </div>
  );
}

export function WeightChart({ data, showBodyFat = false }: Props) {
  const weightData = data.filter(d => d.weight_kg !== null);

  if (weightData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No weight data yet. Log your first measurement.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={['dataMin - 2', 'dataMax + 2']}
          yAxisId="weight"
        />
        {showBodyFat && (
          <YAxis
            yAxisId="fat"
            orientation="right"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 40]}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Line
          yAxisId="weight"
          type="monotone"
          dataKey="weight_kg"
          stroke="#4ade80"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#4ade80' }}
          connectNulls
        />
        {showBodyFat && (
          <Line
            yAxisId="fat"
            type="monotone"
            dataKey="body_fat_pct"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#a78bfa' }}
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
