import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/format';

interface ProductImageProps {
  src?: string;
  alt: string;
  categoryId: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/** Bảng màu minh họa theo nhóm sản phẩm */
const PALETTE: Record<string, { sky: string; hill: string; accent: string; soft: string }> = {
  'trai-cay': { sky: '#FDF0D2', hill: '#D9E9C5', accent: '#E8A020', soft: '#F7DCA4' },
  'rau-cu': { sky: '#EDF6E2', hill: '#CBE4B4', accent: '#6E9C3E', soft: '#BFDBA3' },
  'gao-kho': { sky: '#F6EBDC', hill: '#E5D3B8', accent: '#8A6440', soft: '#D8C3A3' },
  'tuoi-song': { sky: '#F8E6DE', hill: '#E7CDBF', accent: '#A3463B', soft: '#DEB6A8' },
  'tra-mat-ong': { sky: '#E9F1E9', hill: '#CFE0D0', accent: '#1F5B3D', soft: '#B9D2BC' },
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductImage({
  src,
  alt,
  categoryId,
  seed = '',
  className,
  imgClassName,
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const uid = useId().replace(/:/g, '');
  const palette = PALETTE[categoryId] || PALETTE['trai-cay'];
  const variant = hash(seed + categoryId) % 3;
  const showPhoto = Boolean(src && !failed);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={cn('relative overflow-hidden bg-forest-50', className)}
      role={showPhoto ? undefined : 'img'}
      aria-label={showPhoto ? undefined : alt}
      title={showPhoto ? undefined : `${alt} (ảnh minh họa – ban tổ chức có thể thay bằng ảnh thật trong trang quản trị)`}
    >
      {showPhoto ? (
        <>
          {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn('h-full w-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
          />
        </>
      ) : (
        <Illustration uid={uid} palette={palette} categoryId={categoryId} variant={variant} alt={alt} />
      )}
      {!showPhoto && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-medium tracking-wide text-ink/50">
          Ảnh minh họa
        </span>
      )}
    </div>
  );
}

function Illustration({
  uid,
  palette,
  categoryId,
  variant,
  alt,
}: {
  uid: string;
  palette: { sky: string; hill: string; accent: string; soft: string };
  categoryId: string;
  variant: number;
  alt: string;
}) {
  const { sky, hill, accent, soft } = palette;
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <title>{alt}</title>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="100%" stopColor={sky} />
        </linearGradient>
        <linearGradient id={`fruit-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={soft} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <pattern id={`dots-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill={accent} opacity="0.18" />
        </pattern>
      </defs>

      <rect width="400" height="300" fill={`url(#sky-${uid})`} />
      <rect width="400" height="300" fill={`url(#dots-${uid})`} />
      <circle cx={variant === 1 ? 88 : 318} cy="64" r="46" fill={`url(#glow-${uid})`} />
      <circle cx={variant === 1 ? 88 : 318} cy="64" r="27" fill={soft} opacity="0.75" />

      {/* Núi và ruộng bậc thang */}
      <path d="M0 196c60-34 103-12 148 4 57 20 92-18 146-22 44-3 76 12 106 22v100H0Z" fill={hill} opacity="0.55" />
      <path d="M0 232c56-26 101-8 154 8 49 15 96-10 142-12 39-2 74 10 104 18v54H0Z" fill={hill} opacity="0.8" />
      <g opacity="0.28" stroke={accent} fill="none" strokeWidth="1.4">
        <path d="M0 262c70-20 120-6 176 4s112-10 158-8 66 8 66 8" />
        <path d="M0 278c70-20 120-6 176 4s112-10 158-8 66 8 66 8" />
      </g>

      {categoryId === 'trai-cay' && (
        <g>
          <path d="M-10 214c46-34 83-48 128-56" stroke="#6B4A2F" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M62 186c-12-20-8-36 4-46M104 172c8-22 24-32 40-34M140 162c2-18 12-28 26-32" stroke="#6B4A2F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="58" cy="156" rx="17" ry="8" fill="#4F9266" transform="rotate(-28 58 156)" />
          <ellipse cx="96" cy="140" rx="18" ry="8" fill="#2F7550" transform="rotate(-18 96 140)" />
          <ellipse cx="150" cy="128" rx="16" ry="7" fill="#4F9266" transform="rotate(-36 150 128)" />
          <g>
            <circle cx="86" cy="196" r="31" fill={`url(#fruit-${uid})`} />
            <circle cx="132" cy="178" r="25" fill={`url(#fruit-${uid})`} />
            <circle cx="60" cy="224" r="22" fill={`url(#fruit-${uid})`} />
            <circle cx="77" cy="187" r="7" fill="#FFFDF8" opacity="0.5" />
            <circle cx="125" cy="170" r="5" fill="#FFFDF8" opacity="0.5" />
          </g>
          <g transform="translate(252 168)">
            <circle cx="40" cy="40" r="36" fill="#FDF0D2" stroke={accent} strokeWidth="3" />
            <circle cx="40" cy="40" r="28" fill={accent} opacity="0.9" />
            <g stroke="#FFFDF8" strokeWidth="2.4" opacity="0.85">
              <path d="M40 14v52M14 40h52M21 21l38 38M59 21 21 59" />
            </g>
          </g>
        </g>
      )}

      {categoryId === 'rau-cu' && (
        <g>
          {[70, 96, 122].map((x, i) => (
            <g key={x} opacity={0.9 - i * 0.15}>
              <path d={`M${x} 250V${126 + i * 10}`} stroke="#6E9C3E" strokeWidth="7" strokeLinecap="round" />
              <path d={`M${x - 6} ${180 + i * 8}h12M${x - 6} ${205 + i * 8}h12M${x - 6} ${230 + i * 8}h12`} stroke="#4F9266" strokeWidth="2.5" />
            </g>
          ))}
          <ellipse cx="220" cy="226" rx="62" ry="18" fill="#8A6440" opacity="0.35" />
          <path d="M168 224c4-30 22-44 48-46 30-2 52 16 58 46Z" fill="#C9A77C" />
          <path d="M180 214c8-20 22-30 40-30s32 10 42 30" stroke="#8A6440" strokeWidth="2.5" fill="none" />
          <g transform="translate(196 168)">
            <path d="M10 34c-16-14-12-36 4-46 6 20 20 28 20 40 0 12-12 18-24 6Z" fill="#4F9266" />
            <path d="M30 22c20-8 38 0 42 14-16 10-34 8-42-14Z" fill="#6E9C3E" />
            <path d="M28 60c8-16 24-22 40-18-4 20-20 30-40 18Z" fill="#8FBF5A" opacity="0.9" />
          </g>
          <circle cx="304" cy="196" r="18" fill="#D2601A" opacity="0.75" />
          <path d="M300 180c2-10 10-16 18-18" stroke="#4F9266" strokeWidth="3" fill="none" />
        </g>
      )}

      {categoryId === 'gao-kho' && (
        <g>
          <path d="M64 268c-6-50 8-88 40-112" stroke="#8A6440" strokeWidth="4" fill="none" strokeLinecap="round" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 1.5 - 0.2;
            const x = 104 + Math.cos(a) * 40;
            const y = 168 + Math.sin(a) * 58;
            return <ellipse key={i} cx={x} cy={y} rx="5" ry="12" fill={accent} opacity="0.75" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />;
          })}
          <g transform="translate(222 158)">
            <path d="M0 24h96l-10 80H10Z" fill="#F6EBDC" stroke="#C9A77C" strokeWidth="2" />
            <path d="M8 46h80M12 66h72" stroke="#C9A77C" strokeWidth="1.5" opacity="0.7" />
            <path d="M20 24c0-18 12-28 28-28s28 10 28 28" fill="none" stroke="#8A6440" strokeWidth="3" />
            <ellipse cx="48" cy="78" rx="22" ry="9" fill={accent} opacity="0.55" />
            <ellipse cx="48" cy="58" rx="18" ry="7" fill={accent} opacity="0.45" />
          </g>
        </g>
      )}

      {categoryId === 'tuoi-song' && (
        <g>
          <rect x="48" y="216" width="300" height="18" rx="9" fill="#8A6440" opacity="0.35" />
          <g transform="translate(72 170)">
            <path d="M0 22h130c0 34-22 54-65 54S0 56 0 22Z" fill="#C9A77C" stroke="#8A6440" strokeWidth="2" />
            <ellipse cx="65" cy="22" rx="65" ry="12" fill="#E5D3B8" />
            <path d="M34 12c8-8 18-8 26 0M70 10c8-8 18-8 26 0" stroke="#8A6440" strokeWidth="2" fill="none" opacity="0.6" />
            <circle cx="42" cy="44" r="8" fill="#A3463B" opacity="0.8" />
            <circle cx="78" cy="52" r="7" fill="#D2601A" opacity="0.8" />
            <path d="M96 40c6-10 18-10 24 0" stroke="#4F9266" strokeWidth="3" fill="none" />
          </g>
          <g transform="translate(232 186)">
            <path d="M0 30c18-22 56-22 74 0-14 18-52 22-74 0Z" fill="#5A6C8E" opacity="0.8" />
            <path d="M70 30l16-14v28Z" fill="#36496B" />
            <circle cx="16" cy="30" r="3" fill="#FFFDF8" />
            <path d="M34 8c2-8 10-10 14-6 4-6 14-4 14 4" stroke="#FFFDF8" strokeWidth="2" fill="none" opacity="0.7" />
          </g>
          <g opacity="0.55" stroke="#8A6440" strokeWidth="2">
            <path d="M150 128c-8 10-8 20 0 30M168 118c-10 14-10 28 0 42" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}

      {categoryId === 'tra-mat-ong' && (
        <g>
          <path d="M40 246h320" stroke="#8A6440" strokeWidth="2" opacity="0.3" />
          <g transform="translate(74 176)">
            <ellipse cx="70" cy="66" rx="76" ry="14" fill="#6B4A2F" opacity="0.2" />
            <path d="M14 20h112l-12 42c-4 14-20 20-44 20s-40-6-44-20Z" fill="#F6EBDC" stroke="#8A6440" strokeWidth="2.5" />
            <path d="M14 20h112l-4 14H18Z" fill="#C9A77C" opacity="0.7" />
            <path d="M70 28c-10 20-6 38 8 46" stroke="#8A6440" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M34 2c-6-10 4-16 0-26M70 -2c-8-12 4-18 0-30M104 2c-6-10 4-16 0-26" stroke="#8FBF5A" strokeWidth="2.4" fill="none" opacity="0.55" strokeLinecap="round" />
          </g>
          <g transform="translate(244 150)">
            <rect x="0" y="20" width="82" height="98" rx="14" fill="#E8A020" opacity="0.9" />
            <rect x="12" y="8" width="58" height="18" rx="8" fill="#6B4A2F" />
            <path d="M20 54h42M20 72h42M20 90h42" stroke="#FFFDF8" strokeWidth="2" opacity="0.55" />
            <path d="M41 20v-14" stroke="#6B4A2F" strokeWidth="6" strokeLinecap="round" />
            <path d="M53 6c14-2 20 8 12 16-6-2-10-8-12-16Z" fill="#4F9266" />
          </g>
          <ellipse cx="306" cy="128" rx="12" ry="20" fill="#4F9266" opacity="0.8" transform="rotate(-28 306 128)" />
          <ellipse cx="334" cy="158" rx="10" ry="17" fill="#6E9C3E" opacity="0.75" transform="rotate(24 334 158)" />
        </g>
      )}
    </svg>
  );
}
