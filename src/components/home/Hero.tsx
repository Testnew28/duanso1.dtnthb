import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { computeFinance } from '@/lib/finance';
import { formatNumber, formatPercent, formatVND } from '@/lib/format';
import { LeafCheck } from '@/components/ui/Motif';

/** Lá chè / cánh hoa bưởi bay chậm ở hai góc */
function FloatingLeaf({ className, delay = 0, duration = 8, rotate = 0 }: { className: string; delay?: number; duration?: number; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute animate-float ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, rotate: `${rotate}deg` }}
      aria-hidden="true"
    >
      <path d="M20 4c12 6 14 20 4 30C10 38 4 24 8 14c4-8 10-9 12-10Z" fill="#4F9266" opacity="0.75" />
      <path d="M20 6c-2 10-2 18-6 28" stroke="#D7E8DC" strokeWidth="1.4" fill="none" opacity="0.8" />
    </svg>
  );
}

export function Hero() {
  const { products, settings } = useStore();
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setOffset(Math.min(170, window.scrollY * 0.2));
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const summary = useMemo(
    () => computeFinance(products, settings.shippingCost),
    [products, settings.shippingCost],
  );

  const delays = ['0.05s', '0.15s', '0.25s', '0.35s', '0.45s'];

  return (
    <section className="relative overflow-hidden border-b border-wood-300/30 bg-gradient-to-b from-[#FFF9EC] via-cream to-[#F3EAD7]">
      {/* Nền núi – parallax chậm */}
      <div className="absolute inset-0" aria-hidden="true">
        <svg
          className="absolute inset-x-0 bottom-0 h-[78%] w-full text-forest-200"
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
          style={{ transform: `translate3d(0, ${offset * 0.55}px, 0)` }}
        >
          <path d="M0 300c140-95 250-70 360-20s210 40 300 0 200-110 330-70 240 60 450 30v280H0Z" fill="#D7E8DC" opacity="0.65" />
          <path d="M0 380c160-90 280-60 420-10s220 50 340 5 230-90 360-55 210 45 320 40v160H0Z" fill="#B0D2BA" opacity="0.6" />
        </svg>
        <svg
          className="absolute inset-x-0 bottom-0 h-[62%] w-full"
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          style={{ transform: `translate3d(0, ${offset * 0.22}px, 0)` }}
        >
          <path d="M0 230c180-80 300-52 470-12s260 38 400-8 260-70 410-40 160 24 160 24v226H0Z" fill="#8FBF5A" opacity="0.28" />
          <path d="M0 300c190-70 330-30 500 5s280 18 430-22 300-50 510-10v147H0Z" fill="#4F9266" opacity="0.2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M0 ${318 + i * 16}c210-72 380-26 560 6s300 8 460-24 280-32 420-6`}
              stroke="#1F5B3D"
              strokeWidth="1.2"
              fill="none"
              opacity={0.16}
            />
          ))}
        </svg>
        <div className="absolute right-[8%] top-14 h-24 w-24 rounded-full bg-honey-400/40 blur-2xl" />
      </div>

      <FloatingLeaf className="left-[4%] top-24 h-10 w-10 opacity-70" delay={0.5} duration={9} rotate={18} />
      <FloatingLeaf className="right-[6%] top-36 hidden h-8 w-8 opacity-60 sm:block" delay={2.2} duration={11} rotate={-22} />
      <FloatingLeaf className="left-[38%] top-10 h-6 w-6 opacity-50" delay={3.4} duration={10} rotate={40} />
      <FloatingLeaf className="right-[30%] bottom-28 hidden h-9 w-9 opacity-55 md:block" delay={1.2} duration={12} rotate={-8} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20 lg:pt-16">
        <div>
          <p
            className="animate-fade-up inline-flex flex-wrap items-center gap-2 rounded-full border border-forest-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-800 shadow-sm"
            style={{ animationDelay: delays[0] }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cam-500" />
            Hội chợ Dinh dưỡng · Trường PT DTNT THPT Hòa Bình
          </p>

          <h1
            className="animate-fade-up mt-4 font-display text-[2.15rem] leading-[1.08] text-forest-900 sm:text-5xl lg:text-[3.5rem]"
            style={{ animationDelay: delays[1] }}
          >
            Hương sắc núi rừng,
            <br />
            <span className="text-cam-600">đậm đà xứ Mường</span>
          </h1>

          <p
            className="animate-fade-up mt-4 max-w-xl text-[15px] leading-relaxed text-ink/72 sm:text-base"
            style={{ animationDelay: delays[2] }}
          >
            34 sản vật nội địa Hòa Bình – cam Cao Phong, bưởi đỏ Tân Lạc, mật ong rừng Đà Bắc, gạo nếp nương
            Mai Châu… được học sinh khảo sát giá thực tế, kiểm chứng khoa học và đưa lên kệ với giá hội chợ.
          </p>

          <div className="animate-fade-up mt-6 flex flex-wrap gap-2.5" style={{ animationDelay: delays[3] }}>
            <Link
              to="/cua-hang"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-honey-600/50 bg-honey-500 px-5 text-[15px] font-bold text-wood-900 shadow-sm transition hover:bg-honey-400"
            >
              Mua nông sản
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              to="/khao-sat-gia"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-forest-300 bg-white/85 px-5 text-[15px] font-bold text-forest-800 transition hover:border-forest-500 hover:bg-white"
            >
              Xem dự toán giá
            </Link>
          </div>

          <div
            className="animate-fade-up mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/60"
            style={{ animationDelay: delays[4] }}
          >
            <span className="inline-flex items-center gap-1.5">
              <LeafCheck className="h-3.5 w-3.5 text-forest-600" /> Tem khoa học & ATTP
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> 100% nội địa Hòa Bình
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cam-500" /> Nhận tại trường
            </span>
          </div>
        </div>

        {/* Khung minh họa + số liệu tính tự động */}
        <div className="animate-fade-up relative" style={{ animationDelay: '0.2s' }}>
          <div className="relative overflow-hidden rounded-[1.6rem] border border-wood-300/50 bg-rice shadow-float">
            <svg viewBox="0 0 600 440" className="h-auto w-full" role="img" aria-label="Minh họa đồi cam, ruộng bậc thang và nhà sàn Hòa Bình">
              <defs>
                <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFF6E4" />
                  <stop offset="100%" stopColor="#F7E6C4" />
                </linearGradient>
                <linearGradient id="hero-hill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8FBF5A" />
                  <stop offset="100%" stopColor="#2F7550" />
                </linearGradient>
              </defs>
              <rect width="600" height="440" fill="url(#hero-sky)" />
              <circle cx="465" cy="88" r="46" fill="#F0B23C" opacity="0.85" />
              <path d="M0 250c90-70 165-54 250-18s160 28 230-8 120-40 120-40v256H0Z" fill="#B0D2BA" />
              <path d="M0 300c110-60 190-24 280 8s170 20 250-14 70-24 70-24v170H0Z" fill="url(#hero-hill)" opacity="0.85" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M0 ${330 + i * 18}c120-52 220-18 310 8s180 0 290-26`}
                  stroke="#FBF6EA"
                  strokeWidth="1.6"
                  fill="none"
                  opacity="0.35"
                />
              ))}
              {/* Đồi cam */}
              <g>
                <path d="M120 330c-24-42-18-78 6-104" stroke="#6B4A2F" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M126 238c-18-24-16-46 2-60M150 250c14-24 34-30 52-26M108 262c-22-10-38-6-48 4" stroke="#6B4A2F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <ellipse cx="118" cy="192" rx="22" ry="10" fill="#4F9266" transform="rotate(-32 118 192)" />
                <ellipse cx="178" cy="212" rx="24" ry="10" fill="#2F7550" transform="rotate(-16 178 212)" />
                <ellipse cx="82" cy="250" rx="20" ry="9" fill="#4F9266" transform="rotate(20 82 250)" />
                <circle cx="140" cy="286" r="34" fill="#E8A020" />
                <circle cx="188" cy="266" r="26" fill="#F0B23C" />
                <circle cx="100" cy="312" r="24" fill="#D97706" />
                <circle cx="128" cy="276" r="8" fill="#FFF6E4" opacity="0.5" />
                <circle cx="182" cy="258" r="6" fill="#FFF6E4" opacity="0.5" />
              </g>
              {/* Nhà sàn */}
              <g transform="translate(330 208)">
                <path d="M0 52 76 12l76 40" stroke="#6B4A2F" strokeWidth="5" fill="none" strokeLinejoin="round" />
                <path d="M14 52h124v44H14z" fill="#C9A77C" stroke="#6B4A2F" strokeWidth="3" />
                <path d="M26 96v38M56 96v38M96 96v38M126 96v38" stroke="#6B4A2F" strokeWidth="4" />
                <path d="M44 52v44M76 52v44M108 52v44" stroke="#8A6440" strokeWidth="2" opacity="0.6" />
                <rect x="60" y="66" width="32" height="30" fill="#442E1D" opacity="0.5" />
                <path d="M0 136h152" stroke="#6B4A2F" strokeWidth="3" strokeLinecap="round" />
              </g>
              {/* Gùi nông sản */}
              <g transform="translate(438 316)">
                <path d="M0 40c6-32 26-46 50-46s44 14 50 46Z" fill="#8A6440" />
                <path d="M12 36c8-20 22-28 38-28s30 8 38 28" stroke="#C9A77C" strokeWidth="2.5" fill="none" />
                <circle cx="34" cy="6" r="12" fill="#E8A020" />
                <circle cx="58" cy="0" r="10" fill="#D2601A" />
                <path d="M30 -8c2-10 10-14 16-14" stroke="#4F9266" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>
              <path d="M30 402c60-18 120-10 180 2s150 8 240-8 120-6 120-6" stroke="#1F5B3D" strokeWidth="1.4" fill="none" opacity="0.2" />
            </svg>

            <div className="absolute inset-x-3 bottom-3 rounded-xl2 border border-white/60 bg-rice/95 p-3.5 shadow-card backdrop-blur sm:left-4 sm:right-auto sm:w-[290px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/50">
                Dự toán {summary.productCount || 34} mặt hàng
              </p>
              <p className="price-tag mt-0.5 text-xl font-extrabold text-forest-900">
                {summary.revenue > 0 ? formatVND(summary.revenue) : 'Đang tính…'}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-wood-300/40 pt-2 text-[11px]">
                <div>
                  <p className="text-ink/50">Tiết kiệm TB</p>
                  <p className="font-bold text-forest-700">{formatPercent(summary.avgSaving, 1)}</p>
                </div>
                <div>
                  <p className="text-ink/50">Số lượng</p>
                  <p className="font-bold text-ink/80">{formatNumber(summary.plannedQty)} SP</p>
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 rounded-full border border-forest-200 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-forest-800 shadow-sm">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-forest-500" />
              VietGAP · Lên men tự nhiên
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
