import { useMemo, useState } from 'react';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_LABEL } from '@/types';
import { formatDateTime, formatVND, normalizePhone } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { setOrderStatus } from '@/lib/repo';
import { useToast } from '@/context/ToastContext';

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'paid', 'delivered', 'cancelled'];

export function AdminOrders({
  orders,
  onChanged,
  loading,
}: {
  orders: Order[];
  onChanged: () => void;
  loading: boolean;
}) {
  const { push } = useToast();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    STATUSES.forEach((s) => (map[s] = orders.filter((o) => o.status === s).length));
    return map;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        normalizePhone(o.phone).includes(normalizePhone(q)) ||
        o.classUnit.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  async function changeStatus(order: Order, status: OrderStatus) {
    if (order.status === status) return;
    if (status === 'cancelled' && !window.confirm(`Hủy đơn ${order.code}? Số lượng sẽ được trả lại kho.`)) return;
    setBusyId(order.id);
    try {
      await setOrderStatus(order.id, status);
      push(`Đơn ${order.code}: ${ORDER_STATUS_LABEL[status]}.`, 'success');
      onChanged();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không đổi được trạng thái.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tất cả" count={counts.all} />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
              label={ORDER_STATUS_LABEL[s]}
              count={counts[s] || 0}
            />
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã đơn, tên, SĐT…"
          aria-label="Tìm đơn hàng"
          className="input-base ml-auto max-w-xs text-sm"
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/50">Đang tải đơn hàng…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="Chưa có đơn hàng" description="Đơn mới từ khách sẽ xuất hiện ở đây ngay khi được gửi." />
      ) : (
        <div className="space-y-2.5">
          {visible.map((o) => {
            const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
            const open = expanded === o.id;
            return (
              <article key={o.id} className="overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice shadow-sm">
                <div className="flex flex-wrap items-start gap-3 p-3.5">
                  <div className="min-w-[160px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-forest-900">{o.code}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${ORDER_STATUS_TONE[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                      {o.paymentMethod === 'transfer' && <Badge tone="cham">VietQR</Badge>}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{o.customerName}</p>
                    <p className="text-[11px] text-ink/55">
                      {o.phone} · {o.classUnit}
                    </p>
                    <p className="text-[11px] text-ink/40">
                      {formatDateTime(o.createdAt)} · {o.items.length} mặt hàng / {totalQty} SP
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-extrabold text-cam-600">{formatVND(o.total)}</p>
                    <p className="text-[10px] text-ink/45">{PAYMENT_LABEL[o.paymentMethod]}</p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-wood-300/30 pt-2.5 sm:w-auto sm:border-0 sm:pt-0">
                    {STATUSES.filter((s) => s !== 'cancelled').map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busyId === o.id || o.status === s}
                        onClick={() => changeStatus(o, s)}
                        className={`min-h-[36px] rounded-lg border px-2.5 text-[11px] font-semibold transition disabled:opacity-100 ${
                          o.status === s
                            ? 'border-forest-600 bg-forest-600 text-white'
                            : 'border-wood-300/60 bg-white text-ink/65 hover:border-forest-400'
                        }`}
                      >
                        {ORDER_STATUS_LABEL[s]}
                      </button>
                    ))}
                    {o.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={busyId === o.id}
                        onClick={() => changeStatus(o, 'cancelled')}
                        className="min-h-[36px] rounded-lg border border-thocam-500/30 px-2.5 text-[11px] font-semibold text-thocam-700 hover:bg-thocam-500/10"
                      >
                        Hủy
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : o.id)}
                      className="ml-auto rounded-lg px-2 py-1.5 text-[11px] font-semibold text-forest-700 hover:bg-forest-50"
                      aria-expanded={open}
                    >
                      {open ? 'Ẩn chi tiết' : 'Chi tiết'}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-wood-300/40 bg-cream/50 p-3.5">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-ink/45">
                          <th className="pb-1 font-semibold">Sản phẩm</th>
                          <th className="pb-1 text-right font-semibold">Đơn giá</th>
                          <th className="pb-1 text-right font-semibold">SL</th>
                          <th className="pb-1 text-right font-semibold">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.items.map((i) => (
                          <tr key={i.productId} className="border-t border-wood-300/25">
                            <td className="py-1.5">
                              {i.name}
                              <span className="ml-1 text-ink/40">({i.unit})</span>
                            </td>
                            <td className="py-1.5 text-right">{formatVND(i.price)}</td>
                            <td className="py-1.5 text-right">{i.qty}</td>
                            <td className="py-1.5 text-right font-semibold">{formatVND(i.price * i.qty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {o.note && (
                      <p className="mt-2 rounded-lg bg-white px-2.5 py-2 text-[11px] text-ink/65">
                        <strong>Ghi chú:</strong> {o.note}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink/50">
                      <span>Cập nhật: {formatDateTime(o.updatedAt)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(o.code);
                          push('Đã sao chép mã đơn.', 'success');
                        }}
                        className="font-semibold text-forest-700 hover:underline"
                      >
                        Sao chép mã đơn
                      </button>
                      <a href={`tel:${normalizePhone(o.phone)}`} className="font-semibold text-forest-700 hover:underline">
                        Gọi khách
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onChanged}>
          Tải lại danh sách
        </Button>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
        active ? 'border-forest-600 bg-forest-600 text-white' : 'border-wood-300/60 bg-white text-ink/65 hover:border-forest-300'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-cream'}`}>{count}</span>
    </button>
  );
}
