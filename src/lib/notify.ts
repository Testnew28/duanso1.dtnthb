import type { Order } from '@/types';
import { supabase } from './supabase';

/**
 * Gửi thông báo đơn mới tới ban tổ chức.
 * Mặc định (theo lựa chọn của dự án) đơn mới hiển thị trong /admin.
 * Nếu bật VITE_TELEGRAM_ENABLED và triển khai Edge Function, hàm sẽ gọi thêm Telegram.
 * Mọi lỗi đều bị nuốt để KHÔNG làm hỏng thao tác đặt hàng của khách.
 */
export async function notifyNewOrder(order: Order): Promise<void> {
  const enabled = String(import.meta.env.VITE_TELEGRAM_ENABLED || '') === 'true';
  if (!enabled || !supabase) return;
  try {
    await supabase.functions.invoke('notify-order', {
      body: {
        code: order.code,
        name: order.customerName,
        phone: order.phone,
        total: order.total,
        itemCount: order.items.reduce((s, i) => s + i.qty, 0),
        paymentMethod: order.paymentMethod,
      },
    });
  } catch {
    // Không chặn đặt hàng nếu thông báo lỗi
  }
}
