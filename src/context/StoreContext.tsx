import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { BackendMode, Product, Settings } from '@/types';
import { CATEGORIES, type Category } from '@/data/categories';
import {
  backendMode,
  fetchProducts,
  fetchSettings,
  saveSettings,
} from '@/lib/repo';
import { defaultSettings } from '@/lib/localStore';

interface StoreValue {
  mode: BackendMode;
  products: Product[];
  settings: Settings;
  loading: boolean;
  error: string;
  categories: Category[];
  reload: () => Promise<void>;
  addProductLocal: (p: Product) => void;
  replaceProductLocal: (p: Product) => void;
  removeProductLocal: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(() => defaultSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, cfg] = await Promise.all([fetchProducts(), fetchSettings()]);
      setProducts(list);
      setSettings(cfg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addProductLocal = useCallback((p: Product) => {
    setProducts((prev) => [...prev, p]);
  }, []);

  const replaceProductLocal = useCallback((p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }, []);

  const removeProductLocal = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = await saveSettings(patch);
    setSettings(next);
  }, []);

  const categories = useMemo<Category[]>(() => {
    const custom = new Map<string, Category>();
    products.forEach((p) => {
      if (p.categoryName && !CATEGORIES.some((c) => c.id === p.categoryId)) {
        if (!custom.has(p.categoryId)) {
          custom.set(p.categoryId, {
            id: p.categoryId,
            name: p.categoryName,
            shortName: p.categoryName,
            description: 'Nhóm do gian hàng lớp/HTX hoặc khách yêu cầu tạo.',
            tone: 'wood',
          });
        }
      }
    });
    return [...CATEGORIES, ...custom.values()];
  }, [products]);

  const value = useMemo<StoreValue>(
    () => ({
      mode: backendMode,
      products,
      settings,
      loading,
      error,
      categories,
      reload,
      addProductLocal,
      replaceProductLocal,
      removeProductLocal,
      updateSettings,
    }),
    [
      products,
      settings,
      loading,
      error,
      categories,
      reload,
      addProductLocal,
      replaceProductLocal,
      removeProductLocal,
      updateSettings,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore phải nằm trong StoreProvider');
  return ctx;
}
