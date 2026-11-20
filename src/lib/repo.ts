import type {
  BackendMode,
  NewOrderPayload,
  Order,
  OrderStatus,
  Product,
  ProductDraft,
  Settings,
} from '@/types';
import { DEFAULT_SHIPPING_COST } from './finance';
import { categoryName } from '@/data/categories';
import { DISTRICTS } from '@/data/districts';
import {
  generateOrderCode,
  isValidPhone,
  normalizePhone,
  removeDiacritics,
  slugify,
} from './format';
import {
  clone,
  defaultSettings,
  ensureLocalSeed,
  localOrders,
  localProducts,
  localSettings,
  setLocalOrders,
  setLocalProducts,
  setLocalSettings,
} from './localStore';
import { hasSupabase, supabase } from './supabase';
import { dataUrlToBlob } from './image';

// ============================================================
// LỚP TRUY CẬP DỮ LIỆU
// Tự chọn Supabase (CSDL thật) hoặc localStorage (chạy thử 1 máy).
// Mọi phép tính tiền đều nằm ở server (RPC) hoặc được tính lại ở đây,
// KHÔNG tin số tiền do trình duyệt gửi lên.
// ============================================================

export const backendMode: BackendMode = hasSupabase ? 'supabase' : 'local';

export function productCategoryLabel(p: Product): string {
  return p.categoryName || categoryName(p.categoryId);
}

function fail(message: string): never {
  throw new Error(message);
}

function sbMessage(error: { message?: string; details?: string } | null, fallback: string): never {
  const raw = error?.message || '';
  // Một số lỗi Postgres trả về tiếng Anh; dịch các trường hợp thường gặp
  if (raw.includes('duplicate key')) fail('Dữ liệu đã tồn tại, vui lòng kiểm tra lại.');
  if (raw.includes('row-level security')) fail('Bạn không có quyền thực hiện thao tác này.');
  if (raw.includes('JWT')) fail('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
  fail(raw || fallback);
}

// ---------------------------- MAPPING ----------------------------

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(r: any): Product {
  return {
    id: String(r.id),
    slug: r.slug || '',
    name: r.name || '',
    categoryId: r.category_id || 'khac',
    categoryName: r.category_name || undefined,
    district: r.district || '',
    commune: r.commune || '',
    ethnicities: Array.isArray(r.ethnicities) ? r.ethnicities : [],
    imageAlt: r.image_alt || '',
    imageUrl: r.image_url || '',
    description: r.description || '',
    nutrition: r.nutrition || '',
    safety: r.safety || '',
    storage: r.storage || '',
    unit: r.unit || '',
    marketMin: num(r.market_min),
    marketMax: num(r.market_max),
    importPrice: num(r.import_price),
    price: num(r.price),
    stock: num(r.stock),
    sold: num(r.sold),
    status: r.status || 'active',
    source: r.source || 'default',
    featured: Boolean(r.featured),
    certs: Array.isArray(r.certs) ? r.certs : [],
    requester: r.requester || undefined,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

function productToRow(p: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.categoryId !== undefined) row.category_id = p.categoryId;
  if (p.categoryName !== undefined) row.category_name = p.categoryName || null;
  if (p.district !== undefined) row.district = p.district;
  if (p.commune !== undefined) row.commune = p.commune;
  if (p.ethnicities !== undefined) row.ethnicities = p.ethnicities;
  if (p.imageAlt !== undefined) row.image_alt = p.imageAlt;
  if (p.imageUrl !== undefined) row.image_url = p.imageUrl;
  if (p.description !== undefined) row.description = p.description;
  if (p.nutrition !== undefined) row.nutrition = p.nutrition;
  if (p.safety !== undefined) row.safety = p.safety;
  if (p.storage !== undefined) row.storage = p.storage;
  if (p.unit !== undefined) row.unit = p.unit;
  if (p.marketMin !== undefined) row.market_min = p.marketMin;
  if (p.marketMax !== undefined) row.market_max = p.marketMax;
  if (p.importPrice !== undefined) row.import_price = p.importPrice;
  if (p.price !== undefined) row.price = p.price;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.sold !== undefined) row.sold = p.sold;
  if (p.status !== undefined) row.status = p.status;
  if (p.source !== undefined) row.source = p.source;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.certs !== undefined) row.certs = p.certs;
  if (p.requester !== undefined) row.requester = p.requester;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): Order {
  return {
    id: String(r.id),
    code: r.code,
    customerName: r.customer_name ?? r.customerName ?? '',
    phone: r.phone ?? '',
    classUnit: r.class_unit ?? r.classUnit ?? '',
    note: r.note ?? '',
    fulfillment: r.fulfillment ?? 'pickup',
    paymentMethod: r.payment_method ?? r.paymentMethod ?? 'pickup_cod',
    items: Array.isArray(r.items) ? r.items : [],
    total: num(r.total),
    status: r.status,
    createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? r.updatedAt ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(r: any): Settings {
  return {
    id: 1,
    shippingCost: num(r.shipping_cost),
    pickupHours: r.pickup_hours || '',
    pickupAddress: r.pickup_address || '',
    hotline: r.hotline || '',
    bankBin: r.bank_bin || '',
    bankAccountNo: r.bank_account_no || '',
    bankAccountName: r.bank_account_name || '',
    bankName: r.bank_name || '',
    vendorInviteCode: r.vendor_invite_code || '',
    autoApproveVendors: Boolean(r.auto_approve_vendors),
    mapEmbedUrl: r.map_embed_url || '',
    siteUrl: r.site_url || '',
    zaloUrl: r.zalo_url || '',
    facebookUrl: r.facebook_url || '',
  };
}

// ---------------------------- SẢN PHẨM ----------------------------

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) {
    ensureLocalSeed();
    return localProducts();
  }
  // Đọc qua view công khai: đã lọc sản phẩm chưa lên kệ và che SĐT người gửi.
  // Admin đăng nhập nhận dữ liệu đầy đủ từ cùng view.
  const { data, error } = await supabase
    .from('products_public')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) sbMessage(error, 'Không tải được danh sách sản phẩm.');
  return (data || []).map(rowToProduct);
}

export async function fetchSettings(): Promise<Settings> {
  const fallback = defaultSettings();
  if (!supabase) return localSettings();

  // Khách đọc qua view công khai (không chứa mã mời lớp/HTX).
  // Bảng gốc `settings` chỉ admin đọc được.
  const { data, error } = await supabase.from('settings_public').select('*').eq('id', 1).maybeSingle();
  if (error) sbMessage(error, 'Không tải được cấu hình.');
  if (!data) return { ...fallback, shippingCost: DEFAULT_SHIPPING_COST };

  const settings: Settings = { ...fallback, ...rowToSettings(data) };
  // Khách vãng lai không nhận được mã mời; máy chủ sẽ kiểm tra mã khi gửi sản phẩm.
  settings.vendorInviteCode = '';

  // Chỉ lấy mã mời khi đã đăng nhập (admin); khách không cần và không được thấy.
  const { data: session } = await supabase.auth.getSession();
  if (session.session) {
    const { data: code } = await supabase.rpc('admin_get_settings_secret');
    if (typeof code === 'string' && code) settings.vendorInviteCode = code;
  }

  return settings;
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  if (!supabase) {
    // Tránh vô tình xóa mã mời khi biểu mẫu chưa có giá trị
    const clean: Partial<Settings> = { ...patch };
    if (clean.vendorInviteCode !== undefined) {
      const code = clean.vendorInviteCode.trim().toUpperCase();
      if (code) clean.vendorInviteCode = code;
      else delete clean.vendorInviteCode;
    }
    return setLocalSettings(clean);
  }
  const row: Record<string, unknown> = { id: 1 };
  if (patch.shippingCost !== undefined) row.shipping_cost = Math.max(0, Math.round(patch.shippingCost));
  if (patch.pickupHours !== undefined) row.pickup_hours = patch.pickupHours;
  if (patch.pickupAddress !== undefined) row.pickup_address = patch.pickupAddress;
  if (patch.hotline !== undefined) row.hotline = patch.hotline;
  if (patch.bankBin !== undefined) row.bank_bin = patch.bankBin;
  if (patch.bankAccountNo !== undefined) row.bank_account_no = patch.bankAccountNo;
  if (patch.bankAccountName !== undefined) row.bank_account_name = patch.bankAccountName;
  if (patch.bankName !== undefined) row.bank_name = patch.bankName;
  // Chỉ cập nhật mã mời khi admin nhập mã mới. Chuỗi rỗng = giữ nguyên,
  // tránh vô tình xóa mã khi biểu mẫu chưa tải được giá trị bí mật.
  if (patch.vendorInviteCode !== undefined && patch.vendorInviteCode.trim() !== '') {
    row.vendor_invite_code = patch.vendorInviteCode.trim().toUpperCase();
  }
  if (patch.autoApproveVendors !== undefined) row.auto_approve_vendors = patch.autoApproveVendors;
  if (patch.mapEmbedUrl !== undefined) row.map_embed_url = patch.mapEmbedUrl;
  if (patch.siteUrl !== undefined) row.site_url = patch.siteUrl;
  if (patch.zaloUrl !== undefined) row.zalo_url = patch.zaloUrl;
  if (patch.facebookUrl !== undefined) row.facebook_url = patch.facebookUrl;

  const { data, error } = await supabase.from('settings').upsert(row).select().single();
  if (error) sbMessage(error, 'Không lưu được cấu hình.');
  return rowToSettings(data);
}

export async function updateProductAdmin(id: string, patch: Partial<Product>): Promise<Product> {
  if (!supabase) {
    const list = localProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx < 0) fail('Không tìm thấy sản phẩm.');
    list[idx] = { ...list[idx], ...patch, id };
    setLocalProducts(list);
    return list[idx];
  }
  const { data, error } = await supabase
    .from('products')
    .update(productToRow(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) sbMessage(error, 'Không cập nhật được sản phẩm.');
  return rowToProduct(data);
}

export async function deleteProductAdmin(id: string): Promise<void> {
  if (!supabase) {
    setLocalProducts(localProducts().filter((p) => p.id !== id));
    return;
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) sbMessage(error, 'Không xóa được sản phẩm.');
}

/** Tải ảnh lên Storage; trả về URL công khai. Chế độ local trả về data URL. */
export async function persistImage(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (!supabase) return dataUrl;

  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const name = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(name, blob, {
    contentType: blob.type,
    upsert: false,
  });
  if (error) {
    fail('Không tải được ảnh lên kho lưu trữ. Kiểm tra bucket "product-images" đã tạo chưa.');
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(name);
  return data.publicUrl;
}

// ---------------------------- KIỂM TRA BIỂU MẪU ----------------------------

export interface DraftValidation {
  errors: string[];
  warnings: string[];
}

export function validateDraft(
  draft: ProductDraft,
  existing: Product[],
  settings: Settings,
  isAdmin: boolean,
): DraftValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const name = draft.name.trim();

  if (name.length < 3) errors.push('Tên sản phẩm phải có ít nhất 3 ký tự.');
  if (name.length > 90) errors.push('Tên sản phẩm tối đa 90 ký tự.');
  if (!draft.district) errors.push('Vui lòng chọn huyện/xã xuất xứ tại Hòa Bình.');
  if (draft.district && !DISTRICTS.includes(draft.district)) {
    errors.push('Xuất xứ phải là một huyện/thành phố thuộc Hòa Bình.');
  }
  if (!draft.categoryId) errors.push('Vui lòng chọn nhóm danh mục.');
  if (draft.ethnicities.length === 0) errors.push('Vui lòng chọn ít nhất một cộng đồng dân tộc.');
  if (!draft.unit.trim()) errors.push('Vui lòng nhập đơn vị / quy cách đóng gói.');
  if (!draft.safety.trim()) errors.push('Vui lòng mô tả tiêu chuẩn an toàn thực phẩm.');
  if (!draft.commitment) errors.push('Bạn cần xác nhận cam kết nguồn gốc và an toàn thực phẩm.');

  if (!Number.isFinite(draft.marketMin) || draft.marketMin < 0) errors.push('Giá chợ tối thiểu không hợp lệ.');
  if (!Number.isFinite(draft.marketMax) || draft.marketMax < 0) errors.push('Giá chợ tối đa không hợp lệ.');
  if (draft.marketMin > 0 && draft.marketMax > 0 && draft.marketMin > draft.marketMax) {
    errors.push('Giá chợ tối thiểu không được lớn hơn giá chợ tối đa.');
  }
  if (!Number.isFinite(draft.importPrice) || draft.importPrice < 0) errors.push('Giá nhập gốc không hợp lệ.');
  if (!Number.isFinite(draft.price) || draft.price <= 0) errors.push('Giá bán phải lớn hơn 0.');
  if (!Number.isInteger(draft.stock) || draft.stock < 0) errors.push('Số lượng phải là số nguyên không âm.');
  if (draft.stock > 100000) errors.push('Số lượng quá lớn, vui lòng kiểm tra lại.');

  const marketAvg = (draft.marketMin + draft.marketMax) / 2;
  if (marketAvg > 0 && draft.price > marketAvg) {
    warnings.push(
      `Giá bán cao hơn giá chợ trung bình (${Math.round(marketAvg).toLocaleString('vi-VN')} đ). Nên xem lại để đảm bảo cam kết “giá hội chợ”.`,
    );
  }
  if (draft.price > 0 && draft.price < draft.importPrice) {
    warnings.push('Giá bán thấp hơn giá nhập gốc – bạn sẽ lỗ trên mỗi sản phẩm.');
  }

  const dup = existing.find(
    (p) =>
      removeDiacritics(p.name).toLowerCase().trim() === removeDiacritics(name).toLowerCase().trim() &&
      p.status !== 'hidden',
  );
  if (dup) errors.push(`Đã có sản phẩm cùng tên “${dup.name}”. Vui lòng kiểm tra lại danh mục.`);

  if (draft.mode === 'customer') {
    if (draft.requesterName.trim().length < 2) errors.push('Vui lòng nhập họ tên người yêu cầu.');
    if (!isValidPhone(draft.requesterPhone)) errors.push('Số điện thoại không hợp lệ (VD: 0912 345 678).');
  }

  if (draft.mode === 'vendor' && !isAdmin) {
    if (!draft.inviteCode.trim()) errors.push('Cần mã mời do ban tổ chức cấp để đăng bán.');
    // Ở chế độ Supabase, trình duyệt không biết mã mời (bảo mật) → để máy chủ kiểm tra.
    else if (settings.vendorInviteCode && draft.inviteCode.trim().toUpperCase() !== settings.vendorInviteCode.toUpperCase()) {
      errors.push('Mã mời không đúng. Vui lòng liên hệ ban tổ chức.');
    }
  }

  return { errors, warnings };
}

export interface SubmitProductResult {
  product: Product;
  status: Product['status'];
  message: string;
}

export async function submitProduct(
  draft: ProductDraft,
  imageUrl: string,
  isAdmin: boolean,
  settings: Settings,
): Promise<SubmitProductResult> {
  const existing = await fetchProducts();
  const { errors } = validateDraft(draft, existing, settings, isAdmin);
  if (errors.length > 0) throw new Error(errors[0]);

  const name = draft.name.trim();
  let slug = slugify(name);
  if (existing.some((p) => p.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const requester =
    draft.mode === 'customer'
      ? {
          name: draft.requesterName.trim(),
          phone: normalizePhone(draft.requesterPhone),
          note: draft.requesterNote.trim(),
          at: new Date().toISOString(),
        }
      : draft.mode === 'vendor'
        ? {
            name: draft.requesterName.trim() || 'Gian hàng lớp/HTX',
            phone: normalizePhone(draft.requesterPhone),
            note: draft.requesterNote.trim(),
            at: new Date().toISOString(),
            inviteCode: draft.inviteCode.trim().toUpperCase(),
          }
        : undefined;

  if (!supabase) {
    // Chống spam nhẹ ở chế độ local: tối đa 1 sản phẩm / 15 giây / thiết bị
    const last = Number(localStorage.getItem('hsxm:lastSubmit') || 0);
    if (Date.now() - last < 15_000) {
      fail('Bạn vừa gửi sản phẩm. Vui lòng đợi vài giây rồi thử lại.');
    }
    localStorage.setItem('hsxm:lastSubmit', String(Date.now()));

    const status: Product['status'] =
      draft.mode === 'customer'
        ? 'pending_supply'
        : settings.autoApproveVendors || isAdmin
          ? 'active'
          : 'pending_approval';

    const product: Product = {
      id: `sp-${Date.now()}`,
      slug,
      name,
      categoryId: draft.categoryId,
      categoryName: draft.newCategoryName?.trim() || undefined,
      district: draft.district,
      commune: draft.commune.trim(),
      ethnicities: draft.ethnicities,
      imageAlt: draft.imageAlt.trim() || `Ảnh sản phẩm ${name}`,
      imageUrl,
      description: draft.description.trim(),
      nutrition: draft.nutrition.trim(),
      safety: draft.safety.trim(),
      storage: draft.storage.trim(),
      unit: draft.unit.trim(),
      marketMin: Math.round(draft.marketMin),
      marketMax: Math.round(draft.marketMax),
      importPrice: Math.round(draft.importPrice),
      price: Math.round(draft.price),
      stock: Math.round(draft.stock),
      sold: 0,
      status,
      source: draft.mode === 'customer' ? 'customer' : 'vendor',
      featured: false,
      certs: draft.certs,
      requester,
      createdAt: new Date().toISOString(),
    };
    setLocalProducts([...localProducts(), product]);
    return {
      product,
      status,
      message:
        status === 'pending_supply'
          ? 'Đã ghi nhận yêu cầu. Ban tổ chức sẽ xác nhận nguồn cung HTX và liên hệ lại.'
          : status === 'pending_approval'
            ? 'Đã gửi sản phẩm, đang chờ ban tổ chức duyệt nhanh.'
            : 'Sản phẩm đã lên kệ gian hàng.',
    };
  }

  const payload = {
    name,
    slug,
    categoryId: draft.categoryId,
    categoryName: draft.newCategoryName?.trim() || null,
    district: draft.district,
    commune: draft.commune.trim(),
    ethnicities: draft.ethnicities,
    imageAlt: draft.imageAlt.trim() || `Ảnh sản phẩm ${name}`,
    imageUrl,
    description: draft.description.trim(),
    nutrition: draft.nutrition.trim(),
    safety: draft.safety.trim(),
    storage: draft.storage.trim(),
    unit: draft.unit.trim(),
    marketMin: Math.round(draft.marketMin),
    marketMax: Math.round(draft.marketMax),
    importPrice: Math.round(draft.importPrice),
    price: Math.round(draft.price),
    stock: Math.round(draft.stock),
    certs: draft.certs,
    source: draft.mode,
    requesterName: requester?.name || '',
    requesterPhone: requester?.phone || '',
    requesterNote: requester?.note || '',
  };

  const { data, error } = await supabase.rpc('submit_product', {
    p_payload: payload,
    p_invite_code: draft.mode === 'vendor' ? draft.inviteCode.trim() : '',
  });
  if (error) sbMessage(error, 'Không gửi được sản phẩm.');
  const product = rowToProduct(data);
  return {
    product,
    status: product.status,
    message:
      product.status === 'pending_supply'
        ? 'Đã ghi nhận yêu cầu. Ban tổ chức sẽ xác nhận nguồn cung HTX và liên hệ lại.'
        : product.status === 'pending_approval'
          ? 'Đã gửi sản phẩm, đang chờ ban tổ chức duyệt nhanh.'
          : 'Sản phẩm đã lên kệ gian hàng.',
  };
}

// ---------------------------- ĐƠN HÀNG ----------------------------

export function availableStock(p: Product): number {
  return Math.max(0, p.stock - p.sold);
}

export function isOrderable(p: Product): boolean {
  return (p.status === 'active' || p.status === 'pending_supply') && availableStock(p) > 0;
}

function buildLocalOrder(payload: NewOrderPayload, products: Product[]): Order {
  const name = payload.customerName.trim();
  if (name.length < 2) fail('Vui lòng nhập họ tên người nhận.');
  if (name.length > 80) fail('Họ tên quá dài.');
  if (!isValidPhone(payload.phone)) fail('Số điện thoại không hợp lệ. Ví dụ: 0912 345 678.');
  if (!payload.classUnit.trim()) fail('Vui lòng nhập lớp / đơn vị.');
  if (payload.note.length > 500) fail('Ghi chú tối đa 500 ký tự.');
  if (!Array.isArray(payload.items) || payload.items.length === 0) fail('Giỏ hàng đang trống.');
  if (payload.items.length > 30) fail('Đơn hàng có quá nhiều mặt hàng.');

  const items = payload.items.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) fail('Có sản phẩm không còn tồn tại. Vui lòng tải lại trang.');
    if (!isOrderable(product)) fail(`Sản phẩm “${product.name}” hiện không thể đặt.`);
    const qty = Math.floor(line.qty);
    if (qty < 1) fail('Số lượng phải từ 1 trở lên.');
    const available = availableStock(product);
    if (qty > available) fail(`“${product.name}” chỉ còn ${available} ${product.unit}.`);
    return {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      price: product.price,
      qty,
      importPrice: product.importPrice,
      imageUrl: product.imageUrl,
    };
  });

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const orders = localOrders();
  let code = generateOrderCode();
  for (let i = 0; i < 5 && orders.some((o) => o.code === code); i++) code = generateOrderCode();

  return {
    id: `order-${Date.now()}`,
    code,
    customerName: name,
    phone: normalizePhone(payload.phone),
    classUnit: payload.classUnit.trim(),
    note: payload.note.trim(),
    fulfillment: 'pickup',
    paymentMethod: payload.paymentMethod,
    items,
    total,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function createOrder(payload: NewOrderPayload): Promise<Order> {
  if (!supabase) {
    const products = localProducts();
    const order = buildLocalOrder(payload, products);
    // Giữ chỗ số lượng đã đặt
    const next = products.map((p) => {
      const line = order.items.find((i) => i.productId === p.id);
      return line ? { ...p, sold: p.sold + line.qty } : p;
    });
    setLocalProducts(next);
    setLocalOrders([order, ...localOrders()]);
    return order;
  }

  const { data, error } = await supabase.rpc('place_order', { p_payload: payload });
  if (error) sbMessage(error, 'Không tạo được đơn hàng.');
  return rowToOrder(data);
}

export async function lookupOrder(code: string, phone: string): Promise<Order | null> {
  const cleanCode = code.trim().toUpperCase();
  const cleanPhone = normalizePhone(phone);
  if (!cleanCode || !isValidPhone(cleanPhone)) return null;

  if (!supabase) {
    const found = localOrders().find((o) => o.code === cleanCode && o.phone === cleanPhone);
    return found ? clone(found) : null;
  }
  const { data, error } = await supabase.rpc('lookup_order', {
    p_code: cleanCode,
    p_phone: cleanPhone,
  });
  if (error) sbMessage(error, 'Không tra cứu được đơn hàng.');
  if (!data) return null;
  return rowToOrder(data);
}

export async function fetchOrders(): Promise<Order[]> {
  if (!supabase) return localOrders();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) sbMessage(error, 'Không tải được danh sách đơn hàng.');
  return (data || []).map(rowToOrder);
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  if (!supabase) {
    const orders = localOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) fail('Không tìm thấy đơn hàng.');
    const order = orders[idx];
    if (order.status === status) return order;

    const products = localProducts();
    // Hủy đơn → trả lại số lượng đã giữ chỗ; mở lại đơn đã hủy → giữ chỗ lại
    if (status === 'cancelled' && order.status !== 'cancelled') {
      setLocalProducts(
        products.map((p) => {
          const line = order.items.find((i) => i.productId === p.id);
          return line ? { ...p, sold: Math.max(0, p.sold - line.qty) } : p;
        }),
      );
    } else if (order.status === 'cancelled' && status !== 'cancelled') {
      for (const line of order.items) {
        const p = products.find((x) => x.id === line.productId);
        if (!p || availableStock(p) < line.qty) {
          fail(`Không đủ tồn cho “${line.name}” để mở lại đơn.`);
        }
      }
      setLocalProducts(
        products.map((p) => {
          const line = order.items.find((i) => i.productId === p.id);
          return line ? { ...p, sold: p.sold + line.qty } : p;
        }),
      );
    }

    orders[idx] = { ...order, status, updatedAt: new Date().toISOString() };
    setLocalOrders(orders);
    return orders[idx];
  }

  const { data, error } = await supabase.rpc('admin_set_order_status', {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) sbMessage(error, 'Không đổi được trạng thái đơn.');
  return rowToOrder(data);
}

/** Ẩn/hiện sản phẩm nhanh từ admin */
export async function setProductStatus(id: string, status: Product['status']): Promise<Product> {
  return updateProductAdmin(id, { status });
}

export const BACKEND_LABEL: Record<BackendMode, string> = {
  supabase: 'Supabase (CSDL thật)',
  local: 'Chạy thử trên thiết bị này',
};
