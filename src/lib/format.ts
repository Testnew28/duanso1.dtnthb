// Các hàm định dạng dùng chung (tiền VNĐ, ngày giờ, SĐT, slug…)

const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** 1234000 → "1.234.000 đ" */
export function formatVND(value: number): string {
  return `${vnd.format(Math.round(value || 0))} đ`;
}

/** 1234000 → "1.234.000" (dùng trong bảng, không kèm đơn vị) */
export function formatNumber(value: number): string {
  return vnd.format(Math.round(value || 0));
}

/** 0.2024 → "20,2%" */
export function formatPercent(ratio: number, digits = 2): string {
  return `${(ratio * 100).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })}%`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Chuẩn hóa SĐT: bỏ khoảng trắng, dấu chấm, gạch ngang */
export function normalizePhone(raw: string): string {
  return (raw || '').replace(/[\s.\-()]/g, '');
}

/** SĐT Việt Nam: di động 10 số (0xxxxxxxxx) hoặc cố định 11 số */
export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return /^0\d{9,10}$/.test(p);
}

/** Bỏ dấu tiếng Việt để tìm kiếm: "Măng" → "mang" */
export function removeDiacritics(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function slugify(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Mã đơn hàng: HSXM-AB12CD (bỏ các ký tự dễ nhầm 0/O/1/I) */
export function generateOrderCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  for (let i = 0; i < 6; i++) {
    let n: number;
    if (cryptoObj?.getRandomValues) {
      const buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      n = buf[0] % alphabet.length;
    } else {
      n = Math.floor(Math.random() * alphabet.length);
    }
    out += alphabet[n];
  }
  return `HSXM-${out}`;
}

export function shortAddress(district: string, commune: string): string {
  return commune ? `${commune}, ${district.replace('Huyện ', '')}` : district;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
