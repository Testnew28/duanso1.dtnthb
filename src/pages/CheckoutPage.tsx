import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProductImage } from '@/components/product/ProductImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { formatVND, isValidPhone } from '@/lib/format';
import { availableStock, createOrder } from '@/lib/repo';
import { notifyNewOrder } from '@/lib/notify';
import { rememberOrderPhone } from '@/lib/orderLookup';
import type { PaymentMethod } from '@/types';

const STEPS = ['Giỏ hàng', 'Thông tin & đặt hàng'];

export function CheckoutPage() {
  usePageMeta(
    'Giỏ hàng & Đặt hàng | Hương Sắc Xứ Mường',
    'Kiểm tra giỏ hàng, để lại họ tên – số điện thoại – lớp/đơn vị và chọn nhận tại trường (COD) hoặc chuyển khoản VietQR.',
  );
  const navigate = useNavigate();
  const { items, subtotal, count, setQty, removeLine, clear } = useCart();
  const { settings, products } = useStore();
  const { push } = useToast();
  const [step, setStep] = useState<0 | 1>(0);

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    classUnit: '',
    note: '',
    paymentMethod: 'pickup_cod' as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submittingRef = useRef(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setSubmitError('');
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.customerName.trim().length < 2) next.customerName = 'Vui lòng nhập họ tên (ít nhất 2 ký tự).';
    if (!isValidPhone(form.phone)) next.phone = 'Số điện thoại không hợp lệ. Ví dụ: 0912 345 678.';
    if (!form.classUnit.trim()) next.classUnit = 'Vui lòng nhập lớp hoặc đơn vị.';
    if (form.note.length > 500) next.note = 'Ghi chú tối đa 500 ký tự.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (items.length === 0) {
      push('Giỏ hàng đang trống.', 'error');
      return;
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Gửi đơn ngay tại bước 2 – không còn trang xác nhận trung gian. */
  async function handleSubmit() {
    if (submittingRef.current) return;
    if (items.length === 0) {
      push('Giỏ hàng đang trống.', 'error');
      return;
    }
    if (!validate()) {
      push('Vui lòng kiểm tra lại thông tin trước khi đặt hàng.', 'error');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const order = await createOrder({
        customerName: form.customerName,
        phone: form.phone,
        classUnit: form.classUnit,
        note: form.note,
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
      });
      rememberOrderPhone(order.code, form.phone);
      void notifyNewOrder(order);
      setSubmitted(true);
      clear();
      navigate(`/don-hang/${order.code}`, { replace: true, state: { fresh: true } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không gửi được đơn hàng.';
      setSubmitError(message);
      push(message, 'error');
      submittingRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  // Sau khi đặt thành công, giỏ đã được xóa nhưng trang đang chuyển hướng:
  // hiển thị màn hình chờ thay vì nháy “Giỏ hàng trống”.
  if (submitted && items.length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4">
        <div className="text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 animate-pulse place-items-center rounded-full bg-forest-600 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-forest-900">Đã gửi đơn hàng…</p>
          <p className="mt-1 text-xs text-ink/55">Đang mở trang xác nhận đơn của bạn.</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <SectionTitle kicker="E – Engineering" title="Giỏ hàng" align="center" />
        <EmptyState
          title="Giỏ hàng đang trống"
          description="Hãy chọn vài sản vật của xứ Mường rồi quay lại đây. Bạn có thể thêm nhanh bằng nút “Thêm vào giỏ” trên thẻ sản phẩm."
          action={
            <Link to="/cua-hang">
              <Button variant="primary" size="lg">
                Vào gian hàng
              </Button>
            </Link>
          }
        />
        {products.filter((p) => p.featured).length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-center text-sm text-ink/55">Gợi ý cho bạn</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {products
                .filter((p) => p.featured)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.id}
                    to="/cua-hang"
                    className="flex items-center gap-2.5 rounded-xl border border-wood-300/40 bg-rice p-2.5 transition hover:border-honey-400"
                  >
                    <ProductImage
                      src={p.imageUrl}
                      alt={p.imageAlt}
                      categoryId={p.categoryId}
                      seed={p.id}
                      className="h-14 w-14 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-xs font-semibold">{p.name}</span>
                      <span className="text-xs font-bold text-cam-600">{formatVND(p.price)}</span>
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SectionTitle
        kicker="E – Engineering · Quy trình đặt hàng"
        title="Giỏ hàng & Đặt hàng"
        description="Chỉ 2 bước: kiểm tra giỏ – điền thông tin và đặt hàng. Không cần tạo tài khoản."
      />

      {/* Tiến trình */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Các bước đặt hàng">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                i <= step
                  ? 'border-forest-600 bg-forest-600 text-white'
                  : 'border-wood-300 bg-white text-ink/45'
              }`}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span className={`text-xs font-semibold ${i <= step ? 'text-forest-800' : 'text-ink/45'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="hidden h-px flex-1 bg-wood-300/60 sm:block" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Cột trái */}
        <div className="space-y-4">
          {step === 0 && (
            <div className="space-y-2.5">
              {items.map((item) => {
                const max = availableStock(item.product);
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 rounded-xl2 border border-wood-300/40 bg-rice p-3 shadow-sm"
                  >
                    <ProductImage
                      src={item.product.imageUrl}
                      alt={item.product.imageAlt}
                      categoryId={item.product.categoryId}
                      seed={item.product.id}
                      className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-bold leading-snug">{item.product.name}</p>
                          <p className="mt-0.5 text-[11px] text-ink/50">{item.product.unit} · {item.product.district}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(item.product.id)}
                          className="shrink-0 rounded-lg p-2 text-ink/40 transition hover:bg-thocam-500/10 hover:text-thocam-600"
                          aria-label={`Xóa ${item.product.name} khỏi giỏ`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-wood-300/60">
                          <button
                            type="button"
                            onClick={() => setQty(item.product.id, item.qty - 1)}
                            className="flex h-10 w-10 items-center justify-center text-lg text-ink/60 hover:text-ink"
                            aria-label="Giảm số lượng"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(item.product.id, item.qty + 1)}
                            disabled={item.qty >= max}
                            className="flex h-10 w-10 items-center justify-center text-lg text-ink/60 hover:text-ink disabled:opacity-35"
                            aria-label="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-cam-600">{formatVND(item.lineTotal)}</p>
                          <p className="text-[10px] text-ink/45">còn {max} {item.product.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs">
                <Link to="/cua-hang" className="font-semibold text-forest-700 underline-offset-2 hover:underline">
                  ← Tiếp tục chọn hàng
                </Link>
                <button type="button" onClick={clear} className="text-ink/45 underline-offset-2 hover:text-thocam-600 hover:underline">
                  Xóa toàn bộ giỏ
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <form
              id="checkout-form"
              className="space-y-4 rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card sm:p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              noValidate
            >
              <h2 className="text-lg">Thông tin người nhận</h2>
              <p className="-mt-2 text-xs text-ink/50">
                Chỉ thu thập họ tên, số điện thoại và lớp/đơn vị để liên hệ giao hàng.
              </p>

              <div>
                <label htmlFor="customerName" className="block text-sm font-semibold">
                  Họ và tên <span className="text-thocam-600">*</span>
                </label>
                <input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) => update('customerName', e.target.value)}
                  autoComplete="name"
                  className="input-base mt-1"
                  placeholder="Nguyễn Thị Lan"
                  aria-invalid={Boolean(errors.customerName)}
                />
                {errors.customerName && <p className="mt-1 text-xs font-medium text-thocam-700">{errors.customerName}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold">
                    Số điện thoại <span className="text-thocam-600">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    autoComplete="tel"
                    className="input-base mt-1"
                    placeholder="0912 345 678"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby="phone-hint"
                  />
                  <p id="phone-hint" className="mt-1 text-[11px] text-ink/45">
                    Dùng để tra cứu đơn. Ví dụ: 0912345678.
                  </p>
                  {errors.phone && <p className="mt-1 text-xs font-medium text-thocam-700">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="classUnit" className="block text-sm font-semibold">
                    Lớp / đơn vị <span className="text-thocam-600">*</span>
                  </label>
                  <input
                    id="classUnit"
                    value={form.classUnit}
                    onChange={(e) => update('classUnit', e.target.value)}
                    className="input-base mt-1"
                    placeholder="Ví dụ: 11A1, Phụ huynh lớp 10B"
                    aria-invalid={Boolean(errors.classUnit)}
                  />
                  {errors.classUnit && <p className="mt-1 text-xs font-medium text-thocam-700">{errors.classUnit}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-semibold">
                  Ghi chú
                </label>
                <textarea
                  id="note"
                  rows={2}
                  value={form.note}
                  onChange={(e) => update('note', e.target.value)}
                  className="input-base mt-1"
                  placeholder="Ví dụ: Nhận chiều 15h, gọi trước khi giao…"
                  maxLength={500}
                />
                <p className="mt-1 text-right text-[11px] text-ink/40">{form.note.length}/500</p>
                {errors.note && <p className="text-xs font-medium text-thocam-700">{errors.note}</p>}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Hình thức nhận hàng</legend>
                <div className="rounded-xl border border-forest-400 bg-forest-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest-900">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                    </svg>
                    Nhận tại Trường PT DTNT THPT Hòa Bình
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/65">{settings.pickupAddress}</p>
                  <p className="mt-0.5 text-xs text-ink/55">Giờ nhận: {settings.pickupHours}</p>
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Thanh toán</legend>
                <div className="space-y-2">
                  <label
                    className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      form.paymentMethod === 'pickup_cod' ? 'border-forest-500 bg-forest-50' : 'border-wood-300/60 bg-rice'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="pickup_cod"
                      checked={form.paymentMethod === 'pickup_cod'}
                      onChange={() => update('paymentMethod', 'pickup_cod')}
                      className="mt-1 h-4 w-4 accent-forest-600"
                    />
                    <span>
                      <span className="block text-sm font-bold">Thanh toán khi nhận hàng (COD)</span>
                      <span className="mt-0.5 block text-xs text-ink/55">Trả tiền mặt tại điểm nhận ở trường.</span>
                    </span>
                  </label>
                  <label
                    className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      form.paymentMethod === 'transfer' ? 'border-forest-500 bg-forest-50' : 'border-wood-300/60 bg-rice'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={form.paymentMethod === 'transfer'}
                      onChange={() => update('paymentMethod', 'transfer')}
                      className="mt-1 h-4 w-4 accent-forest-600"
                    />
                    <span>
                      <span className="block text-sm font-bold">Chuyển khoản VietQR trước</span>
                      <span className="mt-0.5 block text-xs text-ink/55">
                        Mã QR tự sinh theo số tiền và mã đơn ngay sau khi đặt.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-thocam-500/30 bg-thocam-500/10 p-3 text-sm text-thocam-700"
                >
                  {submitError}
                </div>
              )}

              <div className="sm:hidden">
                <Button variant="primary" size="lg" fullWidth type="submit" loading={submitting}>
                  Đặt hàng
                </Button>
                <Button variant="ghost" size="md" fullWidth className="mt-2" onClick={() => setStep(0)}>
                  ← Quay lại giỏ hàng
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Cột phải: tổng kết */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
            <h2 className="text-base font-bold text-forest-900">Tóm tắt đơn hàng</h2>
            <p className="text-xs text-ink/50">{count} sản phẩm</p>
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {items.map((i) => (
                <li key={i.product.id} className="flex justify-between gap-2 text-xs">
                  <span className="min-w-0">
                    <span className="line-clamp-1 font-semibold">{i.product.name}</span>
                    <span className="text-ink/45">× {i.qty} {i.product.unit}</span>
                  </span>
                  <span className="shrink-0 font-bold text-ink/80">{formatVND(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-wood-300/40 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Tạm tính</dt>
                <dd className="font-bold">{formatVND(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-ink/55">Phí vận chuyển về trường</dt>
                <dd className="font-semibold text-forest-700">Miễn phí cho khách</dd>
              </div>
              <div className="flex justify-between border-t border-wood-300/40 pt-2">
                <dt className="font-bold text-forest-900">Tổng thanh toán</dt>
                <dd className="text-lg font-extrabold text-cam-600">{formatVND(subtotal)}</dd>
              </div>
            </dl>

            {step === 0 ? (
              <div className="mt-4 space-y-2">
                <Button variant="primary" size="lg" fullWidth onClick={goNext}>
                  Tiếp tục nhập thông tin
                </Button>
                <Badge tone="forest" className="w-full justify-center py-2">
                  Giỏ hàng lưu trên thiết bị này
                </Badge>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  form="checkout-form"
                  loading={submitting}
                >
                  Đặt hàng &amp; nhận mã đơn
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => setStep(0)} disabled={submitting}>
                  ← Quay lại giỏ hàng
                </Button>
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
              Bằng việc đặt hàng, bạn đồng ý để ban tổ chức liên hệ qua số điện thoại đã cung cấp và nhận hàng tại
              trường. Không có phí ẩn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
