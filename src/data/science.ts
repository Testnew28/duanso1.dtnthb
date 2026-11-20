// Nội dung trang Khoa học & An toàn thực phẩm (S – Science)
// Mỗi thẻ lật 3D: mặt trước là câu chuyện, mặt sau là cơ chế + nhiệt độ bảo quản.
export interface ScienceCard {
  id: string;
  title: string;
  kicker: string;
  categoryId: string;
  summary: string;
  icon: 'lactic' | 'dry' | 'cold' | 'gap' | 'starch' | 'tea' | 'honey' | 'omega' | 'noodle' | 'rice' | 'storage';
  mechanism: string[];
  temperature: string;
  tip: string;
}

export const SCIENCE_CARDS: ScienceCard[] = [
  {
    id: 'thit-chua',
    title: 'Thịt lợn muối chua xứ Mường',
    kicker: 'Lên men lactic · Lạc Sơn',
    categoryId: 'tuoi-song',
    summary: 'Thính gạo rang vàng là “men khô” của người Mường: vừa tạo hương, vừa nuôi lợi khuẩn.',
    icon: 'lactic',
    mechanism: [
      'Thính gạo rang cung cấp tinh bột cho Lactobacillus lên men.',
      'Vi khuẩn lactic sinh axit, hạ pH xuống 4,2–4,6 sau 3–5 ngày.',
      'Môi trường axit ức chế vi khuẩn gây thối; protein được phân giải một phần nên dễ tiêu hóa.',
    ],
    temperature: 'Lên men 18–25°C trong 3–5 ngày, sau đó bảo quản 2–4°C.',
    tip: 'Dùng trong 7–10 ngày sau khi lên men; không ăn khi có mùi lạ, nhớt hoặc mốc.',
  },
  {
    id: 'mang-chua',
    title: 'Măng nứa rừng ủ chua',
    kicker: 'pH 3,8–4,2 · Kim Bôi',
    categoryId: 'rau-cu',
    summary: 'Không cần chất bảo quản: chính axit lactic do vi khuẩn có lợi tạo ra là “hàng rào” an toàn.',
    icon: 'lactic',
    mechanism: [
      'Măng được luộc, để nguội rồi nén chặt trong hũ kín.',
      'Lactobacillus tự nhiên lên men đường và tinh bột, sinh axit lactic.',
      'pH giảm còn 3,8–4,2 – vùng ức chế Clostridium và nấm mốc.',
    ],
    temperature: 'Ủ nơi thoáng 20–28°C; sau khi chua bảo quản 4–8°C.',
    tip: 'Luôn ngập nước măng, dùng dụng cụ sạch; váng trắng mỏng là bình thường, váng xanh/đen thì bỏ.',
  },
  {
    id: 'mang-kho',
    title: 'Măng khô lưỡi lợn phơi nắng',
    kicker: 'Hoạt độ nước a_w < 0,55 · Mai Châu',
    categoryId: 'gao-kho',
    summary: 'Sấy và phơi đến khi a_w dưới 0,55: nước “bị khóa” nên vi sinh vật không thể phát triển.',
    icon: 'dry',
    mechanism: [
      'Luộc kỹ bằng nước suối để giảm vị đắng và vi sinh ban đầu.',
      'Phơi 3–5 nắng liên tục, đảo đều; độ ẩm cuối dưới 12%.',
      'a_w < 0,55 khiến nấm mốc và vi khuẩn không đủ nước để sinh sản.',
    ],
    temperature: 'Bảo quản nơi khô ráo, dưới 30°C, tránh ánh nắng trực tiếp.',
    tip: 'Sau khi ngâm nở, luộc lại 2 lần trước khi chế biến; túi hút chân không mở là dùng trong 1 tháng.',
  },
  {
    id: 'nghe-say-lanh',
    title: 'Tinh bột nghệ sấy lạnh',
    kicker: 'Giữ curcumin · Lương Sơn',
    categoryId: 'tra-mat-ong',
    summary: 'Nhiệt độ thấp giúp giữ curcumin – hợp chất tạo màu vàng và chống oxy hóa của nghệ.',
    icon: 'cold',
    mechanism: [
      'Nghệ tươi xay, lọc tách tinh dầu và nhựa bằng nước lắng nhiều lần.',
      'Sấy lạnh 40–45°C thay vì sấy nóng để hạn chế phân hủy curcumin.',
      'Curcumin ít tan trong nước – dùng cùng chất béo (dầu, sữa) để hấp thu tốt hơn.',
    ],
    temperature: 'Bảo quản 20–25°C, đậy kín, tránh ẩm và ánh sáng.',
    tip: 'Hũ 250g dùng trong 6 tháng sau khi mở nắp; không dùng thìa ướt để múc.',
  },
  {
    id: 'vietgap-cam',
    title: 'Cam Cao Phong canh tác VietGAP',
    kicker: 'Kiểm soát dịch hại sinh học · Cao Phong',
    categoryId: 'trai-cay',
    summary: 'VietGAP không chỉ là “không thuốc”: đó là nhật ký canh tác, thời gian cách ly và truy xuất nguồn gốc.',
    icon: 'gap',
    mechanism: [
      'Bẫy sinh học và thiên địch kiểm soát sâu hại, giảm thuốc hóa học.',
      'Phân hữu cơ ủ hoai cung cấp dinh dưỡng, cải tạo đất đồi.',
      'Thuốc (nếu dùng) phải tuân thủ thời gian cách ly tối thiểu 14 ngày trước thu hoạch.',
    ],
    temperature: 'Bảo quản 8–12°C, độ ẩm 85–90%; để ráo trước khi cho vào túi lưới.',
    tip: 'Cam còn cuống xanh tươi, vỏ căng; tránh xếp chồng nặng làm dập vỏ.',
  },
  {
    id: 'gao-nep',
    title: 'Vì sao gạo nếp nương lại dẻo?',
    kicker: 'Amylopectin ~80% · Mai Châu',
    categoryId: 'gao-kho',
    summary: 'Tỷ lệ amylopectin cao làm hạt gạo dẻo, mềm lâu và ít bị “lại gạo” khi nguội.',
    icon: 'rice',
    mechanism: [
      'Tinh bột gạo gồm amylose (chuỗi thẳng) và amylopectin (chuỗi nhánh).',
      'Nếp có amylopectin ~80% nên hút nước mạnh, hồ hóa tạo gel mềm.',
      'Hàm lượng amylose thấp nên gel ít thoái hóa – cơm nguội vẫn dẻo.',
    ],
    temperature: 'Bảo quản nơi khô mát; ngăn mát 4–8°C giúp hạn chế mọt.',
    tip: 'Ngâm 4–6 giờ trước khi đồ xôi; không vo quá kỹ để giữ lớp cám mỏng.',
  },
  {
    id: 'che-shan',
    title: 'Chè Shan tuyết Pà Cò',
    kicker: 'L-Theanine & polyphenol · Mai Châu',
    categoryId: 'tra-mat-ong',
    summary: 'L-Theanine tạo vị umami dịu và giúp tỉnh táo êm; polyphenol chống oxy hóa.',
    icon: 'tea',
    mechanism: [
      'Búp chè vùng sương mù tích lũy nhiều axit amin, đặc biệt L-Theanine.',
      'Sao diệt men ở nhiệt độ cao để dừng oxy hóa, giữ màu xanh và hương cốm.',
      'Pha 75–80°C để chiết xuất vị ngọt, tránh vị chát do tanin hòa tan quá mạnh.',
    ],
    temperature: 'Bảo quản kín, tránh ẩm, tránh ánh sáng; ngăn mát khi mở túi.',
    tip: '1g chè / 50ml nước, hãm 2–3 lần; không dùng nước sôi 100°C cho trà xanh.',
  },
  {
    id: 'mat-ong',
    title: 'Mật ong rừng – vì sao không cần tủ lạnh?',
    kicker: 'Đường đơn & độ ẩm thấp · Đà Bắc',
    categoryId: 'tra-mat-ong',
    summary: 'Độ ẩm dưới 20% cùng nồng độ đường cao tạo áp suất thẩm thấu, vi khuẩn không phát triển.',
    icon: 'honey',
    mechanism: [
      'Ong cô đặc mật bằng cách quạt cánh cho nước bay hơi đến độ ẩm < 20%.',
      'Enzyme glucose oxidase tạo axit gluconic nhẹ, giữ pH thấp.',
      'Mật kết tinh là hiện tượng tự nhiên của glucose – không phải mật giả.',
    ],
    temperature: 'Bảo quản 20–30°C, tránh nắng; không đun quá 40°C.',
    tip: 'Không cho trẻ dưới 12 tháng tuổi dùng mật ong; dùng thìa khô, sạch.',
  },
  {
    id: 'ca-song-da',
    title: 'Cá trắm đen lòng hồ sông Đà',
    kicker: 'Omega-3 EPA/DHA · Đà Bắc',
    categoryId: 'tuoi-song',
    summary: 'Cá nuôi lồng nước sạch, giàu EPA/DHA – axit béo tốt cho não và thị lực.',
    icon: 'omega',
    mechanism: [
      'Cá ăn thức ăn tự nhiên trong lòng hồ, thịt săn chắc, ít mỡ vàng.',
      'EPA/DHA là axit béo không no chuỗi dài, dễ hỏng khi gặp nhiệt và oxy.',
      'Phi lê, hút chân không và giữ chuỗi lạnh 0–4°C để hạn chế oxy hóa.',
    ],
    temperature: 'Giữ 0–4°C khi vận chuyển; cấp đông −18°C nếu bảo quản dài ngày.',
    tip: 'Rã đông trong ngăn mát, không rã bằng nước nóng để giữ cấu trúc thịt.',
  },
  {
    id: 'mien-dong',
    title: 'Miến dong không tẩy trắng',
    kicker: 'Tinh bột dong riềng · Đà Bắc',
    categoryId: 'gao-kho',
    summary: 'Sợi miến xám hổ phách tự nhiên là dấu hiệu không dùng lưu huỳnh tẩy trắng.',
    icon: 'noodle',
    mechanism: [
      'Củ dong riềng già được xay, lọc lấy tinh bột và phơi khô nhiều lần.',
      'Tinh bột dong tạo sợi dai, trong khi không cần phụ gia kết dính.',
      'Không xông lưu huỳnh nên sợi giữ màu xám tự nhiên, an toàn hơn cho người dùng.',
    ],
    temperature: 'Bảo quản khô ráo, thoáng mát; tránh ẩm để không mốc.',
    tip: 'Ngâm nước ấm 15–20 phút trước khi nấu; không ngâm quá lâu sẽ bở sợi.',
  },
  {
    id: 'bao-quan-rau',
    title: 'Bảo quản rau rừng & nông sản tươi',
    kicker: 'Hô hấp – ethylene – nhiệt độ',
    categoryId: 'rau-cu',
    summary: 'Rau sau thu hoạch vẫn “thở”. Giảm nhiệt độ và độ ẩm phù hợp giúp chậm héo và giữ vitamin.',
    icon: 'storage',
    mechanism: [
      'Hô hấp tiêu hao đường và vitamin C, sinh nhiệt – càng ấm càng nhanh.',
      'Ethylene từ quả chín thúc đẩy rau vàng; nên tách riêng chuối, bưởi với rau.',
      'Rau lá ưu tiên 4–8°C, độ ẩm 90–95%; bọc giấy thấm ẩm thay vì túi kín.',
    ],
    temperature: 'Ngăn mát 4–8°C; nông sản nhiệt đới như chuối để 12–15°C.',
    tip: 'Rửa rau ngay trước khi dùng; rau rừng dùng trong 2–3 ngày sau thu hoạch.',
  },
];
