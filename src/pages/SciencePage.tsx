import { useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SCIENCE_CARDS } from '@/data/science';
import { categoryShortName } from '@/data/categories';
import { ScienceCard } from '@/components/science/ScienceCard';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Badge } from '@/components/ui/Badge';
import { Watermark, LeafCheck } from '@/components/ui/Motif';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const FILTERS = [
  { id: 'all', label: 'Tất cả quy trình' },
  { id: 'lactic', label: 'Lên men lactic' },
  { id: 'dry', label: 'Sấy & hoạt độ nước' },
  { id: 'cold', label: 'Sấy lạnh & bảo toàn' },
  { id: 'gap', label: 'Canh tác an toàn' },
  { id: 'storage', label: 'Bảo quản tại nhà' },
];

export function SciencePage() {
  usePageMeta(
    'Khoa học & An toàn thực phẩm (S) | Hương Sắc Xứ Mường',
    'Giải thích cơ chế lên men lactic thịt chua, măng chua; sấy lạnh tinh bột nghệ; hoạt độ nước a_w của măng khô và cách bảo quản nông sản.',
  );
  const [filter, setFilter] = useState('all');

  const cards = SCIENCE_CARDS.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'lactic') return c.icon === 'lactic';
    if (filter === 'dry') return c.icon === 'dry';
    if (filter === 'cold') return c.icon === 'cold';
    if (filter === 'gap') return c.icon === 'gap' || c.icon === 'tea' || c.icon === 'honey' || c.icon === 'omega';
    if (filter === 'storage') return c.icon === 'storage' || c.icon === 'rice' || c.icon === 'noodle';
    return true;
  });

  return (
    <div className="relative">
      <Watermark className="pointer-events-none absolute -left-28 top-64 hidden h-[400px] w-[400px] lg:block" />

      <header className="border-b border-wood-300/30 bg-gradient-to-b from-[#F1F8EC] to-cream">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <Badge tone="forest">S – Science</Badge>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-4xl">
            Khoa học &amp; An toàn thực phẩm
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65 sm:text-[15px]">
            Phía sau mỗi món ăn là một quá trình sinh – hóa cụ thể. Chạm vào thẻ để lật xem cơ chế và nhiệt độ
            bảo quản. Đây là phần học sinh khảo sát, ghi chép và kiểm chứng cùng giáo viên bộ môn.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800">
              <LeafCheck /> VietGAP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800">
              <LeafCheck /> Lên men tự nhiên
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800">
              <LeafCheck /> Không chất bảo quản
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`min-h-[40px] shrink-0 rounded-full border px-3.5 text-xs font-semibold transition ${
                filter === f.id
                  ? 'border-forest-600 bg-forest-600 text-white'
                  : 'border-wood-300/60 bg-white text-ink/65 hover:border-forest-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, idx) => (
            <div key={card.id} data-reveal style={{ transitionDelay: `${(idx % 3) * 70}ms` }}>
              <ScienceCard card={card} />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-xl2 border border-forest-200 bg-forest-50/60 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-lg">Bảng nhiệt độ bảo quản nhanh</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink/65">
              Ghi nhớ nhanh để không làm hỏng sản phẩm: rau lá 4–8°C, cá thịt 0–4°C, mật ong và măng khô để
              nơi thoáng mát, trà xanh tránh ẩm và ánh sáng.
            </p>
          </div>
          <Link to="/khao-sat-gia">
            <Button variant="forest">Xem dự toán giá (M)</Button>
          </Link>
        </div>

        <SectionTitle
          className="mt-12"
          kicker="Cách đọc tem"
          title="Tem khoa học trên mỗi thẻ sản phẩm"
          description="Mỗi tem tương ứng một cam kết đã được ban tổ chức kiểm tra khi tiếp nhận hàng."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              t: 'VietGAP',
              d: 'Có nhật ký canh tác, tuân thủ thời gian cách ly thuốc và truy xuất được nguồn gốc vườn.',
            },
            {
              t: 'Lên men tự nhiên',
              d: 'Chỉ dùng vi khuẩn lactic có lợi và muối/thính, không chất bảo quản hóa học.',
            },
            {
              t: 'Không chất bảo quản',
              d: 'Bảo quản bằng sấy, hút chân không, lạnh hoặc môi trường axit tự nhiên.',
            },
          ].map((x, i) => (
            <div key={x.t} className="rounded-xl2 border border-wood-300/40 bg-rice p-4" data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-shoot-100 text-forest-700">
                  <LeafCheck className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold">{x.t}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{x.d}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-ink/45">
          Nội dung khoa học mang tính giáo dục, được học sinh tổng hợp từ tài liệu và khảo sát thực tế. Không thay
          thế tư vấn y tế. Nhóm {categoryShortName('tuoi-song')} cần bảo quản lạnh nghiêm ngặt khi vận chuyển.
        </p>
      </div>
    </div>
  );
}
