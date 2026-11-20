# Hướng dẫn triển khai

Tài liệu này đưa website từ mã nguồn lên Internet, dùng dữ liệu thật và **nhiều thiết bị cùng thấy một dữ liệu**.
Làm đúng thứ tự 1 → 6. Thời gian ước tính: 20–30 phút.

---

## 0. Chuẩn bị

| Thứ cần có | Ghi chú |
| --- | --- |
| Node.js ≥ 18 | `node -v` phải chạy được |
| Tài khoản GitHub | Để deploy Vercel/Netlify |
| Tài khoản Supabase | Miễn phí tại <https://supabase.com> |
| (Tùy chọn) Tài khoản Vercel hoặc Netlify | Miễn phí |

> Chưa muốn dựng Supabase? Bỏ qua bước 2–3, chạy `npm run dev` là website hoạt động đầy đủ ở **chế độ local**
> (dữ liệu lưu trong trình duyệt, chỉ 1 thiết bị). Dùng để trình diễn trước hội chợ.

---

## 1. Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở link Vite in ra (thường `http://localhost:5173`).

- `/admin` → mật khẩu `HuongSac@2026`.
- Nếu muốn đổi mật khẩu local: tạo file `.env` với `VITE_LOCAL_ADMIN_PASSWORD=MatKhauMoi@2026`.

---

## 2. Tạo Supabase project

1. Vào <https://supabase.com/dashboard> → **New project**.
2. Điền:
   - **Name**: `huong-sac-xu-muong`
   - **Database Password**: đặt mật khẩu mạnh, **lưu lại** (chỉ dùng cho quản trị CSDL).
   - **Region**: `Southeast Asia (Singapore)` – gần Việt Nam nhất.
3. Bấm **Create new project**, đợi ~2 phút.
4. Vào **Project Settings → API**, ghi lại:
   - `Project URL` → chính là `VITE_SUPABASE_URL`
   - `anon public` key → chính là `VITE_SUPABASE_ANON_KEY`

> ⚠️ **Không bao giờ** đưa `service_role` key vào file `.env` hay mã frontend. Chỉ dùng `anon`.

---

## 3. Nạp cấu trúc và dữ liệu

### 3.1. Tạo bảng, bảo mật, hàm xử lý

1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Mở file `supabase/schema.sql` trong dự án, **copy toàn bộ** nội dung, dán vào editor.
3. Bấm **Run** (Ctrl+Enter). Kết quả phải là `Success. No rows returned`.

File này tạo:
- Bảng `admins`, `products`, `settings`, `orders`.
- Bật **Row Level Security** cho cả 4 bảng.
- Hai **view công khai**: `products_public` (chỉ sản phẩm đã lên kệ, che SĐT người gửi) và `settings_public`
  (cấu hình không chứa mã mời). Trình duyệt của khách chỉ đọc qua hai view này.
- 5 hàm xử lý nghiệp vụ: `place_order`, `lookup_order`, `submit_product`, `admin_set_order_status`,
  `admin_get_settings_secret`.
- Bucket Storage `product-images` + chính sách đọc công khai / ghi cho admin.

### 3.2. Nạp 34 sản phẩm gốc

1. **New query** lần nữa.
2. Copy toàn bộ `supabase/seed.sql`, dán, **Run**.

Kiểm tra:

```sql
select count(*) from public.products;   -- phải là 34
select sum(stock) as sl, sum(price*stock) as dt, sum(import_price*stock) as von
from public.products;
-- sl = 994 · dt = 42135000 · von = 33619000
```

Nếu sửa giá/sản phẩm trong `src/data/products.ts`, chạy `npm run gen:seed` để sinh lại file seed rồi nạp lại.

### 3.3. Tạo tài khoản ban tổ chức

1. **Authentication → Users → Add user → Create new user**.
2. Email thật của ban tổ chức (VD `ban-to-chuc@truong.edu.vn`), mật khẩu mạnh.
   - Bật **Auto Confirm User** để đăng nhập được ngay.
3. Cấp quyền quản trị bằng **SQL Editor**:

```sql
insert into public.admins (user_id, email, full_name)
select id, email, 'Ban tổ chức Hội chợ'
from auth.users
where email = 'ban-to-chuc@truong.edu.vn'
on conflict (user_id) do nothing;
```

Kiểm tra:

```sql
select * from public.admins;   -- phải thấy 1 dòng
```

> Nếu tài khoản đăng nhập được nhưng `/admin` báo “chưa được cấp quyền quản trị” → thiếu dòng trong bảng `admins`.

### 3.4. Khai báo biến môi trường

Tạo file `.env` ở thư mục gốc dự án (copy từ `.env.example`):

```dotenv
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....

VITE_SITE_URL=https://huongsacxumuong.vn

# Chỉ dùng khi chạy local; khi có Supabase, đăng nhập bằng tài khoản ở bước 3.3
VITE_LOCAL_ADMIN_PASSWORD=HuongSac@2026

# Thông tin chuyển khoản – có thể sửa sau trong /admin → Cấu hình
VITE_BANK_BIN=970422
VITE_BANK_ACCOUNT_NO=0123456789
VITE_BANK_ACCOUNT_NAME=TRUONG PT DTNT THPT HOA BINH
VITE_BANK_NAME=MB Bank

VITE_MAP_EMBED_URL=https://www.google.com/maps?q=...&output=embed
VITE_HOTLINE=0218 3851 234
VITE_TELEGRAM_ENABLED=false
```

Chạy lại `npm run dev`. Vào `/admin`: badge phải hiện **Supabase** (không còn **Local**).
Đăng nhập bằng email/mật khẩu ở bước 3.3.

---

## 4. Kiểm tra nhanh sau khi nối Supabase

| Việc làm | Kết quả mong đợi |
| --- | --- |
| Mở `/cua-hang` | 34 sản phẩm, ảnh minh họa SVG theo nhóm |
| Đặt 1 đơn ở `/dat-hang` | Nhận mã `HSXM-XXXXXX` |
| Vào `/admin` → Đơn hàng | Thấy đơn vừa tạo, chuông báo số đơn mới |
| Mở `/cua-hang` trên **điện thoại khác** | Thấy tồn kho đã giảm sau đơn vừa đặt |
| `/khao-sat-gia` | Doanh thu 42.135.000 đ · ròng 6.800.000 đ |

Nếu tồn kho không giảm giữa hai thiết bị → kiểm tra `.env` đã đúng URL/key và đã restart `npm run dev`.

---

## 5. Deploy lên Internet

### Cách A — Vercel (khuyến nghị)

1. Đẩy mã nguồn lên GitHub (repo riêng tư cũng được).
2. <https://vercel.com/new> → **Import Git Repository** → chọn repo.
3. Cấu hình:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** → thêm đúng các biến ở bước 3.4 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, …).
5. **Deploy**. File `vercel.json` đã cấu hình rewrite SPA (mọi đường dẫn về `index.html`) và cache asset.

### Cách B — Netlify

1. <https://app.netlify.com/start> → chọn repo.
2. **Build command**: `npm run build` · **Publish directory**: `dist` (đã có trong `netlify.toml`).
3. **Site settings → Environment variables** → thêm các biến `VITE_*`.
4. **Deploy site**.

### Sau khi deploy

- Gán tên miền riêng (nếu có) tại phần **Domains**.
- Cập nhật `VITE_SITE_URL` = tên miền thật, sau đó deploy lại (mã QR chia sẻ dùng biến này).
- Cập nhật `public/robots.txt` và `public/sitemap.xml` nếu đổi tên miền.
- Trên điện thoại, mở website → menu trình duyệt → **Thêm vào màn hình chính** để dùng như ứng dụng.

---

## 6. Tùy chọn: thông báo đơn mới qua Telegram

Mặc định đơn mới đã hiện trong `/admin` với chuông đếm. Nếu ban tổ chức muốn nhận tin nhắn điện thoại:

1. Trong Telegram, chat với **@BotFather** → `/newbot` → lấy **token**.
2. Chat với bot vừa tạo 1 tin nhắn bất kỳ.
3. Lấy `chat_id`:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
   ```
   Tìm `"chat":{"id":123456789,...}`.
4. Cài Supabase CLI, đăng nhập, nối project:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref <project-ref>
   ```
5. Khai báo secret và deploy hàm:
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN=<token> TELEGRAM_CHAT_ID=<chat_id>
   supabase functions deploy notify-order --no-verify-jwt
   ```
6. Bật cờ trong `.env`: `VITE_TELEGRAM_ENABLED=true`, rồi deploy lại frontend.

Lỗi Telegram **không** làm hỏng việc đặt hàng của khách (hàm được gọi bất đồng bộ và nuốt lỗi).

---

## 7. Sự cố thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `/admin` báo “Tài khoản chưa được cấp quyền” | Thiếu dòng trong `public.admins` | Chạy SQL ở bước 3.3 |
| Badge vẫn là **Local** | `.env` sai tên biến hoặc chưa restart dev server | Kiểm tra tiền tố `VITE_`, chạy lại `npm run dev` |
| Đặt hàng báo “Sản phẩm … hiện không thể đặt” | Sản phẩm `hidden` / `pending_approval` hoặc hết tồn | `/admin` → Sản phẩm → đổi trạng thái hoặc tăng số lượng |
| Đặt hàng báo “chỉ còn N …” | Hai khách đặt cùng lúc, hàm đã khóa dòng và từ chối | Khách giảm số lượng; admin tăng tồn |
| Upload ảnh lỗi “bucket chưa tạo” | Chưa chạy phần Storage trong `schema.sql` | Chạy lại đoạn 11 của `schema.sql` |
| Tải trang con bị 404 khi deploy | Thiếu rewrite SPA | Dùng đúng `vercel.json` / `netlify.toml` có trong dự án |
| Tổng tiền khác tài liệu | Dữ liệu sản phẩm đã bị sửa hoặc có sản phẩm mới | Mọi tổng đều tính lại từ dữ liệu – xem `/khao-sat-gia` |

---

## 8. Sao lưu dữ liệu

Supabase → **Database → Backups** (bản miễn phí có backup hằng ngày, giữ 7 ngày).

Xuất thủ công trước hội chợ:

```sql
copy (select * from public.products) to stdout with csv header;
copy (select * from public.orders) to stdout with csv header;
```

Hoặc dùng `/admin` → **Báo cáo** → **Xuất CSV**.
