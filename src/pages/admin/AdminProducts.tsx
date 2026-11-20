import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/types';
import { PRODUCT_SOURCE_LABEL, PRODUCT_STATUS_LABEL } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { TextField, TextAreaField, SelectField, Field, inputClass } from '@/components/ui/Form';
import { ProductImage } from '@/components/product/ProductImage';
import { deleteProductAdmin, productCategoryLabel, persistImage, updateProductAdmin } from '@/lib/repo';
import { formatNumber, formatPercent, formatVND } from '@/lib/format';
import { marketAverage, savingRatio } from '@/lib/finance';
import { compressImage } from '@/lib/image';
import { useToast } from '@/context/ToastContext';

const STATUS_OPTIONS: Product['status'][] = [
  'active',
  'out_of_stock',
  'pending_supply',
  'pending_approval',
  'hidden',
];

export function AdminProducts({
  products,
  onChanged,
  loading,
}: {
  products: Product[];
  onChanged: () => void;
  loading: boolean;
}) {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Product['status']>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        productCategoryLabel(p).toLowerCase().includes(q)
      );
    });
  }, [products, query, statusFilter]);

  const pendingCount = products.filter((p) => p.status === 'pending_approval').length;

  async function quickStatus(p: Product, status: Product['status']) {
    setSavingId(p.id);
    try {
      await updateProductAdmin(p.id, { status });
      push(`“${p.name}” → ${PRODUCT_STATUS_LABEL[status]}.`, 'success');
      onChanged();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không cập nhật được.', 'error');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(p: Product) {
    if (!window.confirm(`Xóa vĩnh viễn “${p.name}”? Nên dùng “Đã ẩn” nếu chỉ muốn gỡ khỏi gian hàng.`)) return;
    setSavingId(p.id);
    try {
      await deleteProductAdmin(p.id);
      push('Đã xóa sản phẩm.', 'success');
      onChanged();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không xóa được.', 'error');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="rounded-xl border border-honey-300 bg-honey-100/70 p-3 text-sm text-honey-700">
          Có <strong>{pendingCount}</strong> sản phẩm do lớp/HTX gửi đang chờ duyệt. Kiểm tra nguồn gốc và giá trước khi
          bấm “Đang bán”.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, huyện, nhóm…"
          className="input-base max-w-xs text-sm"
          aria-label="Tìm sản phẩm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="input-base w-auto text-sm"
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PRODUCT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-ink/50">{visible.length} sản phẩm</span>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/50">Đang tải sản phẩm…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="Không có sản phẩm phù hợp" />
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-wood-300/40 bg-rice">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="bg-cream/80">
                <tr>
                  <th className="admin-th">Sản phẩm</th>
                  <th className="admin-th">Nhóm / Nguồn</th>
                  <th className="admin-th text-right">Giá bán</th>
                  <th className="admin-th text-right">Tồn</th>
                  <th className="admin-th">Trạng thái</th>
                  <th className="admin-th text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const available = Math.max(0, p.stock - p.sold);
                  const avg = marketAverage(p);
                  const saving = savingRatio(p);
                  return (
                    <tr key={p.id} className="border-t border-wood-300/25">
                      <td className="admin-td">
                        <div className="flex items-center gap-2.5">
                          <ProductImage
                            src={p.imageUrl}
                            alt={p.imageAlt}
                            categoryId={p.categoryId}
                            seed={p.id}
                            className="h-11 w-11 shrink-0 rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-ink/85">{p.name}</p>
                            <p className="text-[11px] text-ink/45">{p.district} · {p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="admin-td">
                        <p className="text-[11px] text-ink/60">{productCategoryLabel(p)}</p>
                        <Badge tone={p.source === 'default' ? 'neutral' : p.source === 'customer' ? 'teal' : 'honey'} className="mt-1">
                          {PRODUCT_SOURCE_LABEL[p.source]}
                        </Badge>
                      </td>
                      <td className="admin-td whitespace-nowrap text-right">
                        <p className="font-bold text-cam-600">{formatNumber(p.price)}</p>
                        <p className="text-[10px] text-ink/45">chợ {formatNumber(avg)}</p>
                        {saving <= 0.001 && <p className="text-[10px] font-semibold text-honey-700">cao hơn chợ</p>}
                      </td>
                      <td className="admin-td text-right">
                        <p className="font-semibold">{available}</p>
                        <p className="text-[10px] text-ink/45">đặt {p.sold}/{p.stock}</p>
                      </td>
                      <td className="admin-td">
                        <span className="inline-flex rounded-full border border-wood-300/40 bg-cream px-2 py-1 text-[10px] font-semibold text-ink/70">
                          {PRODUCT_STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="admin-td">
                        <div className="flex flex-wrap justify-end gap-1">
                          {p.status === 'pending_approval' && (
                            <Button size="sm" variant="forest" onClick={() => quickStatus(p, 'active')} loading={savingId === p.id}>
                              Duyệt
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                            Sửa
                          </Button>
                          {p.status !== 'hidden' ? (
                            <Button size="sm" variant="ghost" onClick={() => quickStatus(p, 'hidden')} loading={savingId === p.id}>
                              Ẩn
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => quickStatus(p, 'active')} loading={savingId === p.id}>
                              Hiện
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-thocam-600 hover:bg-thocam-500/10"
                            aria-label={`Xóa ${p.name}`}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditProductModal
        product={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onChanged();
        }}
      />
    </div>
  );
}

function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState<Product | null>(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Mỗi lần mở một sản phẩm khác thì nạp lại biểu mẫu
  useEffect(() => {
    setForm(product);
  }, [product]);

  if (!form) return null;

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const stored = await persistImage(dataUrl);
      update('imageUrl', stored);
      push('Đã cập nhật ảnh (chưa lưu).', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không tải được ảnh.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form) return;
    if (form.price <= 0) {
      push('Giá bán phải lớn hơn 0.', 'error');
      return;
    }
    if (form.stock < form.sold) {
      push(`Số lượng không được nhỏ hơn số đã đặt (${form.sold}).`, 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProductAdmin(form.id, {
        name: form.name,
        price: form.price,
        importPrice: form.importPrice,
        marketMin: form.marketMin,
        marketMax: form.marketMax,
        stock: form.stock,
        status: form.status,
        unit: form.unit,
        imageUrl: form.imageUrl,
        imageAlt: form.imageAlt,
        nutrition: form.nutrition,
        safety: form.safety,
        storage: form.storage,
        description: form.description,
        featured: form.featured,
      });
      push('Đã lưu thay đổi. Giá và tổng dự toán đã cập nhật.', 'success');
      onSaved();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không lưu được.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const margin = form.price > 0 ? (form.price - form.importPrice) / form.price : 0;

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={product ? `Sửa: ${product.name}` : 'Sửa sản phẩm'}
      subtitle="Thay đổi sẽ áp dụng ngay trên cửa hàng và bảng dự toán"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <ProductImage
            src={form.imageUrl}
            alt={form.imageAlt}
            categoryId={form.categoryId}
            seed={form.id}
            className="h-24 w-32 shrink-0 rounded-xl"
          />
          <div className="min-w-[200px] flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
              Thay ảnh thật
            </Button>
            <p className="mt-1 text-[11px] text-ink/50">
              Ảnh được nén và tải lên Supabase Storage. Để trống sẽ dùng ảnh minh họa theo nhóm.
            </p>
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => update('imageUrl', '')}
                className="mt-1 text-[11px] font-semibold text-thocam-600 hover:underline"
              >
                Bỏ ảnh hiện tại
              </button>
            )}
          </div>
        </div>

        <TextField label="Tên sản phẩm" name="e-name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <TextField
          label="Mô tả ảnh (alt)"
          name="e-alt"
          value={form.imageAlt}
          onChange={(e) => update('imageAlt', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TextField
            label="Giá chợ min"
            name="e-market-min"
            type="number"
            value={form.marketMin}
            onChange={(e) => update('marketMin', Number(e.target.value))}
          />
          <TextField
            label="Giá chợ max"
            name="e-market-max"
            type="number"
            value={form.marketMax}
            onChange={(e) => update('marketMax', Number(e.target.value))}
          />
          <TextField
            label="Giá nhập"
            name="e-import"
            type="number"
            value={form.importPrice}
            onChange={(e) => update('importPrice', Number(e.target.value))}
          />
          <TextField
            label="Giá bán"
            name="e-price"
            type="number"
            value={form.price}
            onChange={(e) => update('price', Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TextField
            label="Tổng số lượng"
            name="e-stock"
            type="number"
            value={form.stock}
            onChange={(e) => update('stock', Number(e.target.value))}
          />
          <TextField label="Đã đặt" name="e-sold" value={form.sold} disabled hint="Tự cộng theo đơn" />
          <TextField label="Đơn vị" name="e-unit" value={form.unit} onChange={(e) => update('unit', e.target.value)} />
          <SelectField
            label="Trạng thái"
            name="e-status"
            value={form.status}
            onChange={(e) => update('status', e.target.value as Product['status'])}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABEL[s]}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="rounded-lg border border-honey-300/70 bg-honey-100/50 p-3 text-xs text-honey-700">
          Biên lợi nhuận: <strong>{formatPercent(margin, 1)}</strong> · Lãi/đơn vị:{' '}
          <strong>{formatVND(form.price - form.importPrice)}</strong>
          {form.price > marketAverage(form) && (
            <span className="ml-1 block font-semibold">⚠ Giá bán đang cao hơn giá chợ trung bình.</span>
          )}
        </div>

        <TextAreaField
          label="Giá trị dinh dưỡng (S)"
          name="e-nutrition"
          rows={2}
          value={form.nutrition}
          onChange={(e) => update('nutrition', e.target.value)}
        />
        <TextAreaField
          label="Quy trình / an toàn thực phẩm (S)"
          name="e-safety"
          rows={2}
          value={form.safety}
          onChange={(e) => update('safety', e.target.value)}
        />
        <TextAreaField
          label="Bảo quản"
          name="e-storage"
          rows={2}
          value={form.storage}
          onChange={(e) => update('storage', e.target.value)}
        />
        <TextAreaField
          label="Mô tả sản phẩm"
          name="e-desc"
          rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />

        <Field label="Sản phẩm nổi bật" name="e-featured">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="h-4 w-4 accent-forest-600"
            />
            Hiển thị trong mục “Sản vật tiêu biểu” ở trang chủ
          </label>
        </Field>
      </div>
    </Modal>
  );
}
