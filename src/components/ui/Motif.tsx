import { useId } from 'react';
import { cn } from '@/lib/format';

/** Dải hoa văn thổ cẩm (quả trám + mặt trời) dùng làm đường phân khu */
export function MotifDivider({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={cn('relative my-10 h-5 w-full text-wood-500', className)} aria-hidden="true">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 240 20">
        <defs>
          <pattern id={`hoa-van-${id}`} width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 2 28 10 20 18 12 10Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.65" />
            <path d="M20 6 24 10 20 14 16 10Z" fill="currentColor" opacity="0.35" />
            <circle cx="0" cy="10" r="2" fill="currentColor" opacity="0.5" />
            <circle cx="40" cy="10" r="2" fill="currentColor" opacity="0.5" />
            <path d="M2 4h4M2 16h4M34 4h4M34 16h4" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="240" height="20" fill={`url(#hoa-van-${id})`} />
      </svg>
    </div>
  );
}

/** Hình chìm trống đồng + nhà sàn, độ mờ 5–7% */
export function Watermark({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute select-none text-forest-900 opacity-[0.06]', className)}
      aria-hidden="true"
    >
      <svg width="360" height="360" viewBox="0 0 360 360" fill="none">
        <circle cx="180" cy="180" r="170" stroke="currentColor" strokeWidth="2" />
        <circle cx="180" cy="180" r="140" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="180" cy="180" r="96" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="180" cy="180" r="52" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="180" cy="180" r="16" stroke="currentColor" strokeWidth="2" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <g key={i} transform={`rotate(${(i * 360) / 16} 180 180)`}>
              <path d="M180 44c8 10 8 20 0 28-8-8-8-18 0-28Z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="180" cy="72" r="3" fill="currentColor" />
            </g>
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x = 180 + Math.cos(a) * 120;
          const y = 180 + Math.sin(a) * 120;
          return <circle key={i} cx={x} cy={y} r="5" stroke="currentColor" strokeWidth="1.5" />;
        })}
      </svg>
    </div>
  );
}

/** Họa tiết nhà sàn đơn giản cho góc trang */
export function StiltHouseMark({ className }: { className?: string }) {
  return (
    <svg className={cn('text-wood-500', className)} viewBox="0 0 120 80" fill="none" aria-hidden="true">
      <path d="M10 34 60 8l50 26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 34h80v22H20z" stroke="currentColor" strokeWidth="2" />
      <path d="M28 56v16M48 56v16M72 56v16M92 56v16" stroke="currentColor" strokeWidth="2" />
      <path d="M44 34v22M60 34v22M76 34v22" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M4 74h112" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 8v-6M55 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Bộ 4 icon STEM nét mảnh xanh – cam */
export function StemIcon({ type, className }: { type: 'science' | 'technology' | 'engineering' | 'math'; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 48 48" className={cn('h-11 w-11 text-forest-700', className)} aria-hidden="true">
      {type === 'science' && (
        <>
          <path d="M19 8h10M22 8v8L13 33a4 4 0 0 0 3.6 5.8h14.8A4 4 0 0 0 35 33l-9-17V8" {...common} />
          <path d="M17 29h14" {...common} stroke="#D2601A" />
          <path d="M33 12c4 1 6 4 6 8-4 0-7-2-8-6 1-1 1-2 2-2Z" fill="#8FBF5A" stroke="none" />
          <path d="M31 20c-1 2-3 3-5 3" {...common} stroke="#6E9C3E" />
        </>
      )}
      {type === 'technology' && (
        <>
          <path d="M24 7c-5 0-9 4-9 9 0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9Z" {...common} />
          <circle cx="24" cy="16" r="3.4" {...common} stroke="#D2601A" />
          <path d="M8 36h8v8H8zM8 40h8M12 36v8" {...common} />
          <path d="M32 36h8v8h-8z" {...common} />
          <path d="M36 36v8M32 40h8" {...common} stroke="#D2601A" />
        </>
      )}
      {type === 'engineering' && (
        <>
          <path d="M8 18h4l4 17h18l4-13H15" {...common} />
          <circle cx="19" cy="40" r="2.4" {...common} />
          <circle cx="33" cy="40" r="2.4" {...common} />
          <path d="M34 8v5l4 2 4-3 3 4-3 3 1 5-4 2-3-3-4 2v-5" {...common} stroke="#D2601A" />
        </>
      )}
      {type === 'math' && (
        <>
          <path d="M8 10h26v28H8z" {...common} />
          <path d="M8 18h26M8 26h26M8 33h26M16 10v28M24 10v28" {...common} opacity="0.55" />
          <path d="M28 38V28M33 38V22M38 38V16" {...common} stroke="#D2601A" strokeWidth="2.4" />
          <path d="M26 42h14" {...common} stroke="#D2601A" />
        </>
      )}
    </svg>
  );
}

/** Tem khoa học: chiếc lá + dấu tích */
export function LeafCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('h-3.5 w-3.5', className)} fill="none" aria-hidden="true">
      <path d="M13.5 2.5C8 2.2 3.4 5 3.2 10c0 1.4.5 2.5 1 3.2 2.5-4.5 5.7-6.3 8-7.1-2 1.4-4.7 3.4-6.3 7.4 4.3.6 7.1-3.3 7.6-11Z" fill="currentColor" />
      <path d="m9.7 8.6 1.1 1.1 2-2.3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
