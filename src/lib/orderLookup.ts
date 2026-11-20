import type { Order } from '@/types';
import { lookupOrder } from './repo';
import { normalizePhone } from './format';

/**
 * Sau khi đặt hàng, số điện thoại được lưu tạm trong sessionStorage
 * để trang "Đơn hàng của tôi" hiển thị ngay mà không cần nhập lại.
 * (Dữ liệu chỉ nằm trên thiết bị của khách, không gửi đi đâu.)
 */
export function rememberOrderPhone(code: string, phone: string): void {
  try {
    sessionStorage.setItem(`hsxm:order:${code}`, normalizePhone(phone));
  } catch {
    /* bỏ qua */
  }
}

export async function fetchUserOrderByCode(code: string, phone: string): Promise<Order | null> {
  if (!phone) return null;
  return lookupOrder(code, phone);
}
