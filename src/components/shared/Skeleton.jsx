/**
 * Bloco de skeleton (placeholder animado) para loading states.
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Skeleton para um card de demanda na lista */
export function DemandaCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-ds-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-4" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Skeleton para um MetricCard no dashboard */
export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-ds-sm border border-gray-200">
      <Skeleton className="h-8 w-8 mb-4 rounded" />
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-9 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/** Skeleton para a lista de demandas (vários cards) */
export function DemandasListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <DemandaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton para o dashboard (métricas + conteúdo) */
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton className="h-10 w-10 rounded mb-3" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
