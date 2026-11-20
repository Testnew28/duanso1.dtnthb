import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

type Tone = 'forest' | 'honey' | 'wood' | 'thocam' | 'cham' | 'shoot' | 'neutral' | 'teal';

const tones: Record<Tone, string> = {
  forest: 'bg-forest-50 text-forest-800 border-forest-200',
  honey: 'bg-honey-100 text-honey-700 border-honey-200',
  wood: 'bg-wood-100 text-wood-700 border-wood-300/60',
  thocam: 'bg-thocam-500/10 text-thocam-700 border-thocam-500/20',
  cham: 'bg-cham-50 text-cham-700 border-cham-100',
  shoot: 'bg-shoot-100 text-forest-800 border-shoot-200',
  neutral: 'bg-white/85 text-ink/75 border-wood-300/40',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
