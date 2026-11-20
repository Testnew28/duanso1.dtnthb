-- ============================================================
-- KIỂM TRA NHANH SAU KHI CHẠY schema.sql + seed.sql
-- Chạy trong Supabase → SQL Editor. Mọi dòng phải đạt như ghi chú.
-- ============================================================

-- 1) Đủ 34 sản phẩm gốc
select 'so_san_pham' as muc, count(*)::text as gia_tri, '34' as ky_vong
from public.products where source = 'default';

-- 2) Tổng số lượng / doanh thu / vốn khớp tài liệu
select
  'tong_so_luong' as muc, sum(stock)::text as gia_tri, '994' as ky_vong
from public.products where source = 'default'
union all
select 'doanh_thu', sum(price * stock)::text, '42135000'
from public.products where source = 'default'
union all
select 'von_nhap', sum(import_price * stock)::text, '33619000'
from public.products where source = 'default';

-- 3) Bảng và view đã tạo
select 'bang' as loai, table_name as ten
from information_schema.tables
where table_schema = 'public'
  and table_name in ('admins', 'products', 'settings', 'orders')
union all
select 'view', table_name
from information_schema.views
where table_schema = 'public'
  and table_name in ('products_public', 'settings_public')
order by loai, ten;

-- 4) RLS đã bật trên cả 4 bảng (cột rowsecurity phải là true)
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('admins', 'products', 'settings', 'orders')
order by tablename;

-- 5) Đủ 9 hàm nghiệp vụ
select proname as ham
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in (
    'is_admin', 'normalize_phone', 'new_order_code', 'touch_updated_at',
    'place_order', 'lookup_order', 'submit_product', 'admin_set_order_status',
    'admin_get_settings_secret'
  )
order by proname;

-- 6) Bucket ảnh đã tạo và đang công khai
select id, public, file_size_limit
from storage.buckets
where id = 'product-images';

-- 7) Có ít nhất một tài khoản quản trị (nếu 0 dòng: làm bước 3.3 trong docs/TRIEN-KHAI.md)
select a.email, a.full_name
from public.admins a;

-- 8) Khách KHÔNG thấy mã mời qua view công khai
--    Bảng dưới đây không có cột vendor_invite_code → đúng thiết kế.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'settings_public'
order by ordinal_position;
