import { LeafCheck } from '@/components/ui/Motif';
import { cn } from '@/lib/format';

/** Tem chứng nhận khoa học: lá xanh + dấu tích */
export function ScienceBadges({ certs, max = 2, className }: { certs: string[]; max?: number; className?: string }) {
  if (!certs.length) return null;
  const shown = certs.slice(0, max);
  const rest = certs.length - shown.length;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {shown.map((c) => (
        <li
          key={c}
          className="inline-flex items-center gap-1 rounded-md border border-shoot-200 bg-shoot-100/80 px-1.5 py-1 text-[10px] font-semibold leading-none text-forest-800"
        >
          <LeafCheck />
          {c}
        </li>
      ))}
      {rest > 0 && (
        <li className="inline-flex items-center rounded-md border border-wood-300/40 bg-white/70 px-1.5 py-1 text-[10px] font-semibold text-ink/55">
          +{rest}
        </li>
      )}
    </ul>
  );
}
