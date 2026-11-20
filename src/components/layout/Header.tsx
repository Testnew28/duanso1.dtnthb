import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { to: '/', label: 'Trang chủ' },
  { to: '/cua-hang', label: 'Cửa hàng' },
  { to: '/khoa-hoc', label: 'Khoa học' },
  { to: '/khao-sat-gia', label: 'Khảo sát giá' },
  { to: '/vi-tri', label: 'Vị trí' },
  { to: '/tra-cuu', label: 'Tra cứu đơn' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const count = useCart().count;
  const { settings } = useStore();
  const { user } = useAuth();
  const lastCount = useRef(count);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onArrive = () => {
      setBump(true);
      window.setTimeout(() => setBump(false), 500);
    };
    window.addEventListener('hsxm:cart-arrive', onArrive);
    window.addEventListener('hsxm:cart-bump', onArrive);
    return () => {
      window.removeEventListener('hsxm:cart-arrive', onArrive);
      window.removeEventListener('hsxm:cart-bump', onArrive);
    };
  }, []);

  useEffect(() => {
    lastCount.current = count;
  }, [count]);

  return (
    <header className="sticky top-0 z-50 border-b border-wood-300/30 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-forest-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Bỏ qua điều hướng
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Hương Sắc Xứ Mường – về trang chủ">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-700 shadow-sm">
            <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="30" r="14" fill="#E8A020" />
              <path d="M32 16c4 6 4 11 0 14-4-3-4-8 0-14Z" fill="#8FBF5A" />
              <path d="M21 46c4-8 9-12 11-13 3 1 8 5 11 13" fill="none" stroke="#FBF6EA" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[17px] font-bold leading-tight text-forest-900">
              Hương Sắc Xứ Mường
            </span>
            <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-cam-600">
              Nông sản sạch Hòa Bình
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Điều hướng chính">
          {NAV.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-forest-50 text-forest-800' : 'text-ink/70 hover:bg-forest-50 hover:text-forest-800',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
          <Link
            to={user ? '/admin' : '/admin'}
            className="hidden h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink/65 transition hover:bg-forest-50 hover:text-forest-800 sm:flex"
            title="Trang quản trị ban tổ chức"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="hidden md:inline">{user ? 'Quản trị' : 'BTC'}</span>
          </Link>

          <Link
            to="/dat-hang"
            id="cart-target"
            className={cn(
              'relative flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-forest-200 bg-white px-2.5 text-forest-800 shadow-sm transition hover:border-forest-400',
              bump && 'animate-cart-shake',
            )}
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M6 7h12l-1.5 12h-9L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden text-sm font-bold sm:inline">{count}</span>
            {count > 0 && (
              <span
                key={count}
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 animate-count-pop place-items-center rounded-full bg-cam-600 px-1 text-[10px] font-bold text-white sm:hidden"
              >
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Mở menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-wood-300/50 bg-white text-ink/75 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-wood-300/30 bg-rice px-3 pb-4 pt-2 lg:hidden">
          <nav className="grid grid-cols-2 gap-1.5" aria-label="Điều hướng di động">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold',
                    isActive ? 'bg-forest-50 text-forest-800' : 'text-ink/75 hover:bg-forest-50',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-cam-700 hover:bg-honey-100"
            >
              Trang quản trị
            </NavLink>
          </nav>
          <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[11px] text-ink/55">
            Hotline ban tổ chức: <strong>{settings.hotline}</strong>
          </p>
        </div>
      )}
    </header>
  );
}
