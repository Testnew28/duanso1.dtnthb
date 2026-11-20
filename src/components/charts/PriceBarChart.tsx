import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { marketAverage } from '@/lib/finance';
import { formatNumber } from '@/lib/format';

interface PriceBarChartProps {
  products: Product[];
  limit?: number;
}

/**
 * Biểu đồ cột so sánh giá chợ trung bình (xám) và giá hội chợ (xanh).
 * Vẽ bằng SVG thuần – nhẹ, không thư viện, chạy tốt trên điện thoại.
 * Có bảng dữ liệu thay thế cho trình đọc màn hình.
 */
export function PriceBarChart({ products, limit = 34 }: PriceBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(
    () => products.slice(0, limit).map((p) => ({ p, market: marketAverage(p) })),
    [products, limit],
  );

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => Math.max(d.market, d.p.price)), 1);
  const rowH = 26;
  const height = data.length * rowH + 44;
  const labelW = 148;
  const chartW = 520;

  return (
    <figure className="overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-forest-900">Giá chợ trung bình so với giá hội chợ</h3>
          <p className="text-[11px] text-ink/55">
            Đơn vị: nghìn đồng · Giá chợ trung bình = (giá min + giá max) / 2
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-ink/30" /> Giá chợ
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-forest-500" /> Hội chợ
          </span>
        </div>
      </figcaption>

      <div className="scroll-thin overflow-x-auto">
        <svg
          viewBox={`0 0 ${labelW + chartW + 60} ${height}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label="Biểu đồ so sánh giá chợ và giá hội chợ của các sản phẩm"
        >
          {/* Trục dọc */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={labelW + t * chartW}
              x2={labelW + t * chartW}
              y1={8}
              y2={height - 28}
              stroke="#6B4A2F"
              strokeWidth="0.7"
              opacity="0.15"
            />
          ))}

          {data.map((d, i) => {
            const y = 12 + i * rowH;
            const marketW = (d.market / max) * chartW;
            const priceW = (d.p.price / max) * chartW;
            const active = hover === i;
            return (
              <g
                key={d.p.id}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="button"
                aria-label={`${d.p.name}: giá chợ ${formatNumber(d.market)} đồng, giá hội chợ ${formatNumber(d.p.price)} đồng`}
                className="outline-none"
              >
                <rect x={0} y={y - 3} width={labelW + chartW + 60} height={rowH} fill={active ? '#FBF6EA' : 'transparent'} />
                <text x={4} y={y + 12} fontSize="9.5" fill="#1F2A1C" opacity={active ? 1 : 0.72}>
                  {d.p.name.length > 26 ? `${d.p.name.slice(0, 25)}…` : d.p.name}
                </text>
                <rect x={labelW} y={y + 2} width={Math.max(1, marketW)} height={7} rx={3.5} fill="#1F2A1C" opacity="0.28" />
                <rect x={labelW} y={y + 11} width={Math.max(1, priceW)} height={7} rx={3.5} fill="#2F7550" />
                <text x={labelW + chartW + 6} y={y + 12} fontSize="9" fill="#2F7550" fontWeight="700">
                  {Math.round(d.p.price / 1000)}k
                </text>
                <text x={labelW + chartW + 30} y={y + 12} fontSize="9" fill="#1F2A1C" opacity="0.45">
                  {Math.round(d.market / 1000)}k
                </text>
              </g>
            );
          })}

          <line x1={labelW} x2={labelW + chartW} y1={height - 20} y2={height - 20} stroke="#6B4A2F" opacity="0.25" />
          <text x={labelW} y={height - 8} fontSize="8.5" fill="#1F2A1C" opacity="0.5">
            0
          </text>
          <text x={labelW + chartW - 24} y={height - 8} fontSize="8.5" fill="#1F2A1C" opacity="0.5">
            {Math.round(max / 1000)}k
          </text>
        </svg>
      </div>
    </figure>
  );
}
