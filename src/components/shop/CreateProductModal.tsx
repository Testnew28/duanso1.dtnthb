import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Product, ProductDraft, Settings } from '@/types';
import type { Category } from '@/data/categories';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField, TextAreaField, SelectField, CheckboxField, Field, inputClass } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { ProductImage } from '@/components/product/ProductImage';
import { DISTRICTS, COMMUNES, ETHNICITIES } from '@/data/districts';
import { persistImage, submitProduct, validateDraft } from '@/lib/repo';
import { compressImage, estimateDataUrlBytes } from '@/lib/image';
import { formatPercent, formatVND, slugify } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const CERT_OPTIONS = [
  'VietGAP',
  'Lên men tự nhiên',
  'Không chất bảo quản',
  'Hút chân không',
  'Sấy lạnh',
  'Sấy nắng tự nhiên',
  'Hữu cơ tự nhiên',
  'Chăn thả tự do',
];

function emptyDraft(mode: 'customer' | 'vendor'): ProductDraft {
  return {
    mode,
    name: '',
    categoryId: 'trai-cay',
    newCategoryName: '',
    district: '',
    commune: '',
    ethnicities: ['Mường'],
    imageUrl: '',
    imageAlt: '',
    description: '',
    nutrition: '',
    safety: '',
    storage: '',
    unit: '',
    marketMin: 0,
    marketMax: 0,
    importPrice: 0,
    price: 0,
    stock: 1,
    certs: ['Không chất bảo quản'],
    requesterName: '',
    requesterPhone: '',
    requesterNote: '',
    inviteCode: '',
    commitment: false,
  };
}

export function CreateProductModal({
  open,
  onClose,
  categories,
  products,
  settings,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  settings: Settings;
  onCreated: (product: Product, message: string, visible: boolean) => void;
}) {
  const { user } = useAuth();
  const { push } = useToast();
  const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft('customer'));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const finalDraft = useMemo<ProductDraft>(() => {
    const isNewCat = draft.categoryId === '__new__';
    return {
      ...draft,
      categoryId: isNewCat ? slugify(draft.newCategoryName || '') : draft.categoryId,
    };
  }, [draft]);

  const liveCheck = useMemo(
    () => validateDraft(finalDraft, products, settings, Boolean(user)),
    [finalDraft, products, settings, user],
  );

  const margin = draft.price > 0 ? (draft.price - draft.importPrice) / draft.price : 0;
  const profitPerUnit = draft.price - draft.importPrice;

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setMode(mode: 'customer' | 'vendor') {
    setDraft((prev) => ({ ...prev, mode }));
    setErrors([]);
  }

  function toggleEthnicity(name: string) {
    setDraft((prev) => ({
      ...prev,
      ethnicities: prev.ethnicities.includes(name)
        ? prev.ethnicities.filter((e) => e !== name)
        : [...prev.ethnicities, name],
    }));
  }

  function toggleCert(name: string) {
    setDraft((prev) => ({
      ...prev,
      certs: prev.certs.includes(name) ? prev.certs.filter((c) => c !== name) : [...prev.certs, name],
    }));
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      if (estimateDataUrlBytes(dataUrl) > 2 * 1024 * 1024) {
        throw new Error('Ảnh sau khi nén vẫn quá lớn. Vui lòng chọn ảnh khác.');
      }
      update('imageUrl', dataUrl);
      setUrlInput('');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không xử lý được ảnh.', 'error');
    } finally {
      setCompressing(false);
    }
  }

  function applyUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      push('Link ảnh phải bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }
    update('imageUrl', url);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (honeypot) {
      // Bẫy bot: trường ẩn bị điền → dừng im lặng
      onClose();
      return;
    }
    const check = validateDraft(finalDraft, products, settings, Boolean(user));
    if (check.errors.length > 0) {
      setErrors(check.errors);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      const storedImage = draft.imageUrl ? await persistImage(draft.imageUrl) : '';
      const result = await submitProduct(finalDraft, storedImage, Boolean(user), settings);
      const visible = result.status === 'active' || result.status === 'pending_supply';
      onCreated(result.product, result.message, visible);
      push(result.message, 'success');
      setDraft(emptyDraft(draft.mode));
      setUrlInput('');
      onClose();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Không lưu được sản phẩm.']);
    } finally {
      setSubmitting(false);
    }
  }

  const isAdmin = Boolean(user);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo thêm sản phẩm theo yêu cầu"
      subtitle="Dành cho khách đặt trước mặt hàng mới hoặc gian hàng lớp/HTX tự đăng bán"
      size="xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-ink/50">
            Sản phẩm phải có xuất xứ tại Hòa Bình. Ban tổ chức có thể chỉnh sửa hoặc ẩn sau khi đăng.
          </p>
          <Button type="submit" form="create-product-form" loading={submitting} size="lg" className="shrink-0">
            Lưu &amp; đưa sản phẩm lên gian hàng
          </Button>
        </div>
      }
    >
      <form id="create-product-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Chọn chế độ */}
        <div className="grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Chế độ tạo sản phẩm">
          <button
            type="button"
            role="tab"
            aria-selected={draft.mode === 'customer'}
            onClick={() => setMode('customer')}
            className={`rounded-xl border p-3.5 text-left transition ${
              draft.mode === 'customer'
                ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/15'
                : 'border-wood-300/50 bg-rice hover:border-forest-300'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-forest-900">
              A · Khách yêu cầu mặt hàng mới
              {draft.mode === 'customer' && <Badge tone="forest">Đang chọn</Badge>}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink/60">
              Ghi nhận vào mục “Sản phẩm đặt trước theo yêu cầu”, chờ xác nhận nguồn cung HTX.
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={draft.mode === 'vendor'}
            onClick={() => setMode('vendor')}
            className={`rounded-xl border p-3.5 text-left transition ${
              draft.mode === 'vendor'
                ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/15'
                : 'border-wood-300/50 bg-rice hover:border-forest-300'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-forest-900">
              B · Lớp / Nông hộ / HTX tự đăng bán
              {draft.mode === 'vendor' && <Badge tone="forest">Đang chọn</Badge>}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink/60">
              Cần mã mời do ban tổ chức cấp (hoặc tài khoản quản trị). Có thể duyệt nhanh tùy cấu hình.
            </span>
          </button>
        </div>

        {errors.length > 0 && (
          <div role="alert" className="rounded-xl border border-thocam-500/30 bg-thocam-500/10 p-3.5">
            <p className="text-sm font-bold text-thocam-700">Vui lòng kiểm tra lại:</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-thocam-700">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nhóm 1: Nhận diện & văn hóa */}
        <section className="space-y-4 rounded-xl2 border border-wood-300/40 bg-cream/50 p-4">
          <header className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-wood-700 text-xs font-bold text-white">1</span>
            <h3 className="text-sm font-bold text-forest-900">Nhận diện &amp; văn hóa bản địa</h3>
          </header>

          <TextField
            label="Tên sản phẩm mới"
            name="p-name"
            required
            placeholder="Ví dụ: Bánh ít lá gai xứ Mường"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            hint="Tên sẽ xuất hiện ngay trên gian hàng và trong biểu mẫu đặt hàng."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Nhóm danh mục"
              name="p-category"
              required
              value={draft.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              hint="Có thể tạo nhóm mới, ví dụ “Đặc sản chế biến sẵn”."
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ Tạo nhóm mới…</option>
            </SelectField>
            {draft.categoryId === '__new__' ? (
              <TextField
                label="Tên nhóm mới"
                name="p-new-category"
                required
                placeholder="Đặc sản chế biến sẵn"
                value={draft.newCategoryName}
                onChange={(e) => update('newCategoryName', e.target.value)}
              />
            ) : (
              <div className="flex items-end pb-2 text-xs text-ink/50">
                Nhóm chuẩn giúp khách lọc nhanh theo 5 khu vực sản phẩm.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Huyện / thành phố xuất xứ"
              name="p-district"
              required
              value={draft.district}
              onChange={(e) => {
                update('district', e.target.value);
                update('commune', '');
              }}
              hint="Bắt buộc chọn đơn vị thuộc tỉnh Hòa Bình."
            >
              <option value="">— Chọn huyện/xã —</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Xã / phường / thôn bản"
              name="p-commune"
              placeholder="Ví dụ: Xã Vân Sơn"
              value={draft.commune}
              onChange={(e) => update('commune', e.target.value)}
              list="commune-options"
              hint="Không bắt buộc, nhưng giúp truy xuất nguồn gốc rõ hơn."
            />
            <datalist id="commune-options">
              {(COMMUNES[draft.district] || []).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <Field label="Cộng đồng dân tộc sản xuất" name="p-ethnic" required>
            <div className="flex flex-wrap gap-2">
              {ETHNICITIES.map((e) => {
                const active = draft.ethnicities.includes(e);
                return (
                  <label
                    key={e}
                    className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-forest-500 bg-forest-600 text-white'
                        : 'border-wood-300/60 bg-rice text-ink/75 hover:border-forest-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={active}
                      onChange={() => toggleEthnicity(e)}
                    />
                    <span
                      className={`grid h-4 w-4 place-items-center rounded border ${
                        active ? 'border-white bg-white/20' : 'border-wood-300'
                      }`}
                      aria-hidden="true"
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {e}
                  </label>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink">
                Ảnh sản phẩm <span className="text-thocam-600">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFile}
                  aria-label="Tải ảnh sản phẩm từ thiết bị"
                />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} loading={compressing}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
                    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Tải ảnh từ thiết bị
                </Button>
                {draft.imageUrl && (
                  <Button variant="ghost" size="sm" onClick={() => update('imageUrl', '')}>
                    Bỏ ảnh
                  </Button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-ink/50">Ảnh được nén tự động, tối đa 15MB ảnh gốc.</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Hoặc dán link ảnh https://…"
                  className={`${inputClass} text-xs`}
                  aria-label="Dán liên kết ảnh"
                />
                <Button variant="light" size="sm" onClick={applyUrl} className="shrink-0 border-wood-300">
                  Dùng link
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl2 border border-wood-300/50 bg-rice">
              <ProductImage
                src={draft.imageUrl}
                alt={draft.imageAlt || `Ảnh xem trước ${draft.name || 'sản phẩm mới'}`}
                categoryId={finalDraft.categoryId || 'trai-cay'}
                seed={draft.name}
                className="aspect-[4/3] w-full"
              />
              <span className="absolute left-2 top-2 rotate-[-4deg] rounded border-2 border-thocam-600/70 bg-white/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-thocam-700">
                Sản phẩm theo yêu cầu
              </span>
            </div>
          </div>

          <TextField
            label="Mô tả ảnh (alt)"
            name="p-alt"
            placeholder="Ví dụ: Bánh ít lá gai gói lá chuối, nhân đậu xanh"
            value={draft.imageAlt}
            onChange={(e) => update('imageAlt', e.target.value)}
            hint="Giúp người dùng khiếm thị hiểu ảnh và tốt cho SEO."
          />
          <TextAreaField
            label="Mô tả ngắn sản phẩm"
            name="p-desc"
            rows={2}
            placeholder="Câu chuyện, cách dùng hoặc điểm đặc biệt của sản phẩm…"
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </section>

        {/* Nhóm 2: Khoa học & ATTP */}
        <section className="space-y-4 rounded-xl2 border border-forest-200 bg-forest-50/50 p-4">
          <header className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-600 text-xs font-bold text-white">2</span>
            <h3 className="text-sm font-bold text-forest-900">Khoa học &amp; An toàn thực phẩm (S)</h3>
          </header>
          <TextAreaField
            label="Quy trình / tiêu chuẩn an toàn"
            name="p-safety"
            required
            rows={2}
            placeholder="Ví dụ: Nguyên liệu tại địa phương, không phụ gia độc hại, hấp chín và gói lá tươi trong ngày…"
            value={draft.safety}
            onChange={(e) => update('safety', e.target.value)}
            hint="Bắt buộc – đây là cam kết chất lượng hiển thị công khai trên thẻ sản phẩm."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextAreaField
              label="Giá trị dinh dưỡng nổi bật"
              name="p-nutrition"
              rows={2}
              placeholder="Ví dụ: Giàu đạm thực vật, chất xơ, năng lượng 250 kcal/100g…"
              value={draft.nutrition}
              onChange={(e) => update('nutrition', e.target.value)}
            />
            <TextAreaField
              label="Hạn dùng &amp; cách bảo quản"
              name="p-storage"
              rows={2}
              placeholder="Ví dụ: Dùng trong 2 ngày, bảo quản ngăn mát 4–8°C…"
              value={draft.storage}
              onChange={(e) => update('storage', e.target.value)}
            />
          </div>
          <Field label="Tem khoa học" name="p-certs">
            <div className="flex flex-wrap gap-1.5">
              {CERT_OPTIONS.map((c) => {
                const active = draft.certs.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCert(c)}
                    aria-pressed={active}
                    className={`inline-flex min-h-[36px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      active
                        ? 'border-shoot-500 bg-shoot-100 text-forest-800'
                        : 'border-wood-300/50 bg-white text-ink/60 hover:border-shoot-400'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>
        </section>

        {/* Nhóm 3: Giá & số lượng */}
        <section className="space-y-4 rounded-xl2 border border-honey-200 bg-honey-100/40 p-4">
          <header className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-honey-600 text-xs font-bold text-white">3</span>
            <h3 className="text-sm font-bold text-forest-900">Khảo sát giá &amp; Số lượng (M)</h3>
          </header>

          <TextField
            label="Đơn vị tính &amp; quy cách đóng gói"
            name="p-unit"
            required
            placeholder="Ví dụ: Chục 10 chiếc, Kg, Hộp 500g…"
            value={draft.unit}
            onChange={(e) => update('unit', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TextField
              label="Giá chợ min (đ)"
              name="p-market-min"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.marketMin || ''}
              onChange={(e) => update('marketMin', Number(e.target.value))}
            />
            <TextField
              label="Giá chợ max (đ)"
              name="p-market-max"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.marketMax || ''}
              onChange={(e) => update('marketMax', Number(e.target.value))}
            />
            <TextField
              label="Giá nhập gốc (đ)"
              name="p-import"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={draft.importPrice || ''}
              onChange={(e) => update('importPrice', Number(e.target.value))}
            />
            <TextField
              label="Giá bán hội chợ (đ)"
              name="p-price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              required
              value={draft.price || ''}
              onChange={(e) => update('price', Number(e.target.value))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <TextField
              label="Số lượng cung ứng / khách đặt"
              name="p-stock"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              required
              value={draft.stock || ''}
              onChange={(e) => update('stock', Math.floor(Number(e.target.value)))}
            />
            <div className="rounded-xl border border-honey-300/70 bg-white/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">Biên lợi nhuận tạm tính</p>
              <p className={`mt-0.5 text-lg font-extrabold ${profitPerUnit < 0 ? 'text-thocam-600' : 'text-forest-700'}`}>
                {formatPercent(margin, 1)}
              </p>
              <p className="text-[11px] text-ink/55">
                {formatVND(profitPerUnit)}/đơn vị · Tổng {formatVND(profitPerUnit * draft.stock)}
              </p>
            </div>
          </div>

          {liveCheck.warnings.length > 0 && (
            <ul className="space-y-1.5 rounded-xl border border-honey-300 bg-honey-100/80 p-3 text-xs text-honey-700" role="status">
              {liveCheck.warnings.map((w) => (
                <li key={w} className="flex gap-1.5">
                  <span aria-hidden="true">⚠</span> {w}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Nhóm 4: Xác nhận */}
        <section className="space-y-4 rounded-xl2 border border-wood-300/40 bg-cream/60 p-4">
          <header className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-wood-700 text-xs font-bold text-white">4</span>
            <h3 className="text-sm font-bold text-forest-900">Người gửi &amp; cam kết</h3>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label={draft.mode === 'customer' ? 'Họ tên người yêu cầu' : 'Tên gian hàng / người đại diện'}
              name="p-requester"
              required={draft.mode === 'customer'}
              placeholder="Nguyễn Văn A"
              value={draft.requesterName}
              onChange={(e) => update('requesterName', e.target.value)}
            />
            <TextField
              label="Số điện thoại liên hệ"
              name="p-phone"
              type="tel"
              required={draft.mode === 'customer'}
              placeholder="0912 345 678"
              value={draft.requesterPhone}
              onChange={(e) => update('requesterPhone', e.target.value)}
              hint="Ban tổ chức dùng để xác nhận nguồn cung hoặc duyệt sản phẩm."
            />
          </div>

          {draft.mode === 'vendor' && !isAdmin && (
            <TextField
              label="Mã mời của ban tổ chức"
              name="p-invite"
              required
              placeholder="Ví dụ: HTX2026"
              value={draft.inviteCode}
              onChange={(e) => update('inviteCode', e.target.value)}
              hint="Mã được cấp cho lớp/HTX tham gia hội chợ. Không chia sẻ công khai."
            />
          )}

          <TextAreaField
            label="Ghi chú cho ban tổ chức"
            name="p-note"
            rows={2}
            placeholder="Số lượng dự kiến, thời gian có hàng, cách liên hệ…"
            value={draft.requesterNote}
            onChange={(e) => update('requesterNote', e.target.value)}
          />

          <CheckboxField
            name="p-commitment"
            label="Tôi cam kết sản phẩm có nguồn gốc tại Hòa Bình và an toàn cho người sử dụng"
            checked={draft.commitment}
            onChange={(v) => update('commitment', v)}
            error={errors.find((e) => e.includes('cam kết'))}
          >
            Thông tin cung cấp là đúng sự thật; ban tổ chức có quyền kiểm tra, chỉnh sửa giá/giá và ẩn sản phẩm
            nếu phát hiện sai lệch.
          </CheckboxField>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            name="website"
          />
        </section>
      </form>
    </Modal>
  );
}
