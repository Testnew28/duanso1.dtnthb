import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LeafCheck } from '@/components/ui/Motif';
import { ProductImage } from './ProductImage';
import { EthnicBadge } from './EthnicBadge';
import { availableStock, isOrderable, productCategoryLabel } from '@/lib/repo';
import { formatPercent, formatVND } from '@/lib/format';
import { marketAverage, savingRatio } from '@/lib/finance';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export function ProductDrawer({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  if (!product) return null;

  const available = availableStock(product);
  const orderable = isOrderable(product);
  const marketAvg = marketAverage(product);
  const saving = savingRatio(product);
  const max = Math.max(product.marketMax || 0, product.price, 1);

  function handleAdd(goCheckout = false) {
    if (!product) return;
    addToCart(product, qty, photoRef.current);
    if (goCheckout) {
      navigate('/dat-hang');
    } else {
      push(`Đã thêm ${qty} ${product.unit} vào giỏ.`, 'success');
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Chi tiết sản phẩm"
      widthClass="sm:max-w-xl"
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center rounded-xl border border-wood-300/60 bg-rice">
              <button
                type="button"
                aria-label="Giảm số lượng"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-lg text-ink/70 hover:text-ink"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-bold" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Tăng số lượng"
                onClick={() => setQty((q) => Math.min(available, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-lg text-ink/70 hover:text-ink"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink/50">Tạm tính</p>
              <p className="price-tag text-lg font-extrabold text-cam-600">{formatVND(product.price * qty)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={() => handleAdd(false)} disabled={!orderable}>
              {orderable ? 'Thêm vào giỏ' : 'Hết hàng'}
            </Button>
            <Button variant="forest" onClick={() => handleAdd(true)} disabled={!orderable}>
              Mua ngay
            </Button>
          </div>
          <p className="text-center text-[11px] text-ink/45">Nhận hàng tại trường · Thanh toán COD hoặc VietQR</p>
        </div>
      }
    >
      <div ref={photoRef}>
        <ProductImage
          src={product.imageUrl}
          alt={product.imageAlt || `Ảnh sản phẩm ${product.name}`}
          categoryId={product.categoryId}
          seed={product.id + product.name}
          className="aspect-[4/3] w-full"
          priority
        />
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="honey">{productCategoryLabel(product)}</Badge>
            <EthnicBadge ethnicities={product.ethnicities} limit={3} />
          </div>
          <h2 className="text-xl leading-snug sm:text-2xl">{product.name}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {product.commune ? `${product.commune}, ` : ''}
            {product.district} · Quy cách: <strong className="text-ink/80">{product.unit}</strong>
          </p>
        </div>

        {product.status === 'pending_supply' && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-sm text-teal-900">
            <strong>Đặt trước theo yêu cầu:</strong> sản phẩm đang chờ ban tổ chức xác nhận nguồn cung từ HTX.
            Bạn vẫn có thể đặt trước, ban tổ chức sẽ liên hệ nếu cần điều chỉnh.
          </div>
        )}

        {product.description && <p className="text-sm leading-relaxed text-ink/75">{product.description}</p>}

        {/* So sánh giá */}
        <section className="rounded-xl2 border border-wood-300/40 bg-cream/70 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Giá tại hội chợ</p>
              <p className="price-tag text-2xl font-extrabold text-cam-600">{formatVND(product.price)}</p>
            </div>
            {saving > 0.001 ? (
              <Badge tone="forest" className="text-xs">
                Rẻ hơn chợ {formatPercent(saving, 1)}
              </Badge>
            ) : (
              <Badge tone="honey" className="text-xs">
                Giá tham khảo
              </Badge>
            )}
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div>
              <div className="mb-1 flex justify-between text-ink/60">
                <span>Giá chợ trung bình</span>
                <span className="font-semibold">{formatVND(marketAvg)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-wood-100">
                <div
                  className="bar-grow h-full rounded-full bg-ink/35"
                  style={{ width: `${Math.min(100, (marketAvg / max) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-ink/60">
                <span>Giá hội chợ</span>
                <span className="font-semibold text-forest-700">{formatVND(product.price)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-wood-100">
                <div
                  className="bar-grow h-full rounded-full bg-forest-500"
                  style={{ width: `${Math.min(100, (product.price / max) * 100)}%` }}
                />
              </div>
            </div>
            <p className="pt-1 text-[11px] text-ink/50">
              Khảo sát chợ Tân Hòa & TP. Hòa Bình: {formatVND(product.marketMin)} – {formatVND(product.marketMax)}
            </p>
          </div>
        </section>

        {/* Khoa học */}
        <section className="rounded-xl2 border border-forest-200/70 bg-forest-50/60 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-forest-900">
            <LeafCheck className="h-4 w-4 text-forest-600" /> Khoa học & An toàn thực phẩm (S)
          </h3>
          <p className="text-sm leading-relaxed text-ink/75">{product.nutrition}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{product.safety}</p>
          {product.certs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {product.certs.map((c) => (
                <li key={c} className="inline-flex items-center gap-1 rounded-md border border-shoot-200 bg-white px-2 py-1 text-[11px] font-semibold text-forest-800">
                  <LeafCheck /> {c}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl2 border border-wood-300/40 bg-rice p-4">
          <h3 className="mb-1.5 text-sm font-bold text-wood-700">Bảo quản & sử dụng</h3>
          <p className="text-sm leading-relaxed text-ink/70">{product.storage}</p>
        </section>

        <div className="flex items-center justify-between rounded-xl bg-cream px-3.5 py-2.5 text-sm">
          <span className="text-ink/60">Tồn khả dụng</span>
          <span className={`font-bold ${available === 0 ? 'text-thocam-600' : 'text-forest-700'}`}>
            {available} {product.unit}
          </span>
        </div>
      </div>
    </Drawer>
  );
}
