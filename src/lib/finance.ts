import type { Order, Product } from '@/types';

// ============================================================
// TOÀN BỘ PHÉP TÍNH TÀI CHÍNH – KHÔNG GÕ CỨNG BẤT KỲ TỔNG NÀO
// ============================================================

/** Chi phí vận chuyển & đóng gói mặc định theo tài liệu; admin sửa được */
export const DEFAULT_SHIPPING_COST = 1_716_000;

/** Giá chợ trung bình = (min + max) / 2 */
export function marketAverage(p: Pick<Product, 'marketMin' | 'marketMax'>): number {
  if (!p.marketMin && !p.marketMax) return 0;
  if (!p.marketMin) return p.marketMax;
  if (!p.marketMax) return p.marketMin;
  return (p.marketMin + p.marketMax) / 2;
}

/** % tiết kiệm của một sản phẩm so với giá chợ trung bình */
export function savingRatio(p: Pick<Product, 'marketMin' | 'marketMax' | 'price'>): number {
  const avg = marketAverage(p);
  if (avg <= 0) return 0;
  return (avg - p.price) / avg;
}

/**
 * Sản phẩm được đưa vào bảng dự toán:
 * - Gồm sản phẩm đang bán, hết hàng tạm thời, và sản phẩm đặt trước theo yêu cầu.
 * - Không gồm sản phẩm chờ duyệt hoặc đã ẩn (chưa lên kệ).
 */
export function isOnShelf(p: Product): boolean {
  return p.status === 'active' || p.status === 'out_of_stock' || p.status === 'pending_supply';
}

export function countsInPlan(p: Product): boolean {
  return p.status !== 'hidden' && p.status !== 'pending_approval';
}

export interface FinanceLine {
  product: Product;
  revenue: number;
  cost: number;
  gross: number;
  marketAvg: number;
  marketValue: number;
  saving: number;
}

export function financeLine(p: Product): FinanceLine {
  const revenue = p.price * p.stock;
  const cost = p.importPrice * p.stock;
  const marketAvg = marketAverage(p);
  return {
    product: p,
    revenue,
    cost,
    gross: revenue - cost,
    marketAvg,
    marketValue: marketAvg * p.stock,
    saving: savingRatio(p),
  };
}

export interface FinanceSummary {
  productCount: number;
  plannedQty: number;
  revenue: number;
  cost: number;
  gross: number;
  shippingCost: number;
  net: number;
  netMargin: number;
  avgSaving: number;
  marketValue: number;
  totalSavingValue: number;
}

export function computeFinance(products: Product[], shippingCost: number): FinanceSummary {
  const lines = products.filter(countsInPlan).map(financeLine);
  const revenue = lines.reduce((s, l) => s + l.revenue, 0);
  const cost = lines.reduce((s, l) => s + l.cost, 0);
  const gross = revenue - cost;
  const net = gross - shippingCost;
  const marketValue = lines.reduce((s, l) => s + l.marketValue, 0);
  // Trung bình cộng tỷ lệ tiết kiệm của từng mặt hàng (đúng công thức yêu cầu)
  const withMarket = lines.filter((l) => l.marketAvg > 0);
  const avgSaving =
    withMarket.length > 0 ? withMarket.reduce((s, l) => s + l.saving, 0) / withMarket.length : 0;

  return {
    productCount: lines.length,
    plannedQty: lines.reduce((s, l) => s + l.product.stock, 0),
    revenue,
    cost,
    gross,
    shippingCost,
    net,
    netMargin: revenue > 0 ? net / revenue : 0,
    avgSaving,
    marketValue,
    totalSavingValue: marketValue - revenue,
  };
}

/** Doanh thu thực tế từ đơn hàng (bỏ đơn hủy) */
export function actualRevenue(orders: Order[]): number {
  return orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
}

/** Tiền đã thu thực tế: đơn đã thu tiền hoặc đã giao */
export function collectedRevenue(orders: Order[]): number {
  return orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((s, o) => s + o.total, 0);
}

export function orderStatusCounts(orders: Order[]): Record<string, number> {
  return orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
}
