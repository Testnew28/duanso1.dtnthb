import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Hero } from '@/components/home/Hero';
import { Counters } from '@/components/home/Counters';
import { PickupInfo } from '@/components/location/PickupInfo';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductDrawer } from '@/components/product/ProductDrawer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { StemIcon, Watermark, StiltHouseMark, MotifDivider } from '@/components/ui/Motif';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isOnShelf } from '@/lib/finance';

const COMMITMENTS = [
  {
    title: 'Nguồn gốc Hòa Bình',
    text: 'Mỗi sản phẩm ghi rõ huyện/xã và cộng đồng dân tộc sản xuất, không trộn hàng ngoại tỉnh.',
    icon: (
      <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    title: 'Giá minh bạch',
    text: 'Giá hội chợ đặt cạnh giá chợ khảo sát thực tế. Mọi phép tính doanh thu – lợi nhuận đều công khai.',
    icon: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 4-4 3 3 5-6" />
      </>
    ),
  },
  {
    title: 'An toàn thực phẩm',
    text: 'Tem khoa học cho từng quy trình: VietGAP, lên men tự nhiên, sấy nắng, không chất bảo quản.',
    icon: (
      <>
        <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
        <path d="m8.5 12 2.3 2.3L16 10" />
      </>
    ),
  },
  {
    title: 'Nhận tại trường',
    text: 'Đặt online, nhận tại sân trường PT DTNT THPT Hòa Bình. Thanh toán COD hoặc chuyển khoản VietQR.',
    icon: (
      <>
        <path d="M3 21h18M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
];

const STEM = [
  {
    type: 'science' as const,
    letter: 'S',
    title: 'Science – Khoa học',
    text: 'Cơ chế lên men lactic, hoạt độ nước a_w, dinh dưỡng từng sản vật.',
    to: '/khoa-hoc',
  },
  {
    type: 'technology' as const,
    letter: 'T',
    title: 'Technology – Công nghệ',
    text: 'Đặt hàng trực tuyến, mã QR VietQR, tra cứu đơn và bản đồ số.',
    to: '/vi-tri',
  },
  {
    type: 'engineering' as const,
    letter: 'E',
    title: 'Engineering – Kỹ thuật',
    text: 'Quy trình 4 bước từ giỏ hàng đến nhận hàng, kiểm soát tồn kho.',
    to: '/cua-hang',
  },
  {
    type: 'math' as const,
    letter: 'M',
    title: 'Math – Toán',
    text: 'Bảng khảo sát giá, dự toán doanh thu – lợi nhuận, biểu đồ so sánh.',
    to: '/khao-sat-gia',
  },
];

export function HomePage() {
  usePageMeta(
    'Hương Sắc Xứ Mường – Gian Hàng Nông Sản Sạch Hòa Bình',
    '34 sản vật nội địa Hòa Bình của đồng bào Mường – Thái – Tày – Dao – Kinh. Đặt online, nhận tại Trường PT DTNT THPT Hòa Bình.',
  );
  const { products, loading } = useStore();
  const [selected, setSelected] = useState<Product | null>(null);

  const featured = useMemo(() => {
    const onShelf = products.filter(isOnShelf);
    const pick = onShelf.filter((p) => p.featured);
    return (pick.length >= 4 ? pick : onShelf).slice(0, 8);
  }, [products]);

  return (
    <>
      <Hero />

      {/* Cam kết */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          kicker="Cam kết của hội chợ"
          title="Nông sản thật, giá thật, người bán thật"
          description="Học sinh trực tiếp khảo sát giá tại chợ Tân Hòa và TP. Hòa Bình, đối chiếu giá thu mua tận gốc tại HTX để đưa ra mức giá hội chợ hợp lý cho phụ huynh và người dân."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMMITMENTS.map((c, idx) => (
            <div
              key={c.title}
              className="rounded-xl2 border border-wood-300/35 bg-rice p-4 shadow-card"
              data-reveal
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {c.icon}
                </svg>
              </span>
              <h3 className="text-base font-bold">{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/65">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 trụ cột STEM */}
      <section className="relative overflow-hidden bg-[#F6EFDF] py-12">
        <Watermark className="-left-24 top-6 h-[340px] w-[340px]" />
        <Watermark className="-right-28 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle
            kicker="Dự án STEM của học sinh"
            title="Bốn trụ cột làm nên gian hàng"
            description="Mỗi phần của website là một bài học được ứng dụng vào vận hành thật: từ sinh – hóa, công nghệ, kỹ thuật đến toán tài chính."
            align="center"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEM.map((s, idx) => (
              <Link
                key={s.letter}
                to={s.to}
                className="group relative overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card transition hover:-translate-y-1 hover:border-honey-400"
                data-reveal
                style={{ transitionDelay: `${idx * 70}ms` }}
              >
                <div className="flex items-start justify-between">
                  <StemIcon type={s.type} className="h-12 w-12" />
                  <span className="font-display text-4xl font-bold text-wood-300/60">{s.letter}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-forest-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{s.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cam-600 group-hover:gap-2 transition-all">
                  Xem chi tiết
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          kicker="Sản vật tiêu biểu"
          title="Chọn nhanh món đặc trưng của xứ Mường"
          description="Cam Cao Phong, bưởi đỏ Tân Lạc, mật ong rừng Đà Bắc, gạo nếp nương Mai Châu… còn nhiều hơn ở gian hàng."
          action={
            <Link to="/cua-hang">
              <Button variant="outline">Xem tất cả {products.length} sản phẩm</Button>
            </Link>
          }
        />
        <ProductGrid products={featured} loading={loading} onOpen={setSelected} skeletonCount={4} />
      </section>

      <Counters />

      {/* Giới thiệu hội chợ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div data-reveal>
            <Badge tone="honey">Hội chợ Dinh dưỡng</Badge>
            <h2 className="mt-3 text-2xl leading-tight sm:text-3xl">
              Một gian hàng do học sinh vận hành, vì cộng đồng Phường Tân Hòa
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-[15px]">
              Hội chợ Dinh dưỡng của Trường PT DTNT THPT Hòa Bình quy tụ sản vật từ 10 huyện, thành phố
              trong tỉnh. Học sinh đảm nhận từ khảo sát giá, kiểm tra an toàn thực phẩm, thiết kế gian hàng
              đến vận hành website và đối soát đơn hàng.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                '34 mặt hàng, 5 nhóm: trái cây, rau củ – lâm sản, gạo – đồ khô, tươi sống – gia vị, trà – mật ong.',
                'Giá chợ khảo sát tại chợ Tân Hòa và chợ Phương Lâm, đối chiếu giá thu mua HTX.',
                'Mỗi đơn hàng có mã riêng, tra cứu bằng số điện thoại – minh bạch và dễ đối soát.',
                'Số liệu tài chính trên website được tính tự động, không nhập tay.',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-ink/72">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cam-500" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/khoa-hoc">
                <Button variant="forest">Tìm hiểu khoa học sau sản phẩm</Button>
              </Link>
              <Link to="/khao-sat-gia">
                <Button variant="outline">Xem bảng dự toán</Button>
              </Link>
            </div>
          </div>

          <div className="relative" data-reveal>
            <div className="overflow-hidden rounded-xl2 border border-wood-300/40 bg-gradient-to-br from-forest-800 to-forest-600 p-6 text-cream shadow-float">
              <StiltHouseMark className="h-20 w-32 text-honey-200/80" />
              <p className="mt-4 font-display text-2xl leading-snug text-white">
                “Mỗi sản phẩm là một câu chuyện về đất, về người và về cách chúng ta tính toán để làm điều
                tử tế.”
              </p>
              <p className="mt-3 text-sm text-cream/65">Ban tổ chức Hội chợ Dinh dưỡng</p>
              <MotifDivider className="my-5 text-cream/25" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-cream/60">Đơn vị</p>
                  <p className="mt-0.5 font-semibold text-white">Trường PT DTNT THPT Hòa Bình</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-cream/60">Địa chỉ</p>
                  <p className="mt-0.5 font-semibold text-white">Phường Tân Hòa, TP. Hòa Bình</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-20 w-20 rounded-xl2 border border-honey-300 bg-honey-100 p-3 text-honey-700 shadow-card sm:block">
              <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M24 6v36M6 24h36" />
                <circle cx="24" cy="24" r="15" strokeDasharray="3 4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Bản đồ */}
      <section className="border-y border-wood-300/40 bg-[#F6EFDF] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle
            kicker="T – Technology · Định vị"
            title="Tìm điểm nhận hàng tại Phường Tân Hòa"
            description="Bản đồ nhúng Google Maps, giờ nhận hàng do ban tổ chức cập nhật và mã QR mở nhanh gian hàng trên điện thoại."
          />
          <PickupInfo />
        </div>
      </section>

      {/* CTA cuối */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600 px-6 py-9 text-center text-cream shadow-float">
          <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="cta-motif" width="56" height="56" patternUnits="userSpaceOnUse">
                  <path d="M28 6 46 28 28 50 10 28Z" stroke="#FBF6EA" strokeWidth="1.2" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-motif)" />
            </svg>
          </div>
          <div className="relative">
            <h2 className="font-display text-2xl text-white sm:text-3xl">Sẵn sàng đặt món cho ngày hội chợ?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-cream/75">
              Chọn sản phẩm, để lại họ tên – số điện thoại – lớp/đơn vị. Ban tổ chức sẽ xác nhận và giữ hàng
              cho bạn tại trường.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <Link to="/cua-hang">
                <Button size="lg">Vào gian hàng</Button>
              </Link>
              <Link to="/tra-cuu">
                <Button size="lg" variant="light">
                  Tra cứu đơn đã đặt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductDrawer product={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </>
  );
}
