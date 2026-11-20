import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductGrid({
  products,
  loading,
  onOpen,
  highlightId,
  emptyTitle = 'Chưa có sản phẩm phù hợp',
  emptyDescription = 'Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác (có thể gõ không dấu).',
  skeletonCount = 8,
}: {
  products: Product[];
  loading?: boolean;
  onOpen: (p: Product) => void;
  highlightId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} highlight={highlightId === p.id} />
      ))}
    </div>
  );
}
