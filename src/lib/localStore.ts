import { SEED_PRODUCTS } from '@/data/products';
import type { Order, Product, Settings } from '@/types';
import { DEFAULT_SHIPPING_COST } from './finance';

// Kho dữ liệu cục bộ (localStorage) dùng khi CHƯA cấu hình Supabase.
// Khi có Supabase, toàn bộ dữ liệu được lưu trên PostgreSQL (xem lib/repo.ts).

const KEYS = {
  products: 'hsxm:products:v1',
  settings: 'hsxm:settings:v1',
  orders: 'hsxm:orders:v1',
  admin: 'hsxm:admin:v1',
  categories: 'hsxm:categories:v1',
  seeded: 'hsxm:seeded:v1',
} as const;

export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Có thể do trình duyệt chặn localStorage (chế độ riêng tư) hoặc hết dung lượng
    console.warn('Không ghi được localStorage', err);
  }
}

export function defaultSettings(): Settings {
  const env = import.meta.env;
  return {
    id: 1,
    shippingCost: DEFAULT_SHIPPING_COST,
    pickupHours: 'Sáng 8:00–11:30 · Chiều 14:00–17:00 (ban tổ chức cập nhật theo ngày hội chợ)',
    pickupAddress: 'Sân trường PT DTNT THPT Hòa Bình, Phường Tân Hòa, TP. Hòa Bình',
    hotline: env.VITE_HOTLINE || '0218 3851 234',
    bankBin: env.VITE_BANK_BIN || '970422',
    bankAccountNo: env.VITE_BANK_ACCOUNT_NO || '0000000000',
    bankAccountName: env.VITE_BANK_ACCOUNT_NAME || 'TRUONG PT DTNT THPT HOA BINH',
    bankName: env.VITE_BANK_NAME || 'MB Bank',
    vendorInviteCode: 'HTX2026',
    autoApproveVendors: false,
    mapEmbedUrl:
      env.VITE_MAP_EMBED_URL ||
      'https://www.google.com/maps?q=Truong%20PT%20DTNT%20THPT%20Hoa%20Binh%2C%20Tan%20Hoa%2C%20Hoa%20Binh&output=embed',
    siteUrl: env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
    zaloUrl: '',
    facebookUrl: '',
  };
}

/** Khởi tạo dữ liệu mẫu lần đầu chạy chế độ local */
export function ensureLocalSeed(): void {
  const seeded = localStorage.getItem(KEYS.seeded);
  const existing = readJSON<Product[] | null>(KEYS.products, null);
  if (!seeded || !existing || existing.length === 0) {
    writeJSON(KEYS.products, clone(SEED_PRODUCTS));
    writeJSON(KEYS.settings, defaultSettings());
    writeJSON(KEYS.orders, []);
    localStorage.setItem(KEYS.seeded, new Date().toISOString());
  }
  if (!localStorage.getItem(KEYS.settings)) writeJSON(KEYS.settings, defaultSettings());
  if (!localStorage.getItem(KEYS.orders)) writeJSON(KEYS.orders, [] as Order[]);
}

export function localProducts(): Product[] {
  ensureLocalSeed();
  return readJSON<Product[]>(KEYS.products, clone(SEED_PRODUCTS));
}

export function setLocalProducts(products: Product[]): void {
  writeJSON(KEYS.products, products);
}

export function localSettings(): Settings {
  ensureLocalSeed();
  return { ...defaultSettings(), ...readJSON<Partial<Settings>>(KEYS.settings, {}) };
}

export function setLocalSettings(patch: Partial<Settings>): Settings {
  const next = { ...localSettings(), ...patch, id: 1 };
  writeJSON(KEYS.settings, next);
  return next;
}

export function localOrders(): Order[] {
  ensureLocalSeed();
  return readJSON<Order[]>(KEYS.orders, []);
}

export function setLocalOrders(orders: Order[]): void {
  writeJSON(KEYS.orders, orders);
}

export { KEYS as LOCAL_KEYS };
