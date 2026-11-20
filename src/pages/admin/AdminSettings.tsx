import { useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { TextField, TextAreaField, CheckboxField, inputClass } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatVND } from '@/lib/format';
import { isBankConfigured } from '@/lib/vietqr';

const BANKS = [
  { bin: '970422', name: 'MB Bank' },
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'VPBank' },
];

export function AdminSettings() {
  const { settings, updateSettings, mode } = useStore();
  const { push } = useToast();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);

  // Nếu cấu hình vừa tải xong sau khi mở tab, đồng bộ vào biểu mẫu
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (form.shippingCost < 0) {
      push('Chi phí vận chuyển không hợp lệ.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateSettings(form);
      push('Đã lưu cấu hình. Toàn bộ số tổng đã tính lại.', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Không lưu được cấu hình.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const bankReady = isBankConfigured(form.bankBin, form.bankAccountNo);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={mode === 'supabase' ? 'forest' : 'honey'}>
          {mode === 'supabase' ? 'Supabase' : 'Chạy thử cục bộ'}
        </Badge>
        <p className="text-xs text-ink/50">Thay đổi chỉ áp dụng sau khi bấm “Lưu cấu hình”.</p>
      </div>

      <section className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
        <h2 className="text-base font-bold text-forest-900">Tài chính &amp; vận chuyển</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">
          Chi phí này được trừ vào lợi nhuận gộp để ra lợi nhuận ròng trong bảng dự toán.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextField
            label="Chi phí vận chuyển & đóng gói (đ)"
            name="s-shipping"
            type="number"
            min={0}
            step={1000}
            value={form.shippingCost}
            onChange={(e) => update('shippingCost', Number(e.target.value))}
            hint={`Hiện tại: ${formatVND(form.shippingCost)}. Mặc định theo tài liệu: 1.716.000 đ.`}
          />
          <div className="rounded-xl bg-cream p-3 text-xs">
            <p className="text-ink/55">Ảnh hưởng lên báo cáo</p>
            <p className="mt-1 text-ink/75">
              Lợi nhuận ròng = lợi nhuận gộp − <strong>{formatNumber(form.shippingCost)} đ</strong>
            </p>
            <p className="mt-0.5 text-ink/50">Tỷ suất ròng thay đổi tương ứng trong trang Khảo sát giá.</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
        <h2 className="text-base font-bold text-forest-900">Nhận hàng tại trường</h2>
        <div className="mt-3 space-y-3">
          <TextAreaField
            label="Địa chỉ điểm nhận"
            name="s-address"
            rows={2}
            value={form.pickupAddress}
            onChange={(e) => update('pickupAddress', e.target.value)}
          />
          <TextAreaField
            label="Giờ nhận hàng"
            name="s-hours"
            rows={2}
            value={form.pickupHours}
            onChange={(e) => update('pickupHours', e.target.value)}
            hint="Hiển thị trên trang chủ, trang vị trí và trang xác nhận đơn."
          />
          <TextField
            label="Hotline ban tổ chức"
            name="s-hotline"
            value={form.hotline}
            onChange={(e) => update('hotline', e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-forest-900">Tài khoản nhận chuyển khoản (VietQR)</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink/55">
              Thông tin này tạo mã QR theo số tiền và nội dung đơn. Không lưu khóa bí mật ở đây.
            </p>
          </div>
          <Badge tone={bankReady ? 'forest' : 'honey'}>{bankReady ? 'Đã cấu hình' : 'Chưa cấu hình'}</Badge>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Ngân hàng
            <select
              value={form.bankBin}
              onChange={(e) => {
                const bank = BANKS.find((b) => b.bin === e.target.value);
                update('bankBin', e.target.value);
                if (bank) update('bankName', bank.name);
              }}
              className={`${inputClass} mt-1`}
            >
              {BANKS.map((b) => (
                <option key={b.bin} value={b.bin}>
                  {b.name} ({b.bin})
                </option>
              ))}
              {!BANKS.some((b) => b.bin === form.bankBin) && <option value={form.bankBin}>Khác ({form.bankBin})</option>}
            </select>
          </label>
          <TextField
            label="Số tài khoản"
            name="s-account"
            value={form.bankAccountNo}
            onChange={(e) => update('bankAccountNo', e.target.value)}
            placeholder="VD: 0123456789"
          />
          <TextField
            label="Tên chủ tài khoản (không dấu)"
            name="s-account-name"
            value={form.bankAccountName}
            onChange={(e) => update('bankAccountName', e.target.value.toUpperCase())}
            placeholder="TRUONG PT DTNT THPT HOA BINH"
          />
          <TextField
            label="Tên ngân hàng hiển thị"
            name="s-bank-name"
            value={form.bankName}
            onChange={(e) => update('bankName', e.target.value)}
          />
        </div>

        {!bankReady && (
          <p className="mt-2 rounded-lg border border-honey-300 bg-honey-100/70 px-3 py-2 text-xs text-honey-700">
            Số tài khoản hiện là placeholder. Khách chọn chuyển khoản sẽ được nhắc thanh toán COD cho tới khi bạn cập nhật
            số thật.
          </p>
        )}
      </section>

      <section className="rounded-xl2 border border-wood-300/40 bg-rice p-4 shadow-card">
        <h2 className="text-base font-bold text-forest-900">Gian hàng lớp/HTX &amp; bản đồ</h2>
        <div className="mt-3 space-y-3">
          <TextField
            label="Mã mời cho lớp/HTX"
            name="s-invite"
            value={form.vendorInviteCode}
            onChange={(e) => update('vendorInviteCode', e.target.value.toUpperCase())}
            hint="Chia sẻ riêng cho đại diện lớp/HTX. Đổi mã sẽ vô hiệu mã cũ."
          />
          <CheckboxField
            name="s-auto-approve"
            label="Tự động duyệt sản phẩm do lớp/HTX đăng"
            checked={form.autoApproveVendors}
            onChange={(v) => update('autoApproveVendors', v)}
          >
            Nếu tắt, sản phẩm sẽ vào mục “Chờ duyệt” để ban tổ chức kiểm tra trước.
          </CheckboxField>
          <TextField
            label="Link nhúng Google Maps"
            name="s-map"
            value={form.mapEmbedUrl}
            onChange={(e) => update('mapEmbedUrl', e.target.value)}
            hint="Google Maps → Chia sẻ → Nhúng bản đồ → sao chép giá trị src."
          />
          <TextField
            label="Địa chỉ website (dùng cho mã QR và chia sẻ)"
            name="s-site"
            value={form.siteUrl}
            onChange={(e) => update('siteUrl', e.target.value)}
            placeholder="https://huongsacxumuong.vn"
          />
        </div>
      </section>

      <div className="sticky bottom-20 z-20 flex justify-end lg:bottom-4">
        <Button variant="primary" size="lg" onClick={save} loading={saving}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
