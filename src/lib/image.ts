// Nén ảnh phía client trước khi tải lên (giảm dung lượng, tăng tốc trang).
// Ảnh được thu nhỏ tối đa 1200px, xuất JPEG chất lượng 0.82.

const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15MB ảnh gốc tối đa
const MAX_DIMENSION = 1200;

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tệp đã chọn không phải là ảnh.');
  }
  if (file.size > MAX_RAW_BYTES) {
    throw new Error('Ảnh quá lớn (tối đa 15MB). Vui lòng chọn ảnh nhỏ hơn.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    // Nền trắng cho ảnh PNG trong suốt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh. Vui lòng thử ảnh khác.'));
    img.src = src;
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(header)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.floor((base64.length * 3) / 4);
}
