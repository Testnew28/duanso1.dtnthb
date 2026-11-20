import { useRef } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'forest' | 'outline' | 'ghost' | 'danger' | 'light';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  // Nút hành động chính: vàng cam mật ong, chữ nâu đậm đủ tương phản
  primary:
    'bg-honey-500 text-wood-900 hover:bg-honey-400 active:bg-honey-600 border border-honey-600/50 shadow-sm',
  forest: 'bg-forest-600 text-white hover:bg-forest-700 active:bg-forest-800 border border-forest-800/40',
  outline: 'bg-rice text-forest-800 border border-forest-300 hover:border-forest-500 hover:bg-forest-50',
  ghost: 'bg-transparent text-forest-800 hover:bg-forest-50 border border-transparent',
  danger: 'bg-thocam-600 text-white hover:bg-thocam-700 border border-thocam-700/50',
  light: 'bg-white/90 text-forest-900 hover:bg-white border border-white/60',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-[40px] px-3 text-sm gap-1.5 rounded-lg',
  md: 'min-h-[44px] px-4 text-[15px] gap-2 rounded-xl',
  lg: 'min-h-[50px] px-6 text-base gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  onClick,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - rect.left - size / 2}px`;
      dot.style.top = `${e.clientY - rect.top - size / 2}px`;
      dot.style.color = variant === 'primary' ? 'rgba(31,42,28,0.35)' : 'rgba(255,255,255,0.55)';
      el.appendChild(dot);
      window.setTimeout(() => dot.remove(), 600);
    }
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'ripple-host inline-flex select-none items-center justify-center font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
