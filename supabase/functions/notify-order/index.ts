// ============================================================
// SUPABASE EDGE FUNCTION – notify-order
// Gửi thông báo đơn mới tới Telegram của ban tổ chức.
//
// ĐÂY LÀ TÙY CHỌN. Mặc định hệ thống không bật (VITE_TELEGRAM_ENABLED=false)
// và đơn mới đã hiển thị trong /admin kèm chuông thông báo.
//
// Triển khai:
//   supabase functions deploy notify-order --no-verify-jwt
//   supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
//
// Sau đó đặt VITE_TELEGRAM_ENABLED=true trong .env rồi build lại.
// ============================================================

const TELEGRAM_API = 'https://api.telegram.org';

interface OrderNotification {
  code?: string;
  name?: string;
  phone?: string;
  total?: number;
  itemCount?: number;
  paymentMethod?: string;
}

const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return Response.json(
      { ok: false, skipped: true, reason: 'Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID' },
      { status: 200 },
    );
  }

  let payload: OrderNotification;
  try {
    payload = (await req.json()) as OrderNotification;
  } catch {
    return Response.json({ ok: false, error: 'JSON không hợp lệ' }, { status: 400 });
  }

  const code = escapeHtml(String(payload.code || '—'));
  const name = escapeHtml(String(payload.name || '—'));
  const phone = escapeHtml(String(payload.phone || '—'));
  const total = vnd.format(Number(payload.total) || 0);
  const itemCount = Number(payload.itemCount) || 0;
  const payment =
    payload.paymentMethod === 'transfer' ? 'Chuyển khoản VietQR' : 'COD khi nhận hàng';

  const text = [
    '<b>ĐƠN HÀNG MỚI – Hương Sắc Xứ Mường</b>',
    '',
    `Mã đơn: <code>${code}</code>`,
    `Khách: ${name} · ${phone}`,
    `Số lượng: ${itemCount} sản phẩm`,
    `Thanh toán: ${total} đ (${payment})`,
    '',
    'Xử lý tại: /admin → Đơn hàng',
  ].join('\n');

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ ok: false, error: detail }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
