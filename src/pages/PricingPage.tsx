import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeFinance, countsInPlan, financeLine, savingRatio, isOnShelf } from '@/lib/finance';
import { formatNumber, formatPercent, formatVND } from '@/lib/format';
import { exportCsv, printPage } from '@/lib/csv';
import { PriceBarChart } from '@/components/charts/PriceBarChart';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Watermark, MotifDivider } from '@/components/ui/Motif';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { useToast } from '@/context/ToastContext';
import { productCategoryLabel } from '@/lib/repo';

export function PricingPage() {
  usePageMeta(
    'Khảo sát giá & Dự toán doanh thu (M) | Hương Sắc Xứ Mường',
    'Bảng khảo sát giá 34+ sản phẩm, biểu đồ so sánh giá chợ Tân Hòa và giá hội chợ, tổng kết tài chính tự động, xuất Excel/CSV và in PDF.',
  );
  const { products, settings, loading } = useStore();
  const { push } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>(0.2);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  const shelfProducts = useMemo(() => products.filter(isOnShelf), [products]);
  const summary = useMemo(() => computeFinance(products, settings.shippingCost), [products, settings.shippingCost]);
  // Chỉ những dòng được tính vào dự toán – khớp đúng với tổng bên dưới
  const lines = useMemo(() => products.filter(countsInPlan).map(financeLine), [products]);

  const visibleLines = useMemo(
    () => (onlyDiscount ? lines.filter((l) => l.saving > 0.001) : lines),
    [lines, onlyDiscount],
  );

  // Đếm số khi cuộn tới phần tổng kết
  const revenueCount = useCountUp(summary.revenue, 1200, inView);
  const costCount = useCountUp(summary.cost, 1200, inView);
  const grossCount = useCountUp(summary.gross, 1200, inView);
  const netCount = useCountUp(summary.net, 1200, inView);
  const savingCount = useCountUp(summary.avgSaving * 100, 1200, inView);
  const qtyCount = useCountUp(summary.plannedQty, 1200, inView);

  const highPrice = lines.filter((l) => l.marketAvg > 0 && l.product.price > l.marketAvg);
  const thinMargin = lines.filter((l) => l.revenue > 0 && l.gross / l.revenue < 0.1);

  function handleExport() {
    const rows: (string | number)[][] = [
      ['STT', 'Tên sản phẩm', 'Nhóm', 'Huyện/TP', 'Dân tộc', 'Quy cách', 'Giá chợ min', 'Giá chợ max', 'Giá chợ TB', 'Giá nhập gốc', 'Giá hội chợ', 'SL dự kiến', 'Doanh thu', 'Vốn', 'Lợi nhuận gộp', '% tiết kiệm'],
      ...lines.map((l, i) => [
        i + 1,
        l.product.name,
        productCategoryLabel(l.product),
        l.product.district,
        l.product.ethnicities.join(', '),
        l.product.unit,
        l.product.marketMin,
        l.product.marketMax,
        Math.round(l.marketAvg),
        l.product.importPrice,
        l.product.price,
        l.product.stock,
        l.revenue,
        l.cost,
        l.gross,
        `${(l.saving * 100).toFixed(2)}%`,
      ]),
      [],
      ['TỔNG CỘNG', '', '', '', '', '', '', '', '', '', '', summary.plannedQty, summary.revenue, summary.cost, summary.gross, `${(summary.avgSaving * 100).toFixed(2)}%`],
      ['Chi phí vận chuyển & đóng gói', settings.shippingCost],
      ['Lợi nhuận ròng', summary.net],
      ['Tỷ suất lợi nhuận ròng', `${(summary.netMargin * 100).toFixed(2)}%`],
    ];
    exportCsv(`du-toan-huong-sac-xu-muong-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    push('Đã xuất file CSV (mở được bằng Excel).', 'success');
  }

  function handlePrint() {
    printPage();
  }

  return (
    <div className="relative">
      <Watermark className="pointer-events-none absolute -right-24 top-[520px] hidden h-[380px] w-[380px] lg:block" />

      <header className="print-area border-b border-wood-300/30 bg-gradient-to-b from-[#FFF8E8] to-cream">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="no-print">
            <Badge tone="honey">M – Math</Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-4xl">
            Khảo sát giá &amp; Dự toán doanh thu
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/65 sm:text-[15px]">
            Số liệu khảo sát trực tiếp tại chợ Tân Hòa và chợ Phương Lâm (TP. Hòa Bình), đối chiếu giá thu mua tận gốc
            tại HTX. Toàn bộ tổng số bên dưới được tính tự động từ bảng — không nhập tay.
          </p>
          <div className="no-print mt-4 flex flex-wrap gap-2">
            <Button variant="forest" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Xuất Excel / CSV
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 9V3h12v6M6 18H4v-6h16v6h-2" />
                <path d="M6 14h12v7H6z" />
              </svg>
              In / Lưu PDF
            </Button>
            <Link to="/cua-hang">
              <Button variant="light" className="border-wood-300">
                Về gian hàng
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hai thanh so sánh tổng */}
        <section className="mb-8 rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg">Mức tiết kiệm trung bình của người mua</h2>
              <p className="text-xs text-ink/55">
                Trung bình cộng tỷ lệ tiết kiệm của {summary.productCount} mặt hàng · Giá chợ TB = (min + max)/2
              </p>
            </div>
            <p className="price-tag text-3xl font-extrabold text-forest-700">{formatPercent(summary.avgSaving, 2)}</p>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink/60">
                <span>Giá chợ trung bình (ước tính theo SL)</span>
                <span className="font-semibold">{formatVND(summary.marketValue)}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-wood-100">
                <div className="bar-grow h-full rounded-full bg-ink/30" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink/60">
                <span>Doanh thu theo giá hội chợ</span>
                <span className="font-semibold text-forest-700">{formatVND(summary.revenue)}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-wood-100">
                <div
                  className="bar-grow h-full rounded-full bg-forest-500"
                  style={{ width: `${summary.marketValue > 0 ? (summary.revenue / summary.marketValue) * 100 : 0}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-ink/55">
              Tổng giá trị tiết kiệm cho người mua:{' '}
              <strong className="text-forest-700">{formatVND(summary.totalSavingValue)}</strong>
            </p>
          </div>
        </section>

        {/* Tổng kết tài chính – đếm số khi cuộn tới */}
        <section ref={inViewRef} className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Doanh thu dự toán" value={formatVND(revenueCount)} tone="forest" hint={`${formatNumber(qtyCount)} sản phẩm`} />
          <SummaryCard label="Vốn nhập hàng" value={formatVND(costCount)} tone="wood" hint="Giá nhập gốc × số lượng" />
          <SummaryCard label="Lợi nhuận gộp" value={formatVND(grossCount)} tone="honey" hint="Doanh thu − vốn" />
          <SummaryCard
            label="Lợi nhuận ròng"
            value={formatVND(netCount)}
            tone="thocam"
            hint={`Sau ${formatVND(settings.shippingCost)} chi phí VC & đóng gói`}
          />
        </section>

        <div ref={summaryRef} className="mb-8 grid gap-4 lg:grid-cols-[1fr_360px]">
          <PriceBarChart products={shelfProducts} />

          <div className="space-y-3">
            <div className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
              <h3 className="text-sm font-bold text-forest-900">Công thức đang dùng</h3>
              <dl className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-ink/65">
                <div className="flex justify-between gap-2">
                  <dt>Doanh thu</dt>
                  <dd className="text-right font-semibold text-ink/80">giá bán × số lượng</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Vốn nhập</dt>
                  <dd className="text-right font-semibold text-ink/80">giá nhập × số lượng</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Lợi nhuận gộp</dt>
                  <dd className="text-right font-semibold text-ink/80">doanh thu − vốn</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Lợi nhuận ròng</dt>
                  <dd className="text-right font-semibold text-ink/80">gộp − chi phí VC &amp; gói</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Tỷ suất ròng</dt>
                  <dd className="text-right font-semibold text-ink/80">ròng / doanh thu</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>% tiết kiệm TB</dt>
                  <dd className="text-right font-semibold text-ink/80">TB((chợ TB − hội chợ)/chợ TB)</dd>
                </div>
              </dl>
              <MotifDivider className="my-3" />
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-forest-50 p-2">
                  <p className="text-ink/55">Tỷ suất ròng</p>
                  <p className="text-base font-extrabold text-forest-700">{formatPercent(summary.netMargin, 2)}</p>
                </div>
                <div className="rounded-lg bg-honey-100 p-2">
                  <p className="text-ink/55">Chi phí VC &amp; gói</p>
                  <p className="text-base font-extrabold text-honey-700">{formatNumber(settings.shippingCost)} đ</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-ink/45">
                Chi phí vận chuyển lấy từ cấu hình ban tổ chức (/admin → Cấu hình) nên có thể chỉnh khi thực tế thay đổi.
              </p>
            </div>

            {highPrice.length > 0 && (
              <div className="rounded-xl2 border border-honey-300 bg-honey-100/70 p-4">
                <p className="text-xs font-bold text-honey-700">Cần rà lại giá ({highPrice.length})</p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-honey-700">
                  {highPrice.slice(0, 4).map((l) => (
                    <li key={l.product.id}>
                      {l.product.name}: {formatVND(l.product.price)} &gt; chợ TB {formatVND(l.marketAvg)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {thinMargin.length > 0 && (
              <div className="rounded-xl2 border border-thocam-500/25 bg-thocam-500/8 p-4">
                <p className="text-xs font-bold text-thocam-700">Biên lợi nhuận mỏng (&lt;10%)</p>
                <p className="mt-1 text-[11px] text-thocam-700">
                  {thinMargin.map((l) => l.product.name).slice(0, 3).join(', ')}
                  {thinMargin.length > 3 ? ` và ${thinMargin.length - 3} mặt hàng khác` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bảng chi tiết */}
        <SectionTitle
          kicker="Bảng dữ liệu gốc"
          title={`Chi tiết ${lines.length} dòng dự toán`}
          description="Bảng tự thêm dòng khi có sản phẩm mới và tự cập nhật tổng. Có thể xuất CSV hoặc in PDF để nộp báo cáo."
          action={
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs font-semibold text-ink/65">
              <input
                type="checkbox"
                checked={onlyDiscount}
                onChange={(e) => setOnlyDiscount(e.target.checked)}
                className="h-4 w-4 accent-forest-600"
              />
              Chỉ dòng rẻ hơn chợ
            </label>
          }
        />

        <div className="overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice shadow-card">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <caption className="sr-only">
                Bảng khảo sát giá và dự toán doanh thu {lines.length} sản phẩm nội địa Hòa Bình
              </caption>
              <thead className="bg-forest-800 text-white">
                <tr>
                  <th className="admin-th !text-white/85">STT</th>
                  <th className="admin-th !text-white/85">Sản phẩm</th>
                  <th className="admin-th !text-white/85">Quy cách</th>
                  <th className="admin-th !text-right !text-white/85">Giá chợ min–max</th>
                  <th className="admin-th !text-right !text-white/85">Chợ TB</th>
                  <th className="admin-th !text-right !text-white/85">Nhập gốc</th>
                  <th className="admin-th !text-right !text-white/85">Hội chợ</th>
                  <th className="admin-th !text-right !text-white/85">SL</th>
                  <th className="admin-th !text-right !text-white/85">Doanh thu</th>
                  <th className="admin-th !text-right !text-white/85">Lợi nhuận gộp</th>
                  <th className="admin-th !text-right !text-white/85">Tiết kiệm</th>
                </tr>
              </thead>
              <tbody>
                {visibleLines.map((l, i) => {
                  const idx = lines.indexOf(l) + 1;
                  const saving = savingRatio(l.product);
                  return (
                    <tr key={l.product.id} className={i % 2 ? 'bg-cream/40' : 'bg-rice'}>
                      <td className="admin-td text-ink/45">{idx}</td>
                      <td className="admin-td">
                        <span className="font-semibold text-ink/85">{l.product.name}</span>
                        <span className="mt-0.5 block text-[11px] text-ink/45">
                          {l.product.district} · {l.product.ethnicities.join(', ')}
                        </span>
                      </td>
                      <td className="admin-td whitespace-nowrap text-ink/65">{l.product.unit}</td>
                      <td className="admin-td whitespace-nowrap text-right text-ink/65">
                        {formatNumber(l.product.marketMin)}–{formatNumber(l.product.marketMax)}
                      </td>
                      <td className="admin-td whitespace-nowrap text-right">{formatNumber(l.marketAvg)}</td>
                      <td className="admin-td whitespace-nowrap text-right text-ink/65">{formatNumber(l.product.importPrice)}</td>
                      <td className="admin-td whitespace-nowrap text-right font-bold text-cam-600">{formatNumber(l.product.price)}</td>
                      <td className="admin-td text-right">{l.product.stock}</td>
                      <td className="admin-td whitespace-nowrap text-right">{formatNumber(l.revenue)}</td>
                      <td className={`admin-td whitespace-nowrap text-right font-semibold ${l.gross < 0 ? 'text-thocam-600' : 'text-forest-700'}`}>
                        {formatNumber(l.gross)}
                      </td>
                      <td className="admin-td whitespace-nowrap text-right">
                        {saving > 0.001 ? (
                          <span className="font-semibold text-forest-700">{formatPercent(saving, 1)}</span>
                        ) : (
                          <span className="text-[11px] text-honey-700">cao hơn chợ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-forest-700 bg-forest-50 font-bold">
                  <td className="admin-td" colSpan={7}>
                    TỔNG CỘNG ({summary.productCount} mặt hàng)
                  </td>
                  <td className="admin-td text-right">{formatNumber(summary.plannedQty)}</td>
                  <td className="admin-td whitespace-nowrap text-right text-forest-800">{formatNumber(summary.revenue)}</td>
                  <td className="admin-td whitespace-nowrap text-right text-forest-800">{formatNumber(summary.gross)}</td>
                  <td className="admin-td text-right text-forest-800">{formatPercent(summary.avgSaving, 2)}</td>
                </tr>
                <tr className="bg-cream/70 text-xs">
                  <td className="admin-td text-ink/60" colSpan={8}>
                    Chi phí vận chuyển tập kết &amp; đóng gói sinh học
                  </td>
                  <td className="admin-td whitespace-nowrap text-right font-semibold" colSpan={2}>
                    −{formatNumber(settings.shippingCost)}
                  </td>
                  <td className="admin-td" />
                </tr>
                <tr className="bg-forest-800 text-white">
                  <td className="admin-td font-bold !text-white" colSpan={8}>
                    LỢI NHUẬN RÒNG DỰ KIẾN · Tỷ suất {formatPercent(summary.netMargin, 2)}
                  </td>
                  <td className="admin-td whitespace-nowrap text-right text-base font-extrabold !text-honey-200" colSpan={2}>
                    {formatVND(summary.net)}
                  </td>
                  <td className="admin-td" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
          Đơn vị: VNĐ. Số liệu cập nhật {loading ? 'đang tải…' : 'theo thời gian thực'} từ dữ liệu sản phẩm hiện có
          trên hệ thống, gồm cả sản phẩm đặt trước theo yêu cầu. Sản phẩm chờ duyệt hoặc đã ẩn không được tính.
        </p>

        <div className="no-print mt-6 flex flex-wrap gap-2">
          <Button variant="forest" onClick={handleExport}>
            Xuất CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            In PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: 'forest' | 'wood' | 'honey' | 'thocam';
  hint: string;
}) {
  const bg = {
    forest: 'from-forest-700 to-forest-600 text-white',
    wood: 'from-wood-700 to-wood-500 text-white',
    honey: 'from-honey-500 to-honey-400 text-wood-900',
    thocam: 'from-thocam-600 to-thocam-500 text-white',
  }[tone];

  return (
    <div className={`rounded-xl2 bg-gradient-to-br ${bg} p-4 shadow-card`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="price-tag mt-1 text-xl font-extrabold sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] leading-snug opacity-70">{hint}</p>
    </div>
  );
}
