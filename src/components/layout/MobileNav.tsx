import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/format';
import { useCart } from '@/context/CartContext';

const ITEMS = [
  {
    to: '/',
    label: 'Trang chủ',
    icon: (
      <path d="m4 11 8-7 8 7v9H4v-9Z" />
    ),
  },
  {
    to: '/cua-hang',
    label: 'Cửa hàng',
    icon: <path d="M4 8h16l-1.5 12h-13L4 8Zm5-1a3 3 0 0 1 6 0" />,
  },
  {
    to: '/dat-hang',
    label: 'Giỏ',
    icon: (
      <>
        <path d="M6 7h12l-1.5 12h-9L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </>
    ),
  },
  {
    to: '/tra-cuu',
    label: 'Tra cứu',
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
  },
  {
    to: '/vi-tri',
    label: 'Vị trí',
    icon: (
      <>
        <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
  },
];

/** Thanh điều hướng dưới cho điện thoại – luôn trong tầm ngón tay */
export function MobileNav() {
  const { count } = useCart();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-wood-300/50 bg-rice/95 backdrop-blur-md lg:hidden"
      aria-label="Điều hướng nhanh"
    >
      <div className="safe-bottom grid grid-cols-5">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition',
                isActive ? 'text-forest-800' : 'text-ink/50 hover:text-forest-700',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('grid h-6 w-9 place-items-center rounded-full', isActive && 'bg-forest-50')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                {item.label}
                {item.to === '/dat-hang' && count > 0 && (
                  <span className="absolute right-[22%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-cam-600 px-1 text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
