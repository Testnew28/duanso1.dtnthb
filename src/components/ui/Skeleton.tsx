import { cn } from '@/lib/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} aria-hidden="true" />;
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl2 border border-wood-300/30 bg-rice">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
