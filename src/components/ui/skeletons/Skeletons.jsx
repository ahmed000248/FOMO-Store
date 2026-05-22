// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-bg-surface border border-white/4">
      <div className="aspect-[3/4] shimmer-skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 shimmer-skeleton rounded-full w-1/3" />
        <div className="h-4 shimmer-skeleton rounded-full w-3/4" />
        <div className="h-3 shimmer-skeleton rounded-full w-1/2" />
        <div className="h-5 shimmer-skeleton rounded-full w-1/4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-28 pb-20 max-w-7xl mx-auto px-4">
      <div className="space-y-4">
        <div className="aspect-[4/5] shimmer-skeleton rounded-3xl" />
        <div className="flex gap-3">
          {[1,2,3].map(i => <div key={i} className="w-20 aspect-square shimmer-skeleton rounded-xl" />)}
        </div>
      </div>
      <div className="space-y-5 pt-4">
        <div className="h-4 shimmer-skeleton rounded-full w-1/4" />
        <div className="h-10 shimmer-skeleton rounded-full w-3/4" />
        <div className="h-6 shimmer-skeleton rounded-full w-1/3" />
        <div className="h-20 shimmer-skeleton rounded-2xl" />
        <div className="h-12 shimmer-skeleton rounded-2xl" />
        <div className="h-16 shimmer-skeleton rounded-2xl" />
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 shimmer-skeleton rounded-full w-1/3" />
        <div className="h-5 shimmer-skeleton rounded-full w-1/4" />
      </div>
      <div className="h-4 shimmer-skeleton rounded-full w-1/2" />
      <div className="h-4 shimmer-skeleton rounded-full w-3/4" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="h-4 shimmer-skeleton rounded-full w-1/2 mb-3" />
      <div className="h-9 shimmer-skeleton rounded-full w-2/3 mb-2" />
      <div className="h-3 shimmer-skeleton rounded-full w-1/3" />
    </div>
  );
}
