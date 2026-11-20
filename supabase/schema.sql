-- ============================================================
-- HƯƠNG SẮC XỨ MƯỜNG – CẤU TRÚC CƠ SỞ DỮ LIỆU SUPABASE
-- Chạy toàn bộ file này trong Supabase → SQL Editor → New query → Run.
-- Sau đó chạy tiếp supabase/seed.sql để nạp 34 sản phẩm gốc.
--
-- Nguyên tắc bảo mật:
--   * Trình duyệt chỉ dùng anon key; KHÔNG có service_role trong frontend.
--   * Giá tiền, tồn kho, tổng đơn đều được TÍNH LẠI trong hàm SQL.
--   * Khách chỉ đọc được sản phẩm/cấu hình; đơn hàng do hàm SECURITY DEFINER xử lý.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) BẢNG QUẢN TRỊ VIÊN
-- ------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null default '',
  full_name  text not null default 'Ban tổ chức',
  created_at timestamptz not null default now()
);

comment on table public.admins is 'Danh sách tài khoản được phép quản trị. Thêm thủ công sau khi tạo user trong Authentication.';

-- Hàm kiểm tra quyền admin. SECURITY DEFINER để tránh đệ quy RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- 2) SẢN PHẨM
-- ------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  category_id   text not null,
  category_name text,
  district      text not null default '',
  commune       text not null default '',
  ethnicities   text[] not null default '{}',
  image_alt     text not null default '',
  image_url     text not null default '',
  description   text not null default '',
  nutrition     text not null default '',
  safety        text not null default '',
  storage       text not null default '',
  unit          text not null default '',
  market_min    integer not null default 0 check (market_min >= 0),
  market_max    integer not null default 0 check (market_max >= 0),
  import_price  integer not null default 0 check (import_price >= 0),
  price         integer not null default 0 check (price > 0),
  stock         integer not null default 0 check (stock >= 0),
  sold          integer not null default 0 check (sold >= 0),
  status        text not null default 'active'
                check (status in ('active', 'out_of_stock', 'pending_supply', 'pending_approval', 'hidden')),
  source        text not null default 'default'
                check (source in ('default', 'customer', 'vendor')),
  featured      boolean not null default false,
  certs         text[] not null default '{}',
  requester     jsonb,
  created_at    timestamptz not null default now(),
  constraint products_stock_ge_sold check (stock >= sold)
);

create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_created_idx on public.products (created_at);

-- ------------------------------------------------------------
-- 3) CẤU HÌNH CHUNG (1 dòng duy nhất, id = 1)
-- ------------------------------------------------------------
create table if not exists public.settings (
  id                  smallint primary key default 1 check (id = 1),
  shipping_cost       integer not null default 1716000 check (shipping_cost >= 0),
  pickup_hours        text not null default 'Sáng 8:00–11:30 · Chiều 14:00–17:00',
  pickup_address      text not null default 'Sân trường PT DTNT THPT Hòa Bình, Phường Tân Hòa, TP. Hòa Bình',
  hotline             text not null default '0218 3851 234',
  bank_bin            text not null default '970422',
  bank_account_no     text not null default '0000000000',
  bank_account_name   text not null default 'TRUONG PT DTNT THPT HOA BINH',
  bank_name           text not null default 'MB Bank',
  vendor_invite_code  text not null default 'HTX2026',
  auto_approve_vendors boolean not null default false,
  map_embed_url       text not null default '',
  site_url            text not null default '',
  zalo_url            text not null default '',
  facebook_url        text not null default '',
  updated_at          timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4) ĐƠN HÀNG
-- ------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  customer_name  text not null,
  phone          text not null,
  class_unit     text not null,
  note           text not null default '',
  fulfillment    text not null default 'pickup' check (fulfillment in ('pickup')),
  payment_method text not null default 'pickup_cod' check (payment_method in ('pickup_cod', 'transfer')),
  items          jsonb not null default '[]'::jsonb,
  total          integer not null default 0 check (total >= 0),
  status         text not null default 'new'
                 check (status in ('new', 'confirmed', 'paid', 'delivered', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_lookup_idx on public.orders (code, phone);

-- ------------------------------------------------------------
-- 5) ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.admins   enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.orders   enable row level security;

drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_anon_read" on public.products;
drop policy if exists "products_auth_read" on public.products;

-- Bảng products KHÔNG mở SELECT cho khách: khách đọc qua view `products_public`
-- bên dưới (đã lọc trạng thái và che thông tin liên hệ). Chỉ admin đọc trực tiếp
-- thông qua policy ghi bên dưới (FOR ALL bao gồm SELECT).

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- View đọc công khai: chỉ trả sản phẩm đã lên kệ và CHE thông tin liên hệ
-- của người gửi (họ tên, SĐT, mã mời). Admin đăng nhập thấy đầy đủ.
-- Trình duyệt luôn đọc qua view này, không đọc thẳng bảng products.
create or replace view public.products_public
with (security_invoker = false) as
select
  p.id,
  p.slug,
  p.name,
  p.category_id,
  p.category_name,
  p.district,
  p.commune,
  p.ethnicities,
  p.image_alt,
  p.image_url,
  p.description,
  p.nutrition,
  p.safety,
  p.storage,
  p.unit,
  p.market_min,
  p.market_max,
  p.import_price,
  p.price,
  p.stock,
  p.sold,
  p.status,
  p.source,
  p.featured,
  p.certs,
  case
    when public.is_admin() then p.requester
    when p.requester is null then null
    -- Khách chỉ biết sản phẩm do “gian hàng lớp/HTX” gửi, không lộ SĐT
    when p.source = 'customer' then null
    else jsonb_build_object('name', 'Gian hàng lớp/HTX')
  end as requester,
  p.created_at
from public.products p
where public.is_admin()
   or p.status in ('active', 'out_of_stock', 'pending_supply');

grant select on public.products_public to anon, authenticated;

-- Cấu hình: bảng gốc chỉ admin đọc được (vì chứa mã mời lớp/HTX).
-- Khách đọc qua view `settings_public` bên dưới, đã lược bỏ mã mời.
drop policy if exists "settings_public_read" on public.settings;
drop policy if exists "settings_admin_read" on public.settings;
create policy "settings_admin_read" on public.settings
  for select to authenticated
  using (public.is_admin());

-- View chỉ-đọc chạy bằng quyền chủ sở hữu nên bỏ qua RLS của bảng gốc.
create or replace view public.settings_public
with (security_invoker = false) as
select
  id,
  shipping_cost,
  pickup_hours,
  pickup_address,
  hotline,
  bank_bin,
  bank_account_no,
  bank_account_name,
  bank_name,
  auto_approve_vendors,
  map_embed_url,
  site_url,
  zalo_url,
  facebook_url
from public.settings;

grant select on public.settings_public to anon, authenticated;

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Chỉ admin đọc được mã mời lớp/HTX (không lộ qua view công khai).
create or replace function public.admin_get_settings_secret()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền xem cấu hình này.' using errcode = '42501';
  end if;
  select vendor_invite_code into v_code from public.settings where id = 1;
  return coalesce(v_code, '');
end;
$$;

revoke all on function public.admin_get_settings_secret() from public;
grant execute on function public.admin_get_settings_secret() to authenticated;

-- Không có policy cho INSERT/UPDATE công khai: việc tạo đơn đi qua hàm place_order().
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read" on public.orders
  for select to authenticated
  using (public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 6) HÀM TIỆN ÍCH
-- ------------------------------------------------------------
create or replace function public.normalize_phone(raw text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(raw, ''), '[\s\.\-\(\)]', '', 'g');
$$;

create or replace function public.new_order_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  for attempt in 1..20 loop
    candidate := 'HSXM-';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * 32)::int, 1);
    end loop;
    if not exists (select 1 from public.orders o where o.code = candidate) then
      return candidate;
    end if;
  end loop;
  raise exception 'Không sinh được mã đơn, vui lòng thử lại.';
end;
$$;

-- Cập nhật updated_at tự động
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 7) ĐẶT HÀNG (khách vãng lai – không cần đăng nhập)
-- ------------------------------------------------------------
create or replace function public.place_order(p_payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name        text := btrim(coalesce(p_payload ->> 'customerName', ''));
  v_phone       text := public.normalize_phone(p_payload ->> 'phone');
  v_class       text := btrim(coalesce(p_payload ->> 'classUnit', ''));
  v_note        text := btrim(coalesce(p_payload ->> 'note', ''));
  v_payment     text := coalesce(p_payload ->> 'paymentMethod', 'pickup_cod');
  v_items_in    jsonb := coalesce(p_payload -> 'items', '[]'::jsonb);
  v_items       jsonb := '[]'::jsonb;
  v_total       integer := 0;
  v_line        jsonb;
  v_product     public.products;
  v_qty         integer;
  v_count       integer := 0;
  v_order       public.orders;
begin
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Họ tên người nhận không hợp lệ (2–80 ký tự).';
  end if;
  if v_phone !~ '^0[0-9]{9,10}$' then
    raise exception 'Số điện thoại không hợp lệ. Ví dụ: 0912345678.';
  end if;
  if length(v_class) < 1 or length(v_class) > 80 then
    raise exception 'Vui lòng nhập lớp / đơn vị.';
  end if;
  if length(v_note) > 500 then
    raise exception 'Ghi chú tối đa 500 ký tự.';
  end if;
  if v_payment not in ('pickup_cod', 'transfer') then
    raise exception 'Hình thức thanh toán không hợp lệ.';
  end if;
  if jsonb_typeof(v_items_in) <> 'array' or jsonb_array_length(v_items_in) = 0 then
    raise exception 'Giỏ hàng đang trống.';
  end if;
  if jsonb_array_length(v_items_in) > 30 then
    raise exception 'Đơn hàng có quá nhiều mặt hàng.';
  end if;

  -- Chống spam: tối đa 10 đơn / giờ cho mỗi số điện thoại
  if (
    select count(*)
      from public.orders o
     where o.phone = v_phone
       and o.created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Số điện thoại này đã đặt quá nhiều đơn trong 1 giờ. Vui lòng thử lại sau.';
  end if;

  for v_line in select * from jsonb_array_elements(v_items_in) loop
    v_count := v_count + 1;
    begin
      v_qty := (v_line ->> 'qty')::int;
    exception when others then
      raise exception 'Số lượng không hợp lệ ở dòng %.', v_count;
    end;
    if v_qty is null or v_qty < 1 or v_qty > 1000 then
      raise exception 'Số lượng phải từ 1 đến 1000 ở dòng %.', v_count;
    end if;

    -- Khóa dòng sản phẩm để tránh hai khách cùng đặt vượt tồn
    select * into v_product
      from public.products p
     where p.id = (v_line ->> 'productId')
     for update;

    if not found then
      raise exception 'Có sản phẩm không còn tồn tại. Vui lòng tải lại trang.';
    end if;
    if v_product.status not in ('active', 'pending_supply') then
      raise exception 'Sản phẩm “%” hiện không thể đặt.', v_product.name;
    end if;
    if (v_product.stock - v_product.sold) < v_qty then
      raise exception '“%” chỉ còn % %.', v_product.name, (v_product.stock - v_product.sold), v_product.unit;
    end if;

    -- Giá LUÔN lấy từ CSDL, không tin giá trình duyệt gửi lên
    v_items := v_items || jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'unit', v_product.unit,
      'price', v_product.price,
      'qty', v_qty,
      'importPrice', v_product.import_price,
      'imageUrl', v_product.image_url
    );
    v_total := v_total + v_product.price * v_qty;

    update public.products
       set sold = sold + v_qty
     where id = v_product.id;
  end loop;

  insert into public.orders (code, customer_name, phone, class_unit, note, payment_method, items, total)
  values (public.new_order_code(), v_name, v_phone, v_class, v_note, v_payment, v_items, v_total)
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 8) TRA CỨU ĐƠN (cần đúng mã đơn + số điện thoại)
-- ------------------------------------------------------------
create or replace function public.lookup_order(p_code text, p_phone text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order
    from public.orders o
   where o.code = upper(btrim(coalesce(p_code, '')))
     and o.phone = public.normalize_phone(p_phone)
   limit 1;
  return v_order; -- null nếu không khớp
end;
$$;

revoke all on function public.lookup_order(text, text) from public;
grant execute on function public.lookup_order(text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 9) ĐỔI TRẠNG THÁI ĐƠN (admin) – tự trả/giữ chỗ tồn kho
-- ------------------------------------------------------------
create or replace function public.admin_set_order_status(p_order_id uuid, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_line  jsonb;
  v_pid   text;
  v_qty   integer;
  v_left  integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền đổi trạng thái đơn.' using errcode = '42501';
  end if;
  if p_status not in ('new', 'confirmed', 'paid', 'delivered', 'cancelled') then
    raise exception 'Trạng thái đơn không hợp lệ.';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Không tìm thấy đơn hàng.';
  end if;
  if v_order.status = p_status then
    return v_order;
  end if;

  if p_status = 'cancelled' then
    -- Hủy đơn: trả lại số lượng đã giữ chỗ
    for v_line in select * from jsonb_array_elements(v_order.items) loop
      v_pid := v_line ->> 'productId';
      v_qty := coalesce((v_line ->> 'qty')::int, 0);
      update public.products
         set sold = greatest(0, sold - v_qty)
       where id = v_pid;
    end loop;
  elsif v_order.status = 'cancelled' then
    -- Mở lại đơn đã hủy: kiểm tra tồn rồi giữ chỗ lại
    for v_line in select * from jsonb_array_elements(v_order.items) loop
      v_pid := v_line ->> 'productId';
      v_qty := coalesce((v_line ->> 'qty')::int, 0);
      select (p.stock - p.sold) into v_left from public.products p where p.id = v_pid for update;
      if v_left is null then
        raise exception 'Sản phẩm trong đơn không còn tồn tại, không thể mở lại.';
      end if;
      if v_left < v_qty then
        raise exception 'Không đủ tồn cho “%” để mở lại đơn.', (v_line ->> 'name');
      end if;
      update public.products set sold = sold + v_qty where id = v_pid;
    end loop;
  end if;

  update public.orders set status = p_status where id = p_order_id returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.admin_set_order_status(uuid, text) from public;
grant execute on function public.admin_set_order_status(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- 10) GỬI SẢN PHẨM MỚI (khách yêu cầu / lớp–HTX đăng bán)
-- ------------------------------------------------------------
create or replace function public.submit_product(p_payload jsonb, p_invite_code text default '')
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin      boolean := public.is_admin();
  v_source     text := coalesce(p_payload ->> 'source', 'customer');
  v_name       text := btrim(coalesce(p_payload ->> 'name', ''));
  v_slug       text := btrim(coalesce(p_payload ->> 'slug', ''));
  v_district   text := btrim(coalesce(p_payload ->> 'district', ''));
  v_unit       text := btrim(coalesce(p_payload ->> 'unit', ''));
  v_safety     text := btrim(coalesce(p_payload ->> 'safety', ''));
  v_price      integer := coalesce((p_payload ->> 'price')::int, 0);
  v_import     integer := coalesce((p_payload ->> 'importPrice')::int, 0);
  v_min        integer := coalesce((p_payload ->> 'marketMin')::int, 0);
  v_max        integer := coalesce((p_payload ->> 'marketMax')::int, 0);
  v_stock      integer := coalesce((p_payload ->> 'stock')::int, 0);
  v_invite     text := btrim(coalesce(p_invite_code, ''));
  v_expected   text;
  v_auto       boolean := false;
  v_status     text;
  v_category   text := btrim(coalesce(p_payload ->> 'categoryId', ''));
  v_ethnic     jsonb := coalesce(p_payload -> 'ethnicities', '[]'::jsonb);
  v_certs      jsonb := coalesce(p_payload -> 'certs', '[]'::jsonb);
  v_requester  jsonb;
  v_product    public.products;
  v_base       text;
begin
  if v_source not in ('customer', 'vendor') then
    raise exception 'Nguồn gửi sản phẩm không hợp lệ.';
  end if;
  if length(v_name) < 3 or length(v_name) > 90 then
    raise exception 'Tên sản phẩm phải có 3–90 ký tự.';
  end if;
  if v_district = '' then
    raise exception 'Vui lòng chọn huyện/xã xuất xứ tại Hòa Bình.';
  end if;
  if v_category = '' then
    raise exception 'Vui lòng chọn nhóm danh mục.';
  end if;
  if jsonb_typeof(v_ethnic) <> 'array' or jsonb_array_length(v_ethnic) = 0 then
    raise exception 'Vui lòng chọn ít nhất một cộng đồng dân tộc.';
  end if;
  if v_unit = '' then
    raise exception 'Vui lòng nhập đơn vị / quy cách đóng gói.';
  end if;
  if v_safety = '' then
    raise exception 'Vui lòng mô tả tiêu chuẩn an toàn thực phẩm.';
  end if;
  if v_min < 0 or v_max < 0 or v_import < 0 then
    raise exception 'Giá không được âm.';
  end if;
  if v_min > 0 and v_max > 0 and v_min > v_max then
    raise exception 'Giá chợ tối thiểu không được lớn hơn giá chợ tối đa.';
  end if;
  if v_price <= 0 then
    raise exception 'Giá bán phải lớn hơn 0.';
  end if;
  if v_stock < 0 or v_stock > 100000 then
    raise exception 'Số lượng không hợp lệ.';
  end if;

  if v_source = 'vendor' and not v_admin then
    select upper(vendor_invite_code), auto_approve_vendors
      into v_expected, v_auto
      from public.settings where id = 1;
    if v_invite = '' or upper(v_invite) <> coalesce(v_expected, '') then
      raise exception 'Mã mời không đúng. Vui lòng liên hệ ban tổ chức.';
    end if;
  end if;

  if exists (select 1 from public.products p where lower(btrim(p.name)) = lower(v_name)) then
    raise exception 'Đã có sản phẩm cùng tên “%”.', v_name;
  end if;

  -- Slug duy nhất
  if v_slug = '' then
    v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  v_slug := btrim(v_slug, '-');
  if v_slug = '' then v_slug := 'san-pham'; end if;
  v_base := left(v_slug, 50);
  v_slug := v_base;
  while exists (select 1 from public.products p where p.slug = v_slug) loop
    v_slug := v_base || '-' || lower(substr(md5(random()::text), 1, 5));
  end loop;

  v_status := case
    when v_source = 'customer' then 'pending_supply'
    when v_admin or v_auto then 'active'
    else 'pending_approval'
  end;

  if v_source = 'vendor' or (p_payload ? 'requesterName') then
    v_requester := jsonb_build_object(
      'name', btrim(coalesce(p_payload ->> 'requesterName', '')),
      'phone', public.normalize_phone(p_payload ->> 'requesterPhone'),
      'note', btrim(coalesce(p_payload ->> 'requesterNote', '')),
      'at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );
    if v_source = 'vendor' then
      v_requester := v_requester || jsonb_build_object('inviteCode', upper(v_invite));
    end if;
  end if;

  -- Chống spam: người gửi (theo SĐT) chỉ được tạo 3 sản phẩm / giờ.
  -- SĐT là tùy chọn với gian hàng lớp/HTX, bắt buộc với yêu cầu của khách.
  if v_requester is not null and not v_admin then
    if v_source = 'customer' and (v_requester ->> 'phone') !~ '^0[0-9]{9,10}$' then
      raise exception 'Số điện thoại liên hệ không hợp lệ.';
    end if;
    if (v_requester ->> 'phone') ~ '^0[0-9]{9,10}$' and (
      select count(*)
        from public.products p
       where coalesce(p.requester ->> 'phone', '') = (v_requester ->> 'phone')
         and p.created_at > now() - interval '1 hour'
    ) >= 3 then
      raise exception 'Bạn đã gửi quá nhiều sản phẩm trong 1 giờ. Vui lòng thử lại sau.';
    end if;
  end if;

  insert into public.products (
    id, slug, name, category_id, category_name, district, commune, ethnicities,
    image_alt, image_url, description, nutrition, safety, storage, unit,
    market_min, market_max, import_price, price, stock, status, source, certs, requester
  ) values (
    'sp-' || replace(gen_random_uuid()::text, '-', ''),
    v_slug, v_name, v_category, nullif(btrim(coalesce(p_payload ->> 'categoryName', '')), ''),
    v_district, btrim(coalesce(p_payload ->> 'commune', '')),
    coalesce(array(select jsonb_array_elements_text(v_ethnic)), '{}'),
    btrim(coalesce(p_payload ->> 'imageAlt', '')),
    btrim(coalesce(p_payload ->> 'imageUrl', '')),
    btrim(coalesce(p_payload ->> 'description', '')),
    btrim(coalesce(p_payload ->> 'nutrition', '')),
    v_safety,
    btrim(coalesce(p_payload ->> 'storage', '')),
    v_unit,
    v_min, v_max, v_import, v_price, v_stock,
    v_status, v_source,
    coalesce(array(select jsonb_array_elements_text(v_certs)), '{}'),
    v_requester
  )
  returning * into v_product;

  return v_product;
end;
$$;

revoke all on function public.submit_product(jsonb, text) from public;
grant execute on function public.submit_product(jsonb, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 11) KHO ẢNH SẢN PHẨM
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- XONG PHẦN CẤU TRÚC.
-- Bước tiếp theo:
--   1. Authentication → Users → Add user (email + mật khẩu ban tổ chức).
--   2. Chạy: insert into public.admins (user_id, email, full_name)
--      select id, email, 'Ban tổ chức Hội chợ' from auth.users
--      where email = 'ban-to-chuc@truong.edu.vn';
--   3. Chạy supabase/seed.sql để nạp 34 sản phẩm.
-- ============================================================
