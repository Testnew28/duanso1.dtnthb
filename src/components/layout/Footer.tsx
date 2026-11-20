import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { MotifDivider } from '@/components/ui/Motif';

export function Footer() {
  const { settings, mode } = useStore();

  return (
    <footer className="mt-16 border-t border-wood-300/40 bg-forest-900 text-cream/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-white">Hương Sắc Xứ Mường</p>
            <p className="mt-1 text-sm font-medium text-honey-200">
              Gian hàng nông sản sạch Hòa Bình · Hội chợ Dinh dưỡng
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/70">
              Dự án STEM của học sinh Trường PT DTNT THPT Hòa Bình. 34 sản vật nội địa của đồng bào
              Mường – Thái – Tày – Dao – Kinh, giá khảo sát minh bạch, nguồn gốc rõ ràng.
            </p>
            <p className="mt-4 text-sm text-cream/70">
              Điểm nhận hàng: <span className="text-white">{settings.pickupAddress}</span>
            </p>
            <p className="mt-1 text-sm text-cream/70">
              Hotline: <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="font-semibold text-honey-200 underline-offset-4 hover:underline">{settings.hotline}</a>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[11px]">Science</span>
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[11px]">Technology</span>
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[11px]">Engineering</span>
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[11px]">Math</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-honey-200">Khám phá</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cua-hang" className="hover:text-white">Cửa hàng 34 sản phẩm</Link></li>
              <li><Link to="/khoa-hoc" className="hover:text-white">Khoa học & ATTP</Link></li>
              <li><Link to="/khao-sat-gia" className="hover:text-white">Khảo sát giá & dự toán</Link></li>
              <li><Link to="/tra-cuu" className="hover:text-white">Tra cứu đơn hàng</Link></li>
              <li><Link to="/vi-tri" className="hover:text-white">Bản đồ & giờ nhận hàng</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-honey-200">Dành cho ban tổ chức</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/admin" className="hover:text-white">Quản trị đơn hàng</Link></li>
              <li><Link to="/admin" className="hover:text-white">Duyệt sản phẩm mới</Link></li>
              <li><Link to="/admin" className="hover:text-white">Cấu hình & báo cáo</Link></li>
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-cream/50">
              Thanh toán: COD tại trường hoặc chuyển khoản VietQR. Không thu thập dữ liệu cá nhân ngoài
              họ tên, SĐT và lớp/đơn vị.
            </p>
          </div>
        </div>

        <MotifDivider className="my-6 text-cream/25" />

        <div className="flex flex-col gap-2 text-[11px] text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trường PT DTNT THPT Hòa Bình – Phường Tân Hòa, TP. Hòa Bình.</p>
          <p>
            Dữ liệu: {mode === 'supabase' ? 'Supabase (PostgreSQL)' : 'chế độ chạy thử cục bộ'} · Giá tham khảo
            khảo sát chợ Tân Hòa & TP. Hòa Bình.
          </p>
        </div>
      </div>
    </footer>
  );
}
