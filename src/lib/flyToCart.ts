// Hiệu ứng ảnh tròn bay theo đường parabol vào giỏ hàng.
// Chỉ animate transform/opacity; tự tắt khi người dùng bật "giảm chuyển động".

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function flyToCart(sourceEl: HTMLElement | null, imageUrl?: string): void {
  if (prefersReducedMotion() || !sourceEl) return;
  const target = document.getElementById('cart-target');
  if (!target) return;

  const s = sourceEl.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const size = 46;
  const startX = s.left + s.width / 2 - size / 2;
  const startY = s.top + s.height / 2 - size / 2;
  const endX = t.left + t.width / 2 - size / 2;
  const endY = t.top + t.height / 2 - size / 2;

  const clone = document.createElement('div');
  clone.className = 'fly-clone';
  clone.style.left = `${startX}px`;
  clone.style.top = `${startY}px`;
  clone.style.width = `${size}px`;
  clone.style.height = `${size}px`;
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    clone.appendChild(img);
  } else {
    // Ảnh minh họa SVG: chụp nhanh vùng ảnh thành ảnh nhỏ
    clone.style.background = 'linear-gradient(135deg, #E8A020, #D2601A)';
    clone.textContent = '🛒';
    clone.style.display = 'grid';
    clone.style.placeItems = 'center';
    clone.style.fontSize = '20px';
  }
  document.body.appendChild(clone);

  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - Math.min(140, Math.abs(endY - startY) * 0.5 + 70);
  const steps = 16;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = (1 - p) * (1 - p) * startX + 2 * (1 - p) * p * ctrlX + p * p * endX;
    const y = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * ctrlY + p * p * endY;
    frames.push({
      transform: `translate3d(${x - startX}px, ${y - startY}px, 0) scale(${1 - p * 0.45})`,
      opacity: p > 0.9 ? 0.2 : 1,
      offset: p,
    });
  }

  const anim = clone.animate(frames, { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
  anim.onfinish = () => {
    clone.remove();
    window.dispatchEvent(new CustomEvent('hsxm:cart-arrive'));
  };
  // Dọn dẹp nếu tab bị ẩn / animation bị hủy
  setTimeout(() => clone.remove(), 1200);
}

/** Nhấp nháy viền xanh ngọc 2 nhịp cho thẻ sản phẩm vừa tạo */
export function pulseNewProduct(el: HTMLElement | null): void {
  if (!el) return;
  el.classList.remove('new-product-pulse');
  // Buộc trình duyệt tính lại style để animation chạy lại
  void el.offsetWidth;
  el.classList.add('new-product-pulse');
  setTimeout(() => el.classList.remove('new-product-pulse'), 2000);
}
