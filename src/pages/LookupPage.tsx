import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '@/types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_LABEL } from '@/types';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { lookupOrder } from '@/lib/repo';
import { formatDateTime, formatVND, isValidPhone } from '@/lib/format';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MotifDivider } from '@/components/ui/Motif';

const STATUS_FLOW = ['new', 'confirmed', 'paid'] as const;

export function LookupPage() {
  usePageMeta(
    'Tra cứu đơn hàng | Hương Sắc Xứ Mường',
    'Nhập mã đơn (HSXM-XXXXXX) và số điện thoại đã dùng khi đặt hàng để xem trạng thái đơn.',
  );
  const { settings } = useStore();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);
    if (!code.trim()) {
      setError('Vui lòng nhập mã đơn hàng (dạng HSXM-XXXXXX).');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      const found = await lookupOrder(code, phone);
      setSearched(true);
      if (found) setOrder(found);
      else setError('Không tìm thấy đơn khớp mã đơn và số điện thoại. Vui lòng kiểm tra lại.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tra cứu được.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <SectionTitle
        kicker="T – Technology"
        title="Tra cứu đơn hàng"
        description="Nhập mã đơn nhận được sau khi đặt hàng cùng số điện thoại đã dùng. Hệ thống chỉ trả về đơn khớp cả hai thông tin."
      />

      <form onSubmit={handleSubmit} className="rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="order-code" className="block text-sm font-semibold">
              Mã đơn hàng <span className="text-thocam-600">*</span>
            </label>
            <input
              id="order-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="HSXM-AB12CD"
              className="input-base mt-1 font-mono tracking-wide"
              autoComplete="off"
              aria-invalid={Boolean(error) && !order}
            />
          </div>
          <div>
            <label htmlFor="order-phone" className="block text-sm font-semibold">
              Số điện thoại <span className="text-thocam-600">*</span>
            </label>
            <input
              id="order-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="input-base mt-1"
              autoComplete="tel"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-thocam-500/25 bg-thocam-500/10 px-3 py-2 text-xs font-medium text-thocam-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="submit" variant="primary" loading={loading}>
            Tra cứu đơn
          </Button>
          <Link to="/cua-hang">
            <Button type="button" variant="ghost">
              Về gian hàng
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-ink/45">
          Quên mã đơn? Gọi ban tổ chức <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="font-semibold text-forest-700">{settings.hotline}</a> và
          đọc số điện thoại đã đặt.
        </p>
      </form>

      {order && (
        <div className="mt-5 animate-fade-up rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-display text-2xl font-bold text-forest-900">{order.code}</p>
              <p className="text-xs text-ink/50">Đặt lúc {formatDateTime(order.createdAt)}</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${ORDER_STATUS_TONE[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* Tiến trình trạng thái */}
          {order.status !== 'cancelled' && (
            <ol className="mt-4 flex items-center gap-1.5" aria-label="Tiến trình đơn hàng">
              {STATUS_FLOW.map((s, i) => {
                const orderIdx = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
                const active = order.status === 'delivered' || i <= orderIdx;
                return (
                  <li key={s} className="flex flex-1 items-center gap-1.5">
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                        active ? 'bg-forest-600 text-white' : 'bg-wood-100 text-ink/40'
                      }`}
                    >
                      {active ? '✓' : i + 1}
                    </span>
                    <span className={`text-[11px] font-semibold ${active ? 'text-forest-800' : 'text-ink/40'}`}>
                      {ORDER_STATUS_LABEL[s]}
                    </span>
                    {i < STATUS_FLOW.length - 1 && <span className="h-px flex-1 bg-wood-200" aria-hidden="true" />}
                  </li>
                );
              })}
              <li className="flex items-center gap-1.5">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                    order.status === 'delivered' ? 'bg-forest-600 text-white' : 'bg-wood-100 text-ink/40'
                  }`}
                >
                  {order.status === 'delivered' ? '✓' : '4'}
                </span>
                <span className={`text-[11px] font-semibold ${order.status === 'delivered' ? 'text-forest-800' : 'text-ink/40'}`}>
                  Đã giao
                </span>
              </li>
            </ol>
          )}

          <MotifDivider className="my-4" />

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink/45">Người nhận</dt>
              <dd className="font-semibold">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink/45">Lớp / đơn vị</dt>
              <dd className="font-semibold">{order.classUnit}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink/45">Thanh toán</dt>
              <dd className="font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink/45">Tổng tiền</dt>
              <dd className="font-bold text-cam-600">{formatVND(order.total)}</dd>
            </div>
          </dl>

          <ul className="mt-3 divide-y divide-wood-300/30 border-t border-wood-300/30">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 py-2 text-sm">
                <span>
                  {i.name}
                  <span className="block text-[11px] text-ink/45">
                    {formatVND(i.price)} × {i.qty} {i.unit}
                  </span>
                </span>
                <span className="font-semibold">{formatVND(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          {order.status === 'cancelled' && (
            <div className="mt-3 rounded-lg border border-thocam-500/25 bg-thocam-500/10 p-3 text-xs text-thocam-700">
              Đơn này đã bị hủy. Nếu bạn vẫn muốn mua, vui lòng đặt lại hoặc liên hệ ban tổ chức.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="wood">Nhận tại trường</Badge>
            <Badge tone="neutral">{settings.pickupHours}</Badge>
          </div>
        </div>
      )}

      {searched && !order && !loading && !error && (
        <p className="mt-4 text-center text-sm text-ink/55">Chưa có kết quả.</p>
      )}
    </div>
  );
}
