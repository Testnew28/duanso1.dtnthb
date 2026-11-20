import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

export function SectionTitle({
  kicker,
  title,
  description,
  align = 'left',
  action,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      data-reveal
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {kicker && (
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cam-600">
            <span className="inline-block h-px w-6 bg-cam-600/60" aria-hidden="true" />
            {kicker}
          </p>
        )}
        <h2 className="text-2xl leading-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-[15px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
