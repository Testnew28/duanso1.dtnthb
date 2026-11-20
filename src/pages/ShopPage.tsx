import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductDrawer } from '@/components/product/ProductDrawer';
import { CreateProductModal } from '@/components/shop/CreateProductModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { inputClass } from '@/components/ui/Form';
import { Watermark, MotifDivider } from '@/components/ui/Motif';
import { normalizeQuery, matchesQuery } from '@/lib/search';
import { formatNumber } from '@/lib/format';
import { isOnShelf } from '@/lib/finance';
import { availableStock } from '@/lib/repo';
import { pulseNewProduct } from '@/lib/flyToCart';
import { DISTRICTS, ETHNICITIES } from '@/data/districts';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'saving-desc';

export function ShopPage() {
  usePageMeta(
    'Cửa hàng – 34+ nông sản sạch Hòa Bình | Hương Sắc Xứ Mường',
    'Lọc theo nhóm, huyện, dân tộc và khoảng giá. Tìm kiếm không dấu: gõ "cam" ra Cam Cao Phong, "mang" ra Măng.',
  );
  const { products, categories, settings, loading, reload, mode } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('nhom') || 'all');
  const [district, setDistrict] = useState('all');
  const [ethnic, setEthnic] = useState('all');
  const [maxPrice, setMaxPrice] = useState(250000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [newlyCreated, setNewlyCreated] = useState<string[]>([]);
  const highlightTimer = useRef<number | null>(null);

  // Đồng bộ từ khóa lên URL để chia sẻ được liên kết tìm kiếm
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set('q', query.trim());
    else next.delete('q');
    if (category !== 'all') next.set('nhom', category);
    else next.delete('nhom');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  const terms = useMemo(() => normalizeQuery(query), [query]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!isOnShelf(p)) return false;
      if (category !== 'all' && p.categoryId !== category) return false;
      if (district !== 'all' && p.district !== district) return false;
      if (ethnic !== 'all' && !p.ethnicities.includes(ethnic)) return false;
      if (p.price > maxPrice) return false;
      if (onlyAvailable && availableStock(p) <= 0) return false;
      if (!matchesQuery(p, terms)) return false;
      return true;
    });
  }, [products, category, district, ethnic, maxPrice, onlyAvailable, terms]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      case 'saving-desc':
        return list.sort((a, b) => {
          const sa = (a.marketMin + a.marketMax) / 2 - a.price;
          const sb = (b.marketMin + b.marketMax) / 2 - b.price;
          return sb - sa;
        });
      default:
        return list.sort((a, b) => {
          const na = newlyCreated.indexOf(a.id);
          const nb = newlyCreated.indexOf(b.id);
          if (na !== -1 || nb !== -1) return (na === -1 ? 999 : na) - (nb === -1 ? 999 : nb);
          return a.createdAt.localeCompare(b.createdAt);
        });
    }
  }, [filtered, sort, newlyCreated]);

  // Khi đang ở chế độ mặc định, gom theo nhóm để thấy rõ 5 khu
  const grouped = useMemo(() => {
    if (sort !== 'default') return null;
    return categories
      .map((c) => ({ category: c, items: sorted.filter((p) => p.categoryId === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [categories, sorted, sort]);

  const activeFilters =
    (category !== 'all' ? 1 : 0) +
    (district !== 'all' ? 1 : 0) +
    (ethnic !== 'all' ? 1 : 0) +
    (maxPrice < 250000 ? 1 : 0) +
    (onlyAvailable ? 1 : 0);

  function resetFilters() {
    setCategory('all');
    setDistrict('all');
    setEthnic('all');
    setMaxPrice(250000);
    setOnlyAvailable(false);
    setQuery('');
  }

  function handleCreated(product: Product, message: string) {
    void reload().then(() => {
      setNewlyCreated((prev) => [product.id, ...prev]);
      setHighlightId(product.id);
      setQuery('');
      setCategory('all');
      setDistrict('all');
      setEthnic('all');
      setMaxPrice(250000);
      setOnlyAvailable(false);
      setSort('default');
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
      highlightTimer.current = window.setTimeout(() => setHighlightId(null), 4000);
      window.setTimeout(() => {
        const el = document.getElementById(`product-${product.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          pulseNewProduct(el);
        }
      }, 220);
    });
    // Nếu chưa có backend, sản phẩm đã nằm trong localStorage; reload() đọc lại
    void message;
  }

  return (
    <div className="relative">
      <Watermark className="pointer-events-none absolute -right-32 top-40 h-[420px] w-[420px] hidden lg:block" />

      <header className="border-b border-wood-300/30 bg-gradient-to-b from-[#FFF9EC] to-cream">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cam-600">
            <span className="h-px w-6 bg-cam-600/60" /> Gian hàng hội chợ
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">Cửa hàng nông sản</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink/65">
                {formatNumber(products.filter(isOnShelf).length)} sản phẩm nội địa Hòa Bình. Gõ không dấu vẫn tìm
                được (“cam”, “mang”, “mat ong”). Chạm vào thẻ để xem chi tiết, dinh dưỡng và % tiết kiệm.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Tạo thêm sản phẩm theo yêu cầu
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Thanh công cụ */}
        <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-wood-300/30 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl2 sm:border sm:px-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm cam, măng, mật ong…"
                aria-label="Tìm kiếm sản phẩm"
                className={`${inputClass} pl-10`}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="relative shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              <span className="hidden sm:inline">Lọc</span>
              {activeFilters > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-cam-600 text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sắp xếp sản phẩm"
              className={`${inputClass} w-auto max-w-[42%] shrink-0 pr-8 text-xs sm:text-sm`}
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="saving-desc">Tiết kiệm nhiều</option>
            </select>
          </div>

          {/* Lọc nhóm nhanh */}
          <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`min-h-[36px] shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
                category === 'all'
                  ? 'border-forest-600 bg-forest-600 text-white'
                  : 'border-wood-300/60 bg-white text-ink/65 hover:border-forest-300'
              }`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`min-h-[36px] shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
                  category === c.id
                    ? 'border-forest-600 bg-forest-600 text-white'
                    : 'border-wood-300/60 bg-white text-ink/65 hover:border-forest-300'
                }`}
              >
                {c.shortName}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="mt-3 grid gap-3 rounded-xl border border-wood-300/40 bg-rice p-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs font-semibold text-ink/70">
                Huyện / thành phố
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className={`${inputClass} mt-1 text-sm`}>
                  <option value="all">Tất cả huyện</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-ink/70">
                Dân tộc sản xuất
                <select value={ethnic} onChange={(e) => setEthnic(e.target.value)} className={`${inputClass} mt-1 text-sm`}>
                  <option value="all">Tất cả dân tộc</option>
                  {ETHNICITIES.map((e) => (
                    <option key={e} value={e}>
                      Người {e}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-ink/70">
                Giá tối đa: <span className="text-cam-600">{formatNumber(maxPrice)} đ</span>
                <input
                  type="range"
                  min={10000}
                  max={250000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 w-full accent-forest-600"
                  aria-label="Khoảng giá tối đa"
                />
              </label>
              <div className="flex items-end justify-between gap-2">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs font-semibold text-ink/70">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="h-4 w-4 accent-forest-600"
                  />
                  Chỉ còn hàng
                </label>
                <button type="button" onClick={resetFilters} className="text-xs font-semibold text-cam-600 underline-offset-2 hover:underline">
                  Xóa lọc
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mb-4 text-xs text-ink/55" aria-live="polite">
          Tìm thấy <strong className="text-ink/80">{sorted.length}</strong> sản phẩm
          {terms.length > 0 && <> cho “{query.trim()}”</>}
          {activeFilters > 0 && <> · {activeFilters} bộ lọc đang bật</>}
        </p>

        {grouped ? (
          grouped.map((group) => (
            <section key={group.category.id} className="mb-9">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl">{group.category.shortName}</h2>
                  <p className="text-xs text-ink/55">{group.category.description}</p>
                </div>
                <Badge tone="wood">{group.items.length} sản phẩm</Badge>
              </div>
              <ProductGrid
                products={group.items}
                loading={loading}
                onOpen={setSelected}
                highlightId={highlightId}
                skeletonCount={4}
              />
            </section>
          ))
        ) : (
          <ProductGrid products={sorted} loading={loading} onOpen={setSelected} highlightId={highlightId} />
        )}

        {!loading && sorted.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-wood-300 bg-rice/60 p-8 text-center">
            <p className="font-display text-xl text-forest-900">Không tìm thấy sản phẩm phù hợp</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink/60">
              Bạn có thể yêu cầu thêm mặt hàng mới – ban tổ chức sẽ liên hệ HTX để tìm nguồn cung cho hội chợ.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                Yêu cầu mặt hàng mới
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}

        <MotifDivider className="my-8" />

        <div className="rounded-xl2 border border-forest-200 bg-forest-50/60 p-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-[220px] flex-1">
              <h2 className="text-lg">Không thấy món bạn cần?</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink/65">
                Gửi yêu cầu mặt hàng mới (chế độ A) hoặc đăng bán với tư cách gian hàng lớp/HTX (chế độ B). Sản phẩm
                hợp lệ sẽ xuất hiện ngay trên kệ và trong biểu mẫu đặt hàng.
              </p>
            </div>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              + Tạo thêm sản phẩm theo yêu cầu
            </Button>
          </div>
        </div>
      </div>

      {/* Nút nổi */}
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-13 items-center gap-2 rounded-full border border-honey-600/40 bg-honey-500 px-4 py-3 text-sm font-bold text-wood-900 shadow-float transition hover:bg-honey-400 lg:bottom-8 lg:right-8"
        aria-label="Tạo thêm sản phẩm theo yêu cầu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="hidden sm:inline">Tạo sản phẩm</span>
      </button>

      <ProductDrawer product={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        products={products}
        settings={settings}
        onCreated={handleCreated}
      />
      <span className="hidden">{mode}</span>
    </div>
  );
}
