import { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { computeFinance } from '@/lib/finance';
import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';
import { formatNumber, formatPercent } from '@/lib/format';
import { MotifDivider } from '@/components/ui/Motif';

export function Counters() {
  const { products, settings } = useStore();
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const summary = useMemo(
    () => computeFinance(products, settings.shippingCost),
    [products, settings.shippingCost],
  );

  const productCount = useCountUp(summary.productCount, 1200, inView);
  const qty = useCountUp(summary.plannedQty, 1200, inView);
  const revenue = useCountUp(summary.revenue, 1200, inView);
  const saving = useCountUp(summary.avgSaving * 100, 1200, inView);

  return (
    <section className="relative overflow-hidden bg-forest-900 py-10 text-cream" ref={ref}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="counter-motif" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M32 8 48 32 32 56 16 32Z" stroke="#FBF6EA" strokeWidth="1.2" fill="none" />
              <circle cx="32" cy="32" r="6" stroke="#FBF6EA" strokeWidth="1.2" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#counter-motif)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-honey-200">
          Số liệu tự tính từ bảng khảo sát giá
        </p>
        <div className="mt-5 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          <Stat value={formatNumber(productCount)} unit="mặt hàng" label="Nội địa Hòa Bình" />
          <Stat value={formatNumber(qty)} unit="sản phẩm" label="Số lượng dự kiến" />
          <Stat value={formatNumber(revenue)} unit="đ" label="Doanh thu dự toán" big />
          <Stat value={formatPercent(saving / 100, 1)} unit="" label="Tiết kiệm trung bình so với chợ" />
        </div>
        <MotifDivider className="my-7 text-cream/30" />
        <p className="text-center text-[11px] leading-relaxed text-cream/55">
          Doanh thu = giá bán × số lượng; vốn = giá nhập × số lượng; lợi nhuận gộp = doanh thu − vốn; lợi nhuận
          ròng = lợi nhuận gộp − chi phí vận chuyển & đóng gói ({formatNumber(settings.shippingCost)} đ).
        </p>
      </div>
    </section>
  );
}

function Stat({
  value,
  unit,
  label,
  big,
}: {
  value: string;
  unit: string;
  label: string;
  big?: boolean;
}) {
  return (
    <div className="text-center">
      <p className={`price-tag font-display font-bold text-honey-200 ${big ? 'text-2xl sm:text-3xl' : 'text-3xl'}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-sans font-semibold text-cream/70">{unit}</span>}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-snug text-cream/65 sm:text-xs">{label}</p>
    </div>
  );
}
