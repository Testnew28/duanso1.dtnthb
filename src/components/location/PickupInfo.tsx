import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buildSiteQrUrl } from '@/lib/vietqr';
import { useToast } from '@/context/ToastContext';

export function PickupInfo() {
  const { settings } = useStore();
  const { push } = useToast();
  const [copied, setCopied] = useState(false);
  const siteUrl = settings.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Trường PT DTNT THPT Hòa Bình, Phường Tân Hòa, Hòa Bình',
  )}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      push('Đã sao chép địa chỉ website.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      push('Không sao chép được. Bạn có thể chọn và sao chép thủ công.', 'error');
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
      <div className="space-y-4">
        <div className="rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="relative mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cam-500/15 text-cam-600">
              <span className="radar-ring" aria-hidden="true" />
              <span className="radar-ring delay-1" aria-hidden="true" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.4" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cam-600">Điểm nhận hàng</p>
              <h3 className="mt-0.5 text-lg leading-snug text-forest-900">Trường PT DTNT THPT Hòa Bình</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{settings.pickupAddress}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 border-t border-wood-300/30 pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-ink/55">Giờ nhận hàng</span>
              <span className="text-right font-semibold text-ink/85">{settings.pickupHours}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink/55">Hotline</span>
              <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="font-semibold text-forest-700 underline-offset-2 hover:underline">
                {settings.hotline}
              </a>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink/55">Hình thức</span>
              <span className="text-right font-semibold text-ink/85">Nhận tại trường · COD / VietQR</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a href={directions} target="_blank" rel="noreferrer">
              <Button variant="forest" size="sm">
                Chỉ đường Google Maps
              </Button>
            </a>
            <a href={`tel:${settings.hotline.replace(/\s/g, '')}`}>
              <Button variant="outline" size="sm">
                Gọi ban tổ chức
              </Button>
            </a>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
            Khi tới nhận hàng, bạn đọc mã đơn (dạng HSXM-XXXXXX) và số điện thoại đã đặt để ban tổ chức đối chiếu.
          </p>
        </div>

        <div className="rounded-xl2 border border-forest-200 bg-forest-50/70 p-4">
          <div className="flex items-center gap-3">
            {siteUrl ? (
              <img
                src={buildSiteQrUrl(siteUrl)}
                alt="Mã QR dẫn tới website Hương Sắc Xứ Mường"
                width={88}
                height={88}
                loading="lazy"
                className="h-[88px] w-[88px] rounded-lg border border-white bg-white p-1"
              />
            ) : (
              <div className="grid h-[88px] w-[88px] place-items-center rounded-lg bg-white text-[10px] text-ink/40">
                Chưa có URL
              </div>
            )}
            <div className="min-w-0">
              <Badge tone="forest">T – Technology</Badge>
              <p className="mt-1 text-sm font-bold text-forest-900">Quét QR để mở gian hàng</p>
              <p className="mt-0.5 break-all text-[11px] text-ink/55">{siteUrl}</p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-1.5 text-xs font-semibold text-cam-600 underline-offset-2 hover:underline"
              >
                {copied ? 'Đã sao chép' : 'Sao chép liên kết'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative min-h-[320px] overflow-hidden rounded-xl2 border border-wood-300/50 bg-wood-100 shadow-card">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-cam-600 text-white shadow-float">
            <span className="radar-ring" aria-hidden="true" />
            <span className="radar-ring delay-1" aria-hidden="true" />
            <span className="radar-ring delay-2" aria-hidden="true" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.2" fill="currentColor" stroke="none" />
            </svg>
          </span>
        </div>
        <iframe
          title="Bản đồ điểm nhận hàng Trường PT DTNT THPT Hòa Bình"
          src={settings.mapEmbedUrl}
          className="h-full min-h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
