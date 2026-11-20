// Sinh ảnh VietQR theo số tiền + nội dung đơn hàng.
// Không cần API key, ảnh do vietqr.io trả về từ thông tin ngân hàng công khai.

export interface VietQRInput {
  bankBin: string;
  accountNo: string;
  accountName?: string;
  amount: number;
  addInfo: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export function isBankConfigured(bankBin: string, accountNo: string): boolean {
  const no = (accountNo || '').replace(/\s/g, '');
  return Boolean(bankBin) && no.length >= 6 && !/^0+$/.test(no);
}

export function buildVietQRUrl(input: VietQRInput): string {
  const { bankBin, accountNo, accountName = '', amount, addInfo, template = 'compact2' } = input;
  const params = new URLSearchParams();
  if (amount > 0) params.set('amount', String(Math.round(amount)));
  params.set('addInfo', addInfo);
  if (accountName) params.set('accountName', accountName);
  return `https://img.vietqr.io/image/${encodeURIComponent(bankBin)}-${encodeURIComponent(
    accountNo,
  )}-${template}.png?${params.toString()}`;
}

/** QR dẫn tới website (dùng thư viện ảnh QR công khai, không cần key) */
export function buildSiteQrUrl(siteUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    siteUrl,
  )}`;
}
