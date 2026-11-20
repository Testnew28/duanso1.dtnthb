import { useRef, useState } from 'react';
import type { Product } from '@/types';
import { ProductImage } from './ProductImage';
import { EthnicBadge } from './EthnicBadge';
import { ScienceBadges } from './ScienceBadges';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { availableStock, isOrderable } from '@/lib/repo';
import { formatPercent, formatVND, shortAddress } from '@/lib/format';
import { marketAverage, savingRatio } from '@/lib/finance';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpen: (p: Product) => void;
  highlight?: boolean;
}

export function ProductCard({ product, onOpen, highlight }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const available = availableStock(product);
  const orderable = isOrderable(product);
  const marketAvg = marketAverage(product);
  const saving = savingRatio(product);
  const isPreOrder = product.status === 'pending_supply';

  function handleAdd() {
    if (!orderable) return;
    addToCart(product, 1, photoRef.current);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1000);
  }

  return (
    <article
      id={`product-${product.id}`}
      className={`product-card group relative flex flex-col overflow-hidden rounded-xl2 border border-wood-300/35 bg-rice shadow-card ${
        highlight ? 'new-product-pulse border-teal-400' : ''
      }`}
    >
      <div ref={photoRef} className="relative">
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="block w-full"
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.imageAlt || `Ảnh sản phẩm ${product.name}`}
            categoryId={product.categoryId}
            seed={product.id + product.name}
            className="aspect-[4/3] w-full"
            imgClassName="product-photo"
          />
        </button>

        {/* Tem dân tộc góc trái */}
        <div className="pointer-events-none absolute left-2 top-2 max-w-[75%]">
          <EthnicBadge ethnicities={product.ethnicities} className="shadow-sm" />
        </div>

        {/* Trạng thái */}
        <div className="pointer-events-none absolute right-2 top-2">
          {isPreOrder ? (
            <Badge tone="teal" className="shadow-sm">
              Đặt trước
            </Badge>
          ) : available === 0 ? (
            <Badge tone="thocam" className="shadow-sm">
              Tạm hết
            </Badge>
          ) : null}
        </div>

        {/* Dải dinh dưỡng trượt từ đáy ảnh */}
        <div className="nutrition-strip pointer-events-none absolute inset-x-0 bottom-0 bg-forest-900/82 px-3 py-2.5 text-[11px] leading-snug text-white backdrop-blur-sm">
          <span className="mr-1 font-bold text-honey-200">S:</span>
          {product.nutrition}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-bold leading-snug text-forest-900">
            <button
              type="button"
              onClick={() => onOpen(product)}
              className="text-left hover:text-cam-600 focus-visible:text-cam-600"
            >
              {product.name}
            </button>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink/55">
            {shortAddress(product.district, product.commune)} · {product.unit}
          </p>
        </div>

        <ScienceBadges certs={product.certs} max={2} />

        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="price-tag text-lg font-extrabold text-cam-600">{formatVND(product.price)}</span>
            {marketAvg > 0 && (
              <span className="text-[11px] text-ink/45 line-through">{formatVND(marketAvg)}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {saving > 0.001 && (
              <span className="font-semibold text-forest-700">Tiết kiệm {formatPercent(saving, 1)}</span>
            )}
            <span className="text-ink/45">
              · {isPreOrder ? `Đặt trước tối đa ${available}` : `Còn ${available}`} {product.unit}
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-1">
          <Button
            variant={added ? 'forest' : 'primary'}
            size="md"
            fullWidth
            onClick={handleAdd}
            disabled={!orderable}
            aria-label={`Thêm ${product.name} vào giỏ`}
            className="text-sm"
          >
            {added ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                Đã thêm
              </>
            ) : isPreOrder ? (
              'Đặt trước'
            ) : available === 0 ? (
              'Hết hàng'
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 7h12l-1.5 12h-9L6 7Z" />
                  <path d="M9 7a3 3 0 0 1 6 0" />
                </svg>
                Thêm vào giỏ
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
