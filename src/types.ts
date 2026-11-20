// ============================================================
// KIỂU DỮ LIỆU DÙNG CHUNG TOÀN WEBSITE
// ============================================================

/** Trạng thái sản phẩm trên gian hàng */
export type ProductStatus =
  | 'active' // đang bán bình thường
  | 'out_of_stock' // tạm hết hàng
  | 'pending_supply' // sản phẩm khách yêu cầu, chờ xác nhận nguồn cung HTX (vẫn cho đặt trước)
  | 'pending_approval' // gian hàng lớp/HTX gửi lên, chờ admin duyệt
  | 'hidden'; // bị ẩn khỏi cửa hàng

/** Nguồn gốc bản ghi sản phẩm */
export type ProductSource = 'default' | 'customer' | 'vendor';

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Đang bán',
  out_of_stock: 'Hết hàng',
  pending_supply: 'Chờ xác nhận nguồn cung HTX',
  pending_approval: 'Chờ duyệt',
  hidden: 'Đã ẩn',
};

export const PRODUCT_SOURCE_LABEL: Record<ProductSource, string> = {
  default: 'Danh mục gốc',
  customer: 'Khách yêu cầu',
  vendor: 'Lớp / HTX đăng',
};

export interface RequesterInfo {
  name: string;
  phone: string;
  note?: string;
  at: string;
  inviteCode?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  /** Tên nhóm tự tạo (nếu có), ngược lại lấy từ danh mục chuẩn */
  categoryName?: string;
  /** Huyện / thành phố thuộc Hòa Bình */
  district: string;
  /** Xã / phường nếu xác định được, ngược lại để trống */
  commune: string;
  ethnicities: string[];
  /** Mô tả ảnh (alt) – tiếng Việt */
  imageAlt: string;
  /** Ảnh thật do admin tải lên; rỗng = dùng ảnh minh họa SVG */
  imageUrl: string;
  /** Mô tả hình ảnh / câu chuyện sản phẩm */
  description: string;
  /** Giá trị dinh dưỡng nổi bật (S – Science) */
  nutrition: string;
  /** Tiêu chuẩn / quy trình an toàn thực phẩm (S) */
  safety: string;
  /** Hướng dẫn bảo quản */
  storage: string;
  /** Quy cách / đơn vị bán */
  unit: string;
  marketMin: number;
  marketMax: number;
  importPrice: number;
  price: number;
  /** Số lượng dự kiến nhập về */
  stock: number;
  /** Số đã bán / đã giữ chỗ (không cho đặt vượt) */
  sold: number;
  status: ProductStatus;
  source: ProductSource;
  featured: boolean;
  /** Tem khoa học: VietGAP, Lên men tự nhiên… */
  certs: string[];
  requester?: RequesterInfo;
  createdAt: string;
}

/** Dữ liệu biểu mẫu tạo sản phẩm mới */
export interface ProductDraft {
  mode: 'customer' | 'vendor';
  name: string;
  categoryId: string;
  newCategoryName?: string;
  district: string;
  commune: string;
  ethnicities: string[];
  imageUrl: string;
  imageAlt: string;
  description: string;
  nutrition: string;
  safety: string;
  storage: string;
  unit: string;
  marketMin: number;
  marketMax: number;
  importPrice: number;
  price: number;
  stock: number;
  certs: string[];
  requesterName: string;
  requesterPhone: string;
  requesterNote: string;
  inviteCode: string;
  commitment: boolean;
}

export type OrderStatus = 'new' | 'confirmed' | 'paid' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Mới',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thu tiền',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  new: 'bg-honey-100 text-honey-700 border-honey-200',
  confirmed: 'bg-cham-50 text-cham-700 border-cham-100',
  paid: 'bg-shoot-100 text-forest-700 border-shoot-200',
  delivered: 'bg-forest-50 text-forest-700 border-forest-100',
  cancelled: 'bg-thocam-500/10 text-thocam-700 border-thocam-500/20',
};

export type PaymentMethod = 'pickup_cod' | 'transfer';
export type Fulfillment = 'pickup';

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pickup_cod: 'Thanh toán khi nhận hàng (COD tại trường)',
  transfer: 'Chuyển khoản VietQR trước',
};

export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  importPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  classUnit: string;
  note: string;
  fulfillment: Fulfillment;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrderPayload {
  customerName: string;
  phone: string;
  classUnit: string;
  note: string;
  paymentMethod: PaymentMethod;
  items: { productId: string; qty: number }[];
}

export interface Settings {
  id: number;
  /** Chi phí vận chuyển tập kết & đóng gói – admin chỉnh được */
  shippingCost: number;
  pickupHours: string;
  pickupAddress: string;
  hotline: string;
  bankBin: string;
  bankAccountNo: string;
  bankAccountName: string;
  bankName: string;
  vendorInviteCode: string;
  autoApproveVendors: boolean;
  mapEmbedUrl: string;
  siteUrl: string;
  zaloUrl: string;
  facebookUrl: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export type BackendMode = 'supabase' | 'local';

export interface AdminUser {
  email: string;
  name: string;
}
