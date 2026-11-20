import type { Product } from '@/types';
import { removeDiacritics } from './format';
import { categoryName } from '@/data/categories';

/**
 * Tìm kiếm không dấu: gõ "cam" ra "Cam", "mang" ra "Măng", "hoa binh" ra "Hòa Bình".
 * Chuỗi tìm kiếm được tách thành nhiều từ, sản phẩm phải khớp TẤT CẢ các từ.
 */
export function normalizeQuery(q: string): string[] {
  return removeDiacritics(q)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function productHaystack(p: Product): string {
  return removeDiacritics(
    [
      p.name,
      p.district,
      p.commune,
      p.ethnicities.join(' '),
      p.unit,
      p.nutrition,
      p.description,
      categoryName(p.categoryId),
      p.certs.join(' '),
    ].join(' '),
  ).toLowerCase();
}

export function matchesQuery(p: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const hay = productHaystack(p);
  return terms.every((t) => hay.includes(t));
}

/** Tách từ khóa người dùng gõ, có thể dùng cho gợi ý */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = normalizeQuery(query);
  return products.filter((p) => matchesQuery(p, terms));
}
