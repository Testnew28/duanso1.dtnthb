import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { Order } from '@/types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_LABEL } from '@/types';
import { fetchUserOrderByCode } from '@/lib/orderLookup';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDateTime, formatNumber, formatVND, normalizePhone } from '@/lib/format';
import { buildVietQRUrl, isBankConfigured } from '@/lib/vietqr';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MotifDivider } from '@/components/ui/Motif';
import { useToast } from '@/context/ToastContext';

export function OrderSuccessPage() {
  const { code = '' } = useParams();
  const location = useLocation();
  const { settings } = useStore();
  const { push } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fresh = Boolean((location.state as { fresh?: boolean } | null)?.fresh);

  usePageMeta(`Đơn hàng ${code} | Hương Sắc Xứ Mường`);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // Đơn vừa tạo được lưu tạm số điện thoại để tra cứu ngay
        const cachedPhone = sessionStorage.getItem(`hsxm:order:${code}`);
        const found = await fetchUserOrderByCode(code, cachedPhone || '');
        if (alive) {
          if (found) setOrder(found);
          else setError('Không tìm thấy đơn hàng này.');
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Không tải được đơn hàng.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  const bankReady = isBankConfigured(settings.bankBin, settings.bankAccountNo);
  const qrUrl =
    order && bankReady && order.paymentMethod === 'transfer'
      ? buildVietQRUrl({
          bankBin: settings.bankBin,
          accountNo: settings.bankAccountNo,
          accountName: settings.bankAccountName,
          amount: order.total,
          addInfo: `${order.code} ${normalizePhone(order.phone)}`,
        })
      : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {fresh && (
        <div className="mb-4 animate-fade-up rounded-xl2 border border-forest-200 bg-forest-50 p-4 text-center">
          <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-forest-600 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <h1 className="text-xl">Đặt hàng thành công</h1>
          <p className="mt-1 text-sm text-ink/65">Ban tổ chức sẽ xác nhận đơn và giữ hàng cho bạn tại trường.</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : error || !order ? (
        <div className="rounded-xl2 border border-thocam-500/30 bg-thocam-500/10 p-6 text-center">
          <p className="font-semibold text-thocam-700">{error || 'Không tìm thấy đơn hàng.'}</p>
          <Link to="/tra-cuu" className="mt-3 inline-block">
            <Button variant="outline">Tra cứu bằng SĐT + mã đơn</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">Mã đơn hàng</p>
                <p className="font-display text-3xl font-bold tracking-wide text-forest-900">{order.code}</p>
                <p className="mt-0.5 text-xs text-ink/50">Đặt lúc {formatDateTime(order.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${ORDER_STATUS_TONE[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            <MotifDivider className="my-4" />

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink/45">Người nhận</dt>
                <dd className="font-semibold">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink/45">Số điện thoại</dt>
                <dd className="font-semibold">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink/45">Lớp / đơn vị</dt>
                <dd className="font-semibold">{order.classUnit}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink/45">Thanh toán</dt>
                <dd className="font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</dd>
              </div>
            </dl>

            <ul className="mt-4 divide-y divide-wood-300/30 border-t border-wood-300/30">
              {order.items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold">{i.name}</span>
                    <span className="block text-[11px] text-ink/45">
                      {formatVND(i.price)} × {i.qty} {i.unit}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold">{formatVND(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-wood-300/40 pt-3">
              <span className="font-bold text-forest-900">Tổng thanh toán</span>
              <span className="text-xl font-extrabold text-cam-600">{formatVND(order.total)}</span>
            </div>
          </div>

          {order.paymentMethod === 'transfer' && (
            <div className="mt-4 rounded-xl2 border border-forest-200 bg-forest-50/70 p-4">
              <h2 className="text-base font-bold text-forest-900">Chuyển khoản VietQR</h2>
              {qrUrl ? (
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={qrUrl}
                    alt={`Mã VietQR thanh toán ${formatVND(order.total)} cho đơn ${order.code}`}
                    className="h-44 w-44 shrink-0 rounded-xl border border-white bg-white p-1.5 shadow-sm"
                    loading="lazy"
                  />
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-ink/55">Ngân hàng:</span> <strong>{settings.bankName}</strong>
                    </p>
                    <p>
                      <span className="text-ink/55">Số tài khoản:</span> <strong>{settings.bankAccountNo}</strong>
                    </p>
                    <p>
                      <span className="text-ink/55">Chủ tài khoản:</span> <strong>{settings.bankAccountName}</strong>
                    </p>
                    <p>
                      <span className="text-ink/55">Số tiền:</span>{' '}
                      <strong className="text-cam-600">{formatVND(order.total)}</strong>
                    </p>
                    <p>
                      <span className="text-ink/55">Nội dung:</span> <strong>{order.code} {normalizePhone(order.phone)}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(`${order.code} ${normalizePhone(order.phone)}`);
                        push('Đã sao chép nội dung chuyển khoản.', 'success');
                      }}
                      className="mt-1 text-xs font-semibold text-forest-700 underline-offset-2 hover:underline"
                    >
                      Sao chép nội dung chuyển khoản
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 rounded-lg bg-honey-100 p-3 text-xs text-honey-700">
                  Ban tổ chức chưa cấu hình số tài khoản nhận tiền. Vui lòng thanh toán COD khi nhận hàng hoặc liên hệ{' '}
                  {settings.hotline}.
                </p>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl2 border border-wood-300/40 bg-rice p-4">
            <h2 className="text-sm font-bold text-forest-900">Nhận hàng</h2>
            <p className="mt-1 text-sm text-ink/70">{settings.pickupAddress}</p>
            <p className="text-xs text-ink/55">{settings.pickupHours}</p>
            <p className="mt-2 text-xs text-ink/50">
              Đọc mã đơn <strong>{order.code}</strong> và số điện thoại khi tới nhận. Tổng: {formatNumber(order.total)} đ.
            </p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Link to="/cua-hang">
              <Button variant="primary" fullWidth>
                Tiếp tục mua
              </Button>
            </Link>
            <Link to="/tra-cuu">
              <Button variant="outline" fullWidth>
                Tra cứu đơn
              </Button>
            </Link>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                if (navigator.share) {
                  void navigator.share({
                    title: `Đơn hàng ${order.code}`,
                    text: `Tôi đã đặt đơn ${order.code} tại Hương Sắc Xứ Mường, tổng ${formatVND(order.total)}.`,
                    url: window.location.href,
                  });
                } else {
                  void navigator.clipboard.writeText(window.location.href);
                  push('Đã sao chép liên kết đơn hàng.', 'success');
                }
              }}
            >
              Chia sẻ
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
