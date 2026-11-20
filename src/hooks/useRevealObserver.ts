import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Gắn class "is-visible" cho mọi phần tử có [data-reveal] khi cuộn tới.
 * CSS sẽ lo phần chuyển động (chỉ transform + opacity).
 */
export function useRevealObserver(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [reduced]);
}
