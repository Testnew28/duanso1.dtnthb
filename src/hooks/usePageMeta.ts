import { useEffect } from 'react';

/** Cập nhật title + description khi chuyển trang (SEO cơ bản cho SPA) */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
