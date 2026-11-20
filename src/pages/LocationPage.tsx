import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PickupInfo } from '@/components/location/PickupInfo';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Badge } from '@/components/ui/Badge';
import { Watermark, StiltHouseMark } from '@/components/ui/Motif';
import { formatNumber } from '@/lib/format';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LocationPage() {
  usePageMeta(
    'Vị trí & nhận hàng (T) | Hương Sắc Xứ Mường',
    'Địa chỉ Trường PT DTNT THPT Hòa Bình, Phường Tân Hòa, TP. Hòa Bình. Bản đồ, giờ nhận hàng và mã QR gian hàng.',
  );
  const { settings } = useStore();

  return (
    <div className="relative">
      <Watermark className="pointer-events-none absolute -right-24 top-72 hidden h-[360px] w-[360px] lg:block" />
      <header className="border-b border-wood-300/30 bg-gradient-to-b from-[#EFF6EC] to-cream">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6">
          <Badge tone="forest">T – Technology</Badge>
          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Định vị &amp; nhận hàng</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
            Gian hàng đặt tại sân trường PT DTNT THPT Hòa Bình. Bạn có thể tới nhận trực tiếp, quét mã QR mở nhanh
            website hoặc gọi ban tổ chức nếu cần hỗ trợ.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PickupInfo />

        <SectionTitle
          className="mt-12"
          kicker="Hướng dẫn nhận hàng"
          title="4 bước nhận hàng tại trường"
          description="Quy trình này do học sinh thiết kế để tránh nhầm lẫn khi hội chợ đông người."
        />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: 'Đặt online', d: 'Chọn sản phẩm, điền họ tên – SĐT – lớp/đơn vị và nhận mã đơn HSXM.' },
            { t: 'Nhận xác nhận', d: 'Ban tổ chức kiểm tra tồn kho, xác nhận đơn (trạng thái “Đã xác nhận”).' },
            { t: 'Tới điểm nhận', d: `Theo giờ mở cửa: ${settings.pickupHours}. Địa chỉ: ${settings.pickupAddress}.` },
            { t: 'Đối chiếu & thanh toán', d: 'Đọc mã đơn + SĐT, thanh toán COD hoặc đưa mã chuyển khoản đã thực hiện.' },
          ].map((s, i) => (
            <li key={s.t} className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card" data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 text-sm font-bold">{s.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-5 rounded-xl2 border border-wood-300/40 bg-[#F6EFDF] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-4">
            <StiltHouseMark className="hidden h-16 w-24 shrink-0 text-wood-500 sm:block" />
            <div>
              <h2 className="text-lg">Thông tin liên hệ ban tổ chức</h2>
              <p className="mt-1 text-sm text-ink/65">
                Điện thoại: <strong>{settings.hotline}</strong> · Địa chỉ: {settings.pickupAddress}
              </p>
              <p className="mt-1 text-xs text-ink/50">
                Chi phí vận chuyển tập kết về trường đang được hạch toán: {formatNumber(settings.shippingCost)} đ (hiển thị
                công khai trong bảng dự toán). Khách không phải trả phí này.
              </p>
            </div>
          </div>
          <Link to="/tra-cuu">
            <Button variant="forest">Tra cứu đơn của tôi</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
