type PageSkeletonProps = {
  /** Number of large content blocks to show below the stat row. */
  blocks?: number;
  /** Whether to render a row of stat cards under the header. */
  stats?: boolean;
};

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ''}`}
      style={{ background: 'var(--color-surface)' }}
    />
  );
}

/**
 * Generic route-level loading skeleton. Mirrors the common page shape used
 * across the app: a bordered header, an optional stat row, and content blocks.
 */
export function PageSkeleton({ blocks = 2, stats = true }: PageSkeletonProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Shimmer className="h-7 w-48 mb-2" />
        <Shimmer className="h-4 w-32" />
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-24" />
            ))}
          </div>
        )}

        <div className="space-y-4">
          {Array.from({ length: blocks }).map((_, i) => (
            <Shimmer key={i} className="h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}
