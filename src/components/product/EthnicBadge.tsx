import { Badge } from '@/components/ui/Badge';
import { ETHNIC_TONE } from '@/data/districts';
import { cn } from '@/lib/format';

const toneMap: Record<string, 'wood' | 'cham' | 'shoot' | 'honey' | 'thocam' | 'forest'> = {
  Mường: 'wood',
  Kinh: 'cham',
  Thái: 'shoot',
  Tày: 'honey',
  Dao: 'thocam',
  Mông: 'forest',
};

export function EthnicBadge({
  ethnicities,
  limit = 1,
  className,
}: {
  ethnicities: string[];
  limit?: number;
  className?: string;
}) {
  if (!ethnicities.length) return null;
  const shown = ethnicities.slice(0, limit);
  const rest = ethnicities.length - shown.length;
  return (
    <span className={cn('inline-flex flex-wrap gap-1', className)}>
      {shown.map((e) => (
        <Badge key={e} tone={toneMap[e] || 'neutral'} className="shadow-sm">
          Người {e}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge tone="neutral" className="shadow-sm">
          +{rest}
        </Badge>
      )}
    </span>
  );
}

export function ethnicBadgeClass(ethnicity: string): string {
  return ETHNIC_TONE[ethnicity] || ETHNIC_TONE.Mường;
}
