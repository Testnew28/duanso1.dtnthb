import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartLine, Product } from '@/types';
import { availableStock, isOrderable } from '@/lib/repo';
import { flyToCart } from '@/lib/flyToCart';
import { useToast } from './ToastContext';
import { useStore } from './StoreContext';

const CART_KEY = 'hsxm:cart:v1';

interface CartItem {
  product: Product;
  qty: number;
  lineTotal: number;
}

interface CartValue {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (product: Product, qty?: number, sourceEl?: HTMLElement | null) => void;
  setQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
}

const CartContext = createContext<CartValue | null>(null);

function loadLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.productId === 'string' && Number.isFinite(l.qty))
      .map((l) => ({ productId: l.productId, qty: Math.max(1, Math.floor(l.qty)) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadLines());
  const { products, loading } = useStore();
  const { push } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* bỏ qua */
    }
  }, [lines]);

  // Khi dữ liệu sản phẩm tải xong, loại bỏ dòng không còn hợp lệ
  useEffect(() => {
    if (loading || products.length === 0) return;
    setLines((prev) =>
      prev
        .filter((l) => products.some((p) => p.id === l.productId))
        .map((l) => {
          const p = products.find((x) => x.id === l.productId)!;
          return { ...l, qty: Math.min(l.qty, Math.max(1, availableStock(p))) };
        })
        .filter((l) => l.qty > 0),
    );
  }, [loading, products]);

  const addToCart = useCallback(
    (product: Product, qty = 1, sourceEl?: HTMLElement | null) => {
      if (!isOrderable(product)) {
        push(product.status === 'pending_supply' ? 'Sản phẩm đang chờ xác nhận nguồn cung.' : 'Sản phẩm đã hết hàng.', 'error');
        return;
      }
      const max = availableStock(product);
      const existing = lines.find((l) => l.productId === product.id);
      const current = existing?.qty ?? 0;
      const nextQty = Math.min(max, current + Math.max(1, Math.floor(qty)));
      if (nextQty <= current) {
        push(`Chỉ còn ${max} ${product.unit} trong gian hàng.`, 'info');
        return;
      }
      setLines((prev) =>
        prev.some((l) => l.productId === product.id)
          ? prev.map((l) => (l.productId === product.id ? { ...l, qty: nextQty } : l))
          : [...prev, { productId: product.id, qty: nextQty }],
      );
      flyToCart(sourceEl ?? null, product.imageUrl);
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('hsxm:cart-bump'));
      }, 640);
    },
    [lines, push],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const max = Math.max(1, availableStock(product));
      const next = Math.max(0, Math.min(max, Math.floor(qty)));
      setLines((prev) =>
        next <= 0
          ? prev.filter((l) => l.productId !== productId)
          : prev.map((l) => (l.productId === productId ? { ...l, qty: next } : l)),
      );
      if (qty > max) push(`Chỉ còn ${max} ${product.unit}.`, 'info');
    },
    [products, push],
  );

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const quantityOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.qty ?? 0,
    [lines],
  );

  const items = useMemo<CartItem[]>(
    () =>
      lines
        .map((l) => {
          const product = products.find((p) => p.id === l.productId);
          if (!product) return null;
          return { product, qty: l.qty, lineTotal: product.price * l.qty };
        })
        .filter((x): x is CartItem => Boolean(x)),
    [lines, products],
  );

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  const value = useMemo<CartValue>(
    () => ({ lines, items, count, subtotal, addToCart, setQty, removeLine, clear, quantityOf }),
    [lines, items, count, subtotal, addToCart, setQty, removeLine, clear, quantityOf],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải nằm trong CartProvider');
  return ctx;
}
