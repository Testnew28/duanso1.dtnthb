import { useMemo } from 'react';
import type { Order, Product } from '@/types';
import { ORDER_STATUS_LABEL } from '@/types';
import { actualRevenue, collectedRevenue, computeFinance, financeLine, orderStatusCounts } from '@/lib/finance';
import { formatNumber, formatPercent, formatVND } from '@/lib/format';
import { exportCsv, printPage } from '@/lib/csv';
import { Button } from '@/components/ui/Button';
import { MotifDivider } from '@/components/ui/Motif';
import { useToast } from '@/context/ToastContext';
import { productCategoryLabel } from '@/lib/repo';
import { useStore } from '@/context/StoreContext';

export function AdminReport({ orders, products }: { orders: Order[]; products: Product[] }) {
  const { settings } = useStore();
  const { push } = useToast();

  const plan = useMemo(() => computeFinance(products, settings.shippingCost), [products, settings.shippingCost]);
  const statuses = useMemo(() => orderStatusCounts(orders), [orders]);
  const real = actualRevenue(orders);
  const collected = collectedRevenue(orders);

  // Doanh thu thực tế theo từng sản phẩm (bỏ đơn hủy)
  const soldByProduct = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) =>
        o.items.forEach((i) => {
          const prev = map.get(i.productId) || { qty: 0, revenue: 0 };
          map.set(i.productId, { qty: prev.qty + i.qty, revenue: prev.revenue + i.price * i.qty });
        }),
      );
    return map;
  }, [orders]);

  const rows = useMemo(
    () =>
      products.map((p) => {
        const line = financeLine(p);
        const sold = soldByProduct.get(p.id) || { qty: 0, revenue: 0 };
        return {
          product: p,
          plannedRevenue: line.revenue,
          plannedQty: p.stock,
          actualQty: sold.qty,
          actualRevenue: sold.revenue,
          fillRate: p.stock > 0 ? sold.qty / p.stock : 0,
        };
      }),
    [products, soldByProduct],
  );

  const topSelling = [...rows].sort((a, b) => b.actualRevenue - a.actualRevenue).slice(0, 5);

  function exportReport() {
    const data: (string | number)[][] = [
      ['BÁO CÁO HỘI CHỢ HƯƠNG SẮC XỨ MƯỜNG'],
      ['Xuất lúc', new Date().toLocaleString('vi-VN')],
      [],
      ['TỔNG KẾT DỰ TOÁN'],
      ['Doanh thu dự toán', plan.revenue],
      ['Vốn nhập hàng', plan.cost],
      ['Lợi nhuận gộp', plan.gross],
      ['Chi phí VC & đóng gói', plan.shippingCost],
      ['Lợi nhuận ròng', plan.net],
      ['Tỷ suất ròng', `${(plan.netMargin * 100).toFixed(2)}%`],
      [],
      ['THỰC TẾ'],
      ['Số đơn (không hủy)', orders.filter((o) => o.status !== 'cancelled').length],
      ['Doanh thu thực tế', real],
      ['Đã thu tiền', collected],
      [],
      ['CHI TIẾT THEO SẢN PHẨM'],
      ['STT', 'Sản phẩm', 'Nhóm', 'Giá bán', 'SL dự kiến', 'DT dự toán', 'SL đã đặt', 'DT thực tế', 'Tỷ lệ lấp đầy'],
      ...rows.map((r, i) => [
        i + 1,
        r.product.name,
        productCategoryLabel(r.product),
        r.product.price,
        r.plannedQty,
        r.plannedRevenue,
        r.actualQty,
        r.actualRevenue,
        `${(r.fillRate * 100).toFixed(1)}%`,
      ]),
      [],
      ['TRẠNG THÁI ĐƠN'],
      ...Object.entries(statuses).map(([k, v]) => [ORDER_STATUS_LABEL[k as keyof typeof ORDER_STATUS_LABEL] || k, v]),
    ];
    exportCsv(`bao-cao-hoi-cho-${new Date().toISOString().slice(0, 10)}.csv`, data);
    push('Đã xuất báo cáo CSV.', 'success');
  }

  return (
    <div className="space-y-5">
      <div className="print-area">
        <div className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg">Báo cáo hội chợ</h2>
              <p className="text-xs text-ink/50">Số liệu tính trực tiếp từ dữ liệu đơn hàng và bảng dự toán</p>
            </div>
            <div className="no-print flex gap-2">
              <Button variant="forest" size="sm" onClick={exportReport}>
                Xuất CSV
              </Button>
              <Button variant="outline" size="sm" onClick={printPage}>
                In PDF
              </Button>
            </div>
          </div>

          <MotifDivider className="my-3" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Doanh thu dự toán" value={formatVND(plan.revenue)} tone="forest" />
            <Metric label="Doanh thu thực tế" value={formatVND(real)} tone="honey" hint={`${orders.filter((o) => o.status !== 'cancelled').length} đơn`} />
            <Metric label="Đã thu tiền" value={formatVND(collected)} tone="wood" />
            <Metric
              label="Hoàn thành dự toán"
              value={formatPercent(plan.revenue > 0 ? real / plan.revenue : 0, 1)}
              tone="thocam"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-cream p-3">
              <p className="text-xs font-bold text-ink/60">Dự toán lợi nhuận</p>
              <ul className="mt-1.5 space-y-1 text-xs text-ink/70">
                <li className="flex justify-between"><span>Doanh thu</span><strong>{formatVND(plan.revenue)}</strong></li>
                <li className="flex justify-between"><span>Vốn nhập</span><strong>−{formatVND(plan.cost)}</strong></li>
                <li className="flex justify-between"><span>Lợi nhuận gộp</span><strong>{formatVND(plan.gross)}</strong></li>
                <li className="flex justify-between"><span>Chi phí VC &amp; gói</span><strong>−{formatVND(plan.shippingCost)}</strong></li>
                <li className="flex justify-between border-t border-wood-300/40 pt-1"><span>Lợi nhuận ròng</span><strong className="text-forest-700">{formatVND(plan.net)}</strong></li>
                <li className="flex justify-between"><span>Tỷ suất</span><strong>{formatPercent(plan.netMargin, 2)}</strong></li>
              </ul>
            </div>
            <div className="rounded-lg bg-cream p-3">
              <p className="text-xs font-bold text-ink/60">Trạng thái đơn</p>
              <ul className="mt-1.5 space-y-1 text-xs text-ink/70">
                {(['new', 'confirmed', 'paid', 'delivered', 'cancelled'] as const).map((s) => (
                  <li key={s} className="flex justify-between">
                    <span>{ORDER_STATUS_LABEL[s]}</span>
                    <strong>{statuses[s] || 0}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl2 border border-wood-300/40 bg-rice p-4">
          <h3 className="text-sm font-bold text-forest-900">Top 5 bán chạy (theo doanh thu thực tế)</h3>
          {topSelling.every((t) => t.actualRevenue === 0) ? (
            <p className="mt-1 text-xs text-ink/50">Chưa có đơn hàng. Số liệu sẽ cập nhật khi khách đặt.</p>
          ) : (
            <ol className="mt-2 space-y-1.5">
              {topSelling.map((t, i) => (
                <li key={t.product.id} className="flex items-center gap-2 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-honey-100 text-[10px] font-bold text-honey-700">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.product.name}</span>
                  <span className="shrink-0 font-semibold text-ink/70">{t.actualQty} SP</span>
                  <span className="w-20 shrink-0 text-right font-bold text-cam-600">{formatNumber(t.actualRevenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <caption className="px-3 pt-3 text-left text-sm font-bold text-forest-900">
                Thực tế so với dự toán theo từng sản phẩm
              </caption>
              <thead className="bg-cream/80">
                <tr>
                  <th className="admin-th">Sản phẩm</th>
                  <th className="admin-th text-right">Giá bán</th>
                  <th className="admin-th text-right">SL dự kiến</th>
                  <th className="admin-th text-right">DT dự toán</th>
                  <th className="admin-th text-right">SL đã đặt</th>
                  <th className="admin-th text-right">DT thực tế</th>
                  <th className="admin-th text-right">Lấp đầy</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.product.id} className="border-t border-wood-300/25">
                    <td className="admin-td">
                      <span className="font-semibold text-ink/85">{r.product.name}</span>
                      <span className="block text-[10px] text-ink/40">{productCategoryLabel(r.product)}</span>
                    </td>
                    <td className="admin-td text-right">{formatNumber(r.product.price)}</td>
                    <td className="admin-td text-right">{r.plannedQty}</td>
                    <td className="admin-td text-right">{formatNumber(r.plannedRevenue)}</td>
                    <td className="admin-td text-right font-semibold">{r.actualQty}</td>
                    <td className="admin-td text-right font-bold text-cam-600">{formatNumber(r.actualRevenue)}</td>
                    <td className="admin-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-wood-100">
                          <div
                            className="h-full rounded-full bg-forest-500"
                            style={{ width: `${Math.min(100, r.fillRate * 100)}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-[10px] text-ink/55">{Math.round(r.fillRate * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-ink/45">
        “Doanh thu thực tế” chỉ tính đơn không bị hủy. “Đã thu tiền” gồm đơn ở trạng thái Đã thu tiền và Đã giao.
        Báo cáo không gõ cứng bất kỳ con số tổng nào.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: 'forest' | 'honey' | 'wood' | 'thocam';
  hint?: string;
}) {
  const bg = {
    forest: 'bg-forest-700 text-white',
    honey: 'bg-honey-500 text-wood-900',
    wood: 'bg-wood-700 text-white',
    thocam: 'bg-thocam-600 text-white',
  }[tone];
  return (
    <div className={`rounded-xl p-3 ${bg}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="price-tag mt-0.5 text-lg font-extrabold">{value}</p>
      {hint && <p className="text-[10px] opacity-70">{hint}</p>}
    </div>
  );
}
