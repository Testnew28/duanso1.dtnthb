import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { fetchOrders, backendMode } from '@/lib/repo';
import { actualRevenue, computeFinance } from '@/lib/finance';
import { formatNumber, formatVND } from '@/lib/format';
import type { Order } from '@/types';
import { ORDER_STATUS_LABEL } from '@/types';
import { AdminLogin } from './admin/AdminLogin';
import { AdminOrders } from './admin/AdminOrders';
import { AdminProducts } from './admin/AdminProducts';
import { AdminRequests } from './admin/AdminRequests';
import { AdminSettings } from './admin/AdminSettings';
import { AdminReport } from './admin/AdminReport';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StiltHouseMark } from '@/components/ui/Motif';
import { cn } from '@/lib/format';

type Tab = 'orders' | 'products' | 'requests' | 'settings' | 'report';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'orders', label: 'Đơn hàng', icon: 'orders' },
  { id: 'products', label: 'Sản phẩm', icon: 'products' },
  { id: 'requests', label: 'Yêu cầu & duyệt', icon: 'requests' },
  { id: 'report', label: 'Báo cáo', icon: 'report' },
  { id: 'settings', label: 'Cấu hình', icon: 'settings' },
];

const SEEN_KEY = 'hsxm:admin:seenOrders';

export function AdminPage() {
  usePageMeta('Quản trị ban tổ chức | Hương Sắc Xứ Mường');
  const { user, loading: authLoading, signOut } = useAuth();
  const { products, settings, loading: storeLoading, reload, mode } = useStore();
  const { push } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(() => {
    try {
      return localStorage.getItem(SEEN_KEY) || new Date(0).toISOString();
    } catch {
      return new Date(0).toISOString();
    }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadOrders = useMemo(
    () => async () => {
      if (!user) return;
      setOrdersLoading(true);
      try {
        setOrders(await fetchOrders());
      } catch (err) {
        push(err instanceof Error ? err.message : 'Không tải được đơn hàng.', 'error');
      } finally {
        setOrdersLoading(false);
      }
    },
    [user, push],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Sau khi đăng nhập, tải lại sản phẩm/cấu hình: khách chỉ đọc được bản công khai
  // (không có mã mời lớp/HTX), admin đọc được bản đầy đủ.
  useEffect(() => {
    if (user) void reload();
  }, [user, reload]);

  // Đóng bảng thông báo khi bấm ra ngoài
  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notifOpen]);

  const newOrders = useMemo(
    () => orders.filter((o) => o.createdAt > lastSeen && o.status === 'new'),
    [orders, lastSeen],
  );

  const newCount = newOrders.length;

  const plan = useMemo(() => computeFinance(products, settings.shippingCost), [products, settings.shippingCost]);
  const revenueActual = actualRevenue(orders);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());

  function markSeen() {
    const now = new Date().toISOString();
    setLastSeen(now);
    try {
      localStorage.setItem(SEEN_KEY, now);
    } catch {
      /* bỏ qua */
    }
  }

  async function handleSignOut() {
    await signOut();
    push('Đã đăng xuất.', 'success');
    navigate('/');
  }

  if (authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <p className="text-sm text-ink/50">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <div className="min-h-dvh bg-[#F7F2E6]">
      <header className="sticky top-0 z-40 border-b border-wood-300/40 bg-forest-900 text-cream">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <Link to="/" className="flex items-center gap-2" aria-label="Về trang khách">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-700">
              <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="30" r="13" fill="#E8A020" />
                <path d="M21 46c4-8 9-12 11-13 3 1 8 5 11 13" fill="none" stroke="#FBF6EA" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight">Hương Sắc Xứ Mường</span>
              <span className="block text-[10px] uppercase tracking-wider text-honey-200">Trang quản trị</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  if (!notifOpen) markSeen();
                }}
                className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/5 text-cream hover:bg-white/10"
                aria-label={`Thông báo, ${newCount} đơn mới`}
                aria-expanded={notifOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
                {newCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cam-600 px-1 text-[10px] font-bold text-white">
                    {newCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-wood-300/40 bg-rice text-ink shadow-float">
                  <div className="border-b border-wood-300/40 bg-cream px-3 py-2">
                    <p className="text-xs font-bold text-forest-900">Đơn mới cần xử lý</p>
                    <p className="text-[10px] text-ink/50">Thông báo hiển thị trong trang quản trị</p>
                  </div>
                  {newOrders.length === 0 ? (
                    <p className="px-3 py-5 text-center text-xs text-ink/50">Không có đơn mới.</p>
                  ) : (
                    <ul className="max-h-72 divide-y divide-wood-300/30 overflow-y-auto">
                      {newOrders.slice(0, 8).map((o) => (
                        <li key={o.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setTab('orders');
                              setNotifOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-cream"
                          >
                            <span className="flex justify-between gap-2">
                              <span className="font-mono text-[11px] font-bold text-forest-800">{o.code}</span>
                              <span className="text-[11px] font-bold text-cam-600">{formatVND(o.total)}</span>
                            </span>
                            <span className="block text-[10px] text-ink/55">
                              {o.customerName} · {o.classUnit}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-cream/55">{user.email}</p>
            </div>
            <Button variant="light" size="sm" onClick={handleSignOut}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-forest-900">Bảng điều khiển ban tổ chức</h1>
            <p className="mt-0.5 text-xs text-ink/55">
              {settings.pickupAddress} · {mode === 'supabase' ? 'Dữ liệu Supabase' : 'Chạy thử cục bộ (một thiết bị)'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={mode === 'supabase' ? 'forest' : 'honey'}>
              {mode === 'supabase' ? 'Supabase' : 'Local'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void reload();
                void loadOrders();
              }}
            >
              Làm mới dữ liệu
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm">
                Xem trang khách
              </Button>
            </Link>
          </div>
        </div>

        {/* Thẻ số liệu nhanh */}
        <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <MiniStat label="Đơn hôm nay" value={formatNumber(todayOrders.length)} sub={`${orders.length} đơn tổng`} />
          <MiniStat label="Đơn mới chờ xử lý" value={formatNumber(orders.filter((o) => o.status === 'new').length)} sub="Cần xác nhận" tone="honey" />
          <MiniStat label="Doanh thu thực tế" value={formatVND(revenueActual)} sub="Bỏ đơn đã hủy" tone="forest" />
          <MiniStat label="Hoàn thành dự toán" value={`${plan.revenue > 0 ? Math.round((revenueActual / plan.revenue) * 100) : 0}%`} sub={`Dự toán ${formatVND(plan.revenue)}`} />
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto border-b border-wood-300/40 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition',
                tab === t.id ? 'bg-forest-700 text-white' : 'text-ink/65 hover:bg-white',
              )}
            >
              {t.label}
              {t.id === 'requests' && products.some((p) => p.source !== 'default' && (p.status === 'pending_approval' || p.status === 'pending_supply')) && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-cam-600 px-1 text-[9px] text-white">
                  {products.filter((p) => p.source !== 'default' && (p.status === 'pending_approval' || p.status === 'pending_supply')).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-xl2 border border-wood-300/30 bg-white/40 p-3 sm:p-4">
          {tab === 'orders' && (
            <AdminOrders orders={orders} onChanged={() => void loadOrders()} loading={ordersLoading} />
          )}
          {tab === 'products' && (
            <AdminProducts products={products} onChanged={() => void reload()} loading={storeLoading} />
          )}
          {tab === 'requests' && <AdminRequests products={products} onChanged={() => void reload()} />}
          {tab === 'report' && <AdminReport orders={orders} products={products} />}
          {tab === 'settings' && <AdminSettings />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-wood-300/30 bg-rice/70 px-3 py-2.5 text-[11px] text-ink/45">
          <span>
            {backendMode === 'supabase'
              ? 'Đang dùng Supabase: dữ liệu đồng bộ giữa các thiết bị theo chính sách RLS.'
              : 'Chế độ chạy thử: dữ liệu chỉ lưu trên trình duyệt này. Cấu hình Supabase để dùng thật.'}
          </span>
          <StiltHouseMark className="hidden h-8 w-12 shrink-0 text-wood-400 sm:block" />
        </div>

        <p className="mt-3 text-center text-[10px] text-ink/35">
          Các trạng thái đơn: {(['new', 'confirmed', 'paid', 'delivered', 'cancelled'] as const).map((s) => ORDER_STATUS_LABEL[s]).join(' → ')}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'default' | 'honey' | 'forest';
}) {
  const styles = {
    default: 'border-wood-300/40 bg-rice text-forest-900',
    honey: 'border-honey-300 bg-honey-100/70 text-honey-700',
    forest: 'border-forest-200 bg-forest-50 text-forest-800',
  }[tone];
  return (
    <div className={`rounded-xl2 border p-3 shadow-sm ${styles}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-65">{label}</p>
      <p className="price-tag mt-0.5 text-lg font-extrabold">{value}</p>
      <p className="text-[10px] opacity-55">{sub}</p>
    </div>
  );
}
