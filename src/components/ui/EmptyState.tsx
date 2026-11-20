import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-wood-300/70 bg-rice/70 px-6 py-14 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-forest-50 text-forest-600">
        {icon || (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M6 7h12l-1.5 12h-9L6 7Z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
        )}
      </div>
      <h3 className="font-display text-xl text-forest-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
