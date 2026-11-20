# Hương Sắc Xứ Mường

Website gian hàng nông sản sạch nội địa Hòa Bình cho **Hội chợ Dinh dưỡng – Trường PT DTNT THPT Hòa Bình**.
Khách xem 34 sản vật, đặt hàng online (nhận tại trường), tra cứu đơn; ban tổ chức quản lý đơn, sản phẩm, cấu hình
và xem báo cáo tài chính tự tính.

- **Công nghệ**: React 18 + TypeScript + Vite + Tailwind CSS (SPA), Supabase (PostgreSQL / Auth / Storage / RLS / Edge Function).
- **Hai chế độ chạy**:
  - `local` – chưa cấu hình Supabase: dữ liệu lưu trong `localStorage`, đầy đủ chức năng trên **một thiết bị** (dùng để trình diễn).
  - `supabase` – có `.env` Supabase: dữ liệu thật, đồng bộ nhiều thiết bị, RLS bảo vệ.
- **Không cần tài khoản khách hàng** – chỉ họ tên, SĐT, lớp/đơn vị.

## Chạy nhanh (chế độ trình diễn, chưa cần Supabase)

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

- Gian hàng: `/cua-hang`
- Giỏ hàng & đặt hàng: `/dat-hang` (2 bước)
- Quản trị: `/admin` → mật khẩu mặc định `HuongSac@2026` (đổi bằng `VITE_LOCAL_ADMIN_PASSWORD`)
- Mã mời cho lớp/HTX đăng bán: `HTX2026` (đổi trong `/admin` → Cấu hình)

## Cấu trúc thư mục

```
huong-sac-xu-muong/
├─ src/
│  ├─ components/     # UI, sản phẩm, biểu đồ, trang trí dân tộc
│  ├─ context/        # Store (sản phẩm/cấu hình), Cart, Auth, Toast
│  ├─ data/           # 34 sản phẩm seed, danh mục, huyện, thẻ khoa học
│  ├─ hooks/          # meta, đếm số, quan sát cuộn, giảm chuyển động
│  ├─ lib/            # repo (truy cập dữ liệu), finance, format, vietqr…
│  ├─ pages/          # trang khách + trang admin
│  └─ types.ts
├─ supabase/
│  ├─ schema.sql      # bảng, RLS, hàm place_order / lookup_order / submit_product
│  ├─ seed.sql        # 34 sản phẩm gốc (sinh tự động)
│  └─ functions/notify-order/  # Edge Function Telegram (tùy chọn)
├─ scripts/           # gen-seed, gen-og, e2e
└─ docs/              # hướng dẫn triển khai, vận hành, kiểm thử
```

## Số liệu tài chính

Toàn bộ tổng được **tính từ dữ liệu**, không gõ cứng. Với 34 sản phẩm gốc:

| Chỉ tiêu | Giá trị |
| --- | --- |
| Số lượng dự kiến | 994 đơn vị |
| Doanh thu dự toán | 42.135.000 đ |
| Vốn nhập hàng | 33.619.000 đ |
| Lợi nhuận gộp | 8.516.000 đ |
| Chi phí vận chuyển & đóng gói | 1.716.000 đ |
| **Lợi nhuận ròng** | **6.800.000 đ** |
| Tỷ suất ròng | 16,14% |
| **Tỷ lệ tiết kiệm trung bình** | **20,24%** |

> **Lưu ý về tài liệu gốc**: tài liệu ghi “tiết kiệm trung bình 16,8%”, nhưng 16,8% là tỷ lệ trên *tổng giá trị thị trường*
> (`1 − 42.135.000 / giá trị chợ`). Đề bài yêu cầu **trung bình cộng tỷ lệ tiết kiệm của từng mặt hàng**, giá trị đúng là
> **20,24%**. Website hiển thị 20,24% và ghi rõ công thức tại trang Khảo sát giá.

## Lệnh

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển |
| `npm run build` | Kiểm tra TypeScript + build `dist/` |
| `npm run preview` | Xem bản build |
| `npm run gen:seed` | Sinh lại `supabase/seed.sql` từ `src/data/products.ts` |
| `npm run gen:og` | Sinh lại `public/og-image.png` |
| `npm run test:e2e` | Kiểm thử tự động (cần dev server + Chrome) |

## Tài liệu

- [`docs/TRIEN-KHAI.md`](docs/TRIEN-KHAI.md) – tạo Supabase, nạp dữ liệu, deploy Vercel/Netlify (từng bước).
- [`docs/HUONG-DAN-BAN-TO-CHUC.md`](docs/HUONG-DAN-BAN-TO-CHUC.md) – vận hành hội chợ: duyệt đơn, đổi trạng thái, in báo cáo.
- [`docs/KIEM-THU.md`](docs/KIEM-THU.md) – checklist kiểm thử và kết quả chạy tự động.

## Cơ sở dữ liệu

| File | Dùng khi nào |
| --- | --- |
| `supabase/schema.sql` | Chạy một lần khi tạo project: bảng, RLS, view công khai, hàm nghiệp vụ, bucket ảnh |
| `supabase/seed.sql` | Nạp 34 sản phẩm gốc (sinh tự động bằng `npm run gen:seed`) |
| `supabase/verify.sql` | Kiểm tra sau khi nạp: đếm sản phẩm, tổng tiền, RLS, hàm, bucket |

## Bảo mật

- Frontend chỉ dùng **anon key**; không có `service_role` trong mã nguồn.
- Giá, tồn kho, tổng tiền đơn được **tính lại trong PostgreSQL** (`place_order`) – trình duyệt không thể sửa giá.
- Bảng `orders` không cho khách đọc trực tiếp; tra cứu qua hàm `lookup_order(code, phone)`.
- Khách đọc sản phẩm qua view `products_public`: chỉ sản phẩm đã lên kệ, **SĐT người gửi đã bị che**.
- Khách đọc cấu hình qua view `settings_public`: **không chứa mã mời lớp/HTX**.
- Ảnh tải lên Storage chỉ admin có quyền ghi; đọc công khai.
- Giới hạn tần suất trong CSDL: tối đa 10 đơn/giờ mỗi SĐT, 3 sản phẩm gửi/giờ mỗi SĐT.
- Tồn kho được khóa bằng `SELECT … FOR UPDATE` khi đặt, nên hai khách không thể đặt vượt tồn.
