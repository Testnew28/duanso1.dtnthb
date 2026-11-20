// 10 đơn vị hành chính cấp huyện của tỉnh Hòa Bình (theo tài liệu dự án)
// Có thể bổ sung/sửa trực tiếp danh sách này khi địa giới hành chính thay đổi.
export const DISTRICTS = [
  'TP. Hòa Bình',
  'Huyện Cao Phong',
  'Huyện Đà Bắc',
  'Huyện Kim Bôi',
  'Huyện Lạc Sơn',
  'Huyện Lạc Thủy',
  'Huyện Lương Sơn',
  'Huyện Mai Châu',
  'Huyện Tân Lạc',
  'Huyện Yên Thủy',
];

/** Một số xã/phường tiêu biểu xuất hiện trong danh mục sản phẩm */
export const COMMUNES: Record<string, string[]> = {
  'TP. Hòa Bình': ['Phường Tân Hòa', 'Phường Phương Lâm', 'Phường Đồng Tiến', 'Phường Hữu Nghị'],
  'Huyện Cao Phong': ['Thị trấn Cao Phong', 'Xã Đông Phong', 'Xã Tây Phong', 'Xã Nam Phong'],
  'Huyện Đà Bắc': ['Thị trấn Đà Bắc', 'Xã Sơn Thủy', 'Xã Hiền Lương', 'Xã Tiền Phong'],
  'Huyện Kim Bôi': ['Thị trấn Bo', 'Xã Mường Động', 'Xã Hợp Kim', 'Xã Kim Bôi'],
  'Huyện Lạc Sơn': ['Thị trấn Vụ Bản', 'Xã Yên Phú', 'Xã Nhân Nghĩa', 'Xã Quyết Thắng'],
  'Huyện Lạc Thủy': ['Thị trấn Chi Nê', 'Xã Hương Sơn', 'Xã Phú Lão', 'Xã Đồng Tâm'],
  'Huyện Lương Sơn': ['Thị trấn Lương Sơn', 'Xã Hòa Sơn', 'Xã Trung Sơn', 'Xã Cao Sơn'],
  'Huyện Mai Châu': ['Thị trấn Mai Châu', 'Xã Pà Cò', 'Xã Hang Kia', 'Xã Mai Hạ'],
  'Huyện Tân Lạc': ['Thị trấn Mãn Đức', 'Xã Vân Sơn', 'Xã Lũng Vân', 'Xã Quyết Chiến'],
  'Huyện Yên Thủy': ['Thị trấn Hàng Trạm', 'Xã Yên Trị', 'Xã Ngọc Lương', 'Xã Đoàn Kết'],
};

export const ETHNICITIES = ['Mường', 'Kinh', 'Thái', 'Tày', 'Dao', 'Mông'];

/** Màu tem dân tộc – phân biệt nhẹ, đủ tương phản chữ */
export const ETHNIC_TONE: Record<string, string> = {
  Mường: 'bg-wood-100 text-wood-700 border-wood-300/60',
  Kinh: 'bg-cham-50 text-cham-700 border-cham-100',
  Thái: 'bg-shoot-100 text-forest-700 border-shoot-200',
  Tày: 'bg-honey-100 text-honey-700 border-honey-200',
  Dao: 'bg-thocam-500/10 text-thocam-700 border-thocam-500/20',
  Mông: 'bg-forest-50 text-forest-700 border-forest-100',
};
