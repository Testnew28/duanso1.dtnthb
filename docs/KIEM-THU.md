# Kiểm thử

## 1. Kiểm thử tự động

Bộ kiểm thử dùng Puppeteer điều khiển Chrome thật, chạy trên **chế độ local** (không cần Supabase).

### Chuẩn bị

```bash
npm install
npx puppeteer browsers install chrome   # nếu máy chưa có Chrome
npm run dev                            # giữ chạy ở cửa sổ riêng
```

Sửa `BASE` trong `scripts/e2e.mjs` cho khớp cổng dev server (mặc định `http://127.0.0.1:5183`), rồi:

```bash
npm run test:e2e
```

Kết quả ghi ra `%TEMP%\kilo\shots\e2e.log` kèm ảnh chụp từng bước.

### Phạm vi đã kiểm (kết quả lần chạy cuối: **26/26 PASS**)

| # | Kịch bản | Kỳ vọng |
| --- | --- | --- |
| 1 | Trang chủ | Hiện tiêu đề |
| 2 | Trang chủ | Có 4 trụ cột STEM |
| 3 | Cửa hàng | Đúng 34 thẻ sản phẩm |
| 4 | Tìm kiếm không dấu (`mang`) | Ra Măng nứa / Măng khô / Măng vầu |
| 5 | Lọc không dấu | Thu hẹp còn 4 kết quả |
| 6 | Thêm vào giỏ | Nút hoạt động, badge giỏ hàng tăng |
| 7 | Trang đặt hàng | Giỏ có sản phẩm |
| 8 | Luồng 2 bước | Bước 1 giỏ → bước 2 thông tin (không còn trang xác nhận trung gian) |
| 9 | Đặt hàng | Sinh mã `HSXM-XXXXXX` |
| 10 | Trang thành công | Hiển thị đúng |
| 11 | Tra cứu | Nhập mã + SĐT ra đúng đơn |
| 12 | Trang khoa học | Có thẻ lật |
| 13 | Tạo sản phẩm theo yêu cầu | Sản phẩm mới xuất hiện trên kệ |
| 14 | Sản phẩm mới | Có nhãn đặt trước |
| 15 | Đếm sản phẩm | Tăng lên 35 |
| 16 | Khảo sát giá | Dự toán có sản phẩm mới |
| 17 | Bảng dự toán | 35 dòng |
| 18 | Khảo sát giá | Tổng dự toán vẫn hiển thị |
| 19 | Admin | Yêu cầu đăng nhập |
| 20 | Admin | Đăng nhập thành công |
| 21 | Admin → Đơn hàng | Thấy đơn vừa đặt |
| 22 | Admin → Đơn hàng | Đổi trạng thái hoạt động |
| 23 | Admin → Sản phẩm | Tab mở, bảng 35 dòng |
| 24 | Admin → Cấu hình | Tab mở |
| 25 | Admin → Báo cáo | Tab mở |
| 26 | Mobile 360px | Không tràn ngang (`overflow=0`) |

Không có lỗi console và không có lỗi runtime trong suốt lượt chạy.

## 2. Kiểm thử thủ công trước hội chợ

### 2.1. Luồng khách (5 phút, trên điện thoại)

- [ ] Mở trang chủ, thấy 4 trụ cột STEM và số liệu tổng.
- [ ] Vào Cửa hàng, gõ `mang` (không dấu) vẫn tìm ra măng.
- [ ] Lọc theo nhóm và theo huyện.
- [ ] Bấm vào thẻ → xem chi tiết, dinh dưỡng, an toàn thực phẩm.
- [ ] Thêm 2 sản phẩm, sửa số lượng, xóa 1 dòng.
- [ ] Vào giỏ: tổng tiền đúng, nút +/- bị khóa khi vượt tồn.
- [ ] Bấm **Tiếp tục nhập thông tin** → điền tên, SĐT sai → thấy lỗi ngay tại ô.
- [ ] Sửa SĐT đúng → bấm **Đặt hàng & nhận mã đơn** → nhận mã, thấy QR VietQR.
- [ ] Bấm tra cứu, nhập mã + SĐT → ra đơn.
- [ ] Thử tạo sản phẩm theo yêu cầu ở trang Cửa hàng.

### 2.2. Luồng ban tổ chức

- [ ] Đăng nhập `/admin`, badge hiện **Supabase**.
- [ ] Chuông báo đúng số đơn mới.
- [ ] Đổi trạng thái đơn: Mới → Đã xác nhận → Đã thu tiền → Đã giao.
- [ ] Hủy một đơn → vào Sản phẩm thấy tồn tăng lại.
- [ ] Sửa giá một sản phẩm → trang Khảo sát giá cập nhật tổng ngay.
- [ ] Sửa chi phí vận chuyển → lợi nhuận ròng thay đổi tương ứng.
- [ ] Tải ảnh thật cho một sản phẩm → ảnh hiện trên thẻ và trang chi tiết.
- [ ] Đổi mã mời → dùng mã cũ thấy báo lỗi.
- [ ] Xuất CSV mở được bằng Excel, có đủ 34 dòng.
- [ ] In PDF: ẩn nút bấm, không cắt bảng.

### 2.3. Kiểm tra số liệu

| Chỉ tiêu | Giá trị đúng |
| --- | --- |
| Số sản phẩm gốc | 34 |
| Tổng số lượng | 994 |
| Doanh thu dự toán | 42.135.000 đ |
| Vốn nhập | 33.619.000 đ |
| Lợi nhuận gộp | 8.516.000 đ |
| Chi phí VC & đóng gói | 1.716.000 đ |
| Lợi nhuận ròng | 6.800.000 đ |
| Tỷ suất ròng | 16,14% |
| Tỷ lệ tiết kiệm trung bình | 20,24% |

Cách đối chiếu nhanh: `/khao-sat-gia` → dòng **TỔNG CỘNG** và **LỢI NHUẬN RÒNG DỰ KIẾN**.
Sau khi chạy `supabase/seed.sql`, kiểm tra bằng SQL:

```sql
select count(*) as so_sp, sum(stock) as sl, sum(price*stock) as doanh_thu,
       sum(import_price*stock) as von
from public.products;
-- 34 | 994 | 42135000 | 33619000
```

## 3. Đã sửa trong quá trình kiểm thử

| Lỗi phát hiện | Cách sửa |
| --- | --- |
| Bấm “Thêm vào giỏ” liên tiếp bị mất dòng (state cũ) | `addToCart` dùng functional update |
| Bước xác nhận cho bấm tiếp khi chưa nhập thông tin | Kiểm tra dữ liệu trước khi chuyển bước |
| Admin mở modal sửa sản phẩm bị setState khi render | Chuyển sang `useEffect` theo `product` |
| Cấu hình admin không nạp lại khi dữ liệu về muộn | `useEffect` đồng bộ `settings` → `form` |
| Bảng khảo sát tính cả sản phẩm ẩn/chờ duyệt, lệch tổng | Dùng chung bộ lọc `countsInPlan` |
| Luồng đặt hàng 3 bước gây nhầm lẫn | Gộp còn 2 bước, bỏ trang xác nhận trung gian |
| Sau khi bấm đặt, trang nháy “Giỏ hàng trống” trước khi chuyển | Thêm trạng thái chờ trong lúc điều hướng |
| Khách đọc được SĐT người gửi trong sản phẩm chờ duyệt | Chuyển sang view `products_public` có che `requester` |
| Cấu hình công khai chứa mã mời lớp/HTX | Tách view `settings_public`; mã mời đọc qua hàm chỉ-admin |
| Admin đăng nhập sau khi trang đã tải không thấy mã mời | Tải lại store khi phiên đăng nhập thay đổi |

## 4. Giới hạn đã biết

- **Chưa có cổng thanh toán tự động**: chuyển khoản được đối chiếu thủ công bằng nội dung `HSXM-XXXXXX`.
- **Không có tài khoản khách**: tra cứu bằng mã đơn + SĐT (đúng thiết kế để giảm ma sát khi hội chợ).
- **Không sửa được đơn đã đặt**: phải hủy và đặt lại (tránh sai lệch tồn kho).
- **Chế độ local** chỉ dùng 1 thiết bị; nhiều thiết bị bắt buộc Supabase.
- **Ảnh minh họa SVG** thay cho ảnh thật khi chưa tải lên – có nhãn “Ảnh minh họa” để không gây hiểu nhầm.
- **Không gửi email/SMS**: thông báo đơn mới nằm trong `/admin` (Telegram là tùy chọn).
