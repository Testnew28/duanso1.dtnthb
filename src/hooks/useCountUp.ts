import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Đếm số từ 0 → giá trị thật trong ~1,2 giây khi khối được nhìn thấy.
 * Tôn trọng prefers-reduced-motion: hiển thị ngay giá trị cuối.
 */
export function useCountUp(target: number, duration = 1200, start = true) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      // easeOutCubic cho cảm giác tự nhiên
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, start, reduced]);

  return value;
}
