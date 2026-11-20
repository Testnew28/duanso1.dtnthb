import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { PRODUCT_STATUS_LABEL } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductImage } from '@/components/product/ProductImage';
import { updateProductAdmin, deleteProductAdmin, productCategoryLabel } from '@/lib/repo';
import { formatDateTime, formatVND } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

/**
 * Tab "Yêu cầu & duyệt": gồm
 *  - Sản phẩm khách yêu cầu (source = customer, chờ xác nhận nguồn cung)
 *  - Sản phẩm lớp/HTX gửi chờ duyệt (source = vendor, status = pending_approval)
 */
export function AdminRequests({
  products,
  onChanged,
}: {
  products: Product[];
  onChanged: () => void;
}) {
  const { push } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const requests = useMemo(
    () =>
      products
        .filter((p) => p.source !== 'default')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [products],
  );

  const pending = requests.filter((p) => p.status === 'pending_approval' || p.status === 'pending_supply');

  async function act(p: Product, status: Product['status'], message: string) {
    setBusyId(p.id);
    try {
      await updateProductAdmin(p.id, { status });
      push(message, 'success');
      onChanged();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không thực hiện được.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Xóa yêu cầu “${p.name}”?`)) return;
    setBusyId(p.id);
    try {
      await deleteProductAdmin(p.id);
      push('Đã xóa yêu cầu.', 'success');
      onChanged();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không xóa được.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl2 border border-forest-200 bg-forest-50/60 p-4">
        <h2 className="text-base font-bold text-forest-900">Yêu cầu từ khách &amp; gian hàng lớp/HTX</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/65">
          Sản phẩm khách yêu cầu được gắn nhãn “Chờ xác nhận nguồn cung HTX” và vẫn cho khách đặt trước. Sản phẩm do
          lớp/HTX đăng cần ban tổ chức kiểm tra nguồn gốc, giá rồi bấm “Duyệt đăng bán”.
        </p>
        <p className="mt-1 text-xs text-ink/50">
          Đang chờ xử lý: <strong>{pending.length}</strong> · Tổng yêu cầu: {requests.length}
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="Chưa có yêu cầu nào"
          description="Khi khách gửi yêu cầu mặt hàng mới hoặc lớp/HTX đăng bán, nội dung sẽ xuất hiện tại đây kèm số điện thoại liên hệ."
        />
      ) : (
        <div className="space-y-2.5">
          {requests.map((p) => (
            <article key={p.id} className="rounded-xl2 border border-wood-300/40 bg-rice p-3.5 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <ProductImage
                  src={p.imageUrl}
                  alt={p.imageAlt}
                  categoryId={p.categoryId}
                  seed={p.id}
                  className="h-20 w-24 shrink-0 rounded-lg"
                />
                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={p.source === 'customer' ? 'teal' : 'honey'}>
                      {p.source === 'customer' ? 'Khách yêu cầu' : 'Lớp / HTX đăng'}
                    </Badge>
                    <Badge tone={p.status === 'active' ? 'forest' : p.status === 'hidden' ? 'neutral' : 'honey'}>
                      {PRODUCT_STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-forest-900">{p.name}</h3>
                  <p className="text-[11px] text-ink/50">
                    {productCategoryLabel(p)} · {p.district}
                    {p.commune ? `, ${p.commune}` : ''} · {p.unit}
                  </p>
                  <p className="mt-1 text-xs">
                    Giá đề xuất <strong className="text-cam-600">{formatVND(p.price)}</strong> · Nhập{' '}
                    {formatVND(p.importPrice)} · SL {p.stock}
                  </p>
                  {p.requester && (
                    <div className="mt-1.5 rounded-lg bg-cream px-2.5 py-1.5 text-[11px] text-ink/65">
                      <p>
                        <strong>{p.requester.name}</strong> · {p.requester.phone} · {formatDateTime(p.requester.at)}
                      </p>
                      {p.requester.note && <p className="mt-0.5">“{p.requester.note}”</p>}
                      {p.requester.inviteCode && <p className="mt-0.5 text-ink/45">Mã mời: {p.requester.inviteCode}</p>}
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-wrap gap-1.5 border-t border-wood-300/30 pt-2 sm:w-auto sm:flex-col sm:border-0 sm:pt-0">
                  {p.status === 'pending_approval' && (
                    <Button size="sm" variant="forest" onClick={() => act(p, 'active', 'Đã duyệt đăng bán.')} loading={busyId === p.id}>
                      Duyệt đăng bán
                    </Button>
                  )}
                  {p.status === 'pending_supply' && (
                    <Button size="sm" variant="forest" onClick={() => act(p, 'active', 'Đã xác nhận nguồn cung.')} loading={busyId === p.id}>
                      Đã có nguồn cung
                    </Button>
                  )}
                  {p.status !== 'hidden' && (
                    <Button size="sm" variant="outline" onClick={() => act(p, 'hidden', 'Đã ẩn sản phẩm.')} loading={busyId === p.id}>
                      Ẩn
                    </Button>
                  )}
                  {p.status === 'hidden' && (
                    <Button size="sm" variant="ghost" onClick={() => act(p, 'active', 'Đã hiện lại sản phẩm.')} loading={busyId === p.id}>
                      Hiện
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-thocam-600 hover:bg-thocam-500/10"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
