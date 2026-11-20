import { useState } from 'react';
import type { ScienceCard as ScienceCardType } from '@/data/science';
import { cn } from '@/lib/format';

const ICON: Record<string, string> = {
  lactic: '🫙',
  dry: '☀️',
  cold: '❄️',
  gap: '🌿',
  starch: '🌾',
  tea: '🍃',
  honey: '🍯',
  omega: '🐟',
  noodle: '🍜',
  rice: '🍚',
  storage: '🧺',
};

/** Thẻ lật 3D 180°: mặt trước câu chuyện, mặt sau cơ chế + nhiệt độ */
export function ScienceCard({ card }: { card: ScienceCardType }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={cn('flip-scene h-[330px] w-full', flipped && 'is-flipped')}>
      <div className="flip-inner">
        {/* Mặt trước */}
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="flip-face flex w-full flex-col justify-between border border-wood-300/40 bg-rice p-5 text-left shadow-card"
          aria-label={`Lật thẻ để xem cơ chế khoa học: ${card.title}`}
          aria-expanded={flipped}
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl2 bg-gradient-to-br from-shoot-100 to-forest-100 text-2xl" aria-hidden="true">
                {ICON[card.icon] || '🌱'}
              </span>
              <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest-700">
                S – Science
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-cam-600">{card.kicker}</p>
            <h3 className="mt-1 text-lg leading-snug">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{card.summary}</p>
          </div>
          <div className="flex items-center justify-between border-t border-wood-300/30 pt-3 text-xs">
            <span className="font-semibold text-forest-700">Chạm để xem cơ chế</span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-forest-200 bg-forest-50 text-forest-700" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
              </svg>
            </span>
          </div>
        </button>

        {/* Mặt sau */}
        <div className="flip-face flip-back flex w-full flex-col justify-between border border-forest-700 bg-forest-800 p-5 text-cream shadow-float">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-honey-200">Cơ chế sinh – hóa</p>
            <h3 className="mt-1 font-display text-lg leading-snug text-white">{card.title}</h3>
            <ol className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-cream/80">
              {card.mechanism.map((m, i) => (
                <li key={m} className="flex gap-2">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-honey-500 text-[9px] font-bold text-wood-900">
                    {i + 1}
                  </span>
                  {m}
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-lg border border-white/15 bg-white/10 px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-honey-200">Nhiệt độ bảo quản</p>
              <p className="mt-0.5 text-[12px] font-semibold text-white">{card.temperature}</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 border-t border-white/15 pt-2.5">
            <p className="text-[11px] leading-snug text-cream/70">{card.tip}</p>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="shrink-0 rounded-lg border border-white/25 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
            >
              Lật lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
