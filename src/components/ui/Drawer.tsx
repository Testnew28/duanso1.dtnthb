import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}

/** Ngăn kéo bên phải (chi tiết sản phẩm, giỏ hàng). Trên điện thoại chiếm toàn màn hình. */
export function Drawer({ open, onClose, title, children, footer, widthClass = 'sm:max-w-lg' }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActive.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();
    }, 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      lastActive.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[65] flex justify-end">
      <button
        type="button"
        aria-label="Đóng"
        className="modal-backdrop absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`drawer-panel relative z-10 flex h-full w-full flex-col bg-rice shadow-float ${widthClass}`}
      >
        <div className="flex items-center justify-between border-b border-wood-300/40 bg-gradient-to-r from-cream to-forest-50 px-4 py-3">
          <h2 className="font-display text-lg text-forest-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-wood-300/50 bg-white/80 text-ink/70 transition hover:bg-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-wood-300/40 bg-cream/70 p-4 safe-bottom">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
