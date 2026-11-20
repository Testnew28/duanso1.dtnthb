// 5 nhóm sản phẩm theo tài liệu hội chợ
export interface Category {
  id: string;
  name: string;
  shortName: string;
  description: string;
  tone: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'trai-cay',
    name: 'Trái cây & Nông sản tươi đặc sản',
    shortName: 'Trái cây tươi',
    description: 'Cam, bưởi, quýt, chanh, chuối – hái tại vườn đồi Hòa Bình.',
    tone: 'honey',
  },
  {
    id: 'rau-cu',
    name: 'Rau xanh, Củ quả & Lâm sản tự nhiên',
    shortName: 'Rau củ & lâm sản',
    description: 'Rau rừng, măng, khoai sọ, gừng – khai thác và canh tác tự nhiên.',
    tone: 'shoot',
  },
  {
    id: 'gao-kho',
    name: 'Gạo đặc sản, Ngũ cốc & Đồ khô',
    shortName: 'Gạo & đồ khô',
    description: 'Gạo nếp nương, nếp cẩm, miến dong, măng khô, nấm hương.',
    tone: 'wood',
  },
  {
    id: 'tuoi-song',
    name: 'Thực phẩm tươi sống, Chế biến truyền thống & Gia vị',
    shortName: 'Tươi sống & gia vị',
    description: 'Thịt muối chua, trứng, cá sông Đà, hạt dổi, mắc khén.',
    tone: 'thocam',
  },
  {
    id: 'tra-mat-ong',
    name: 'Trà thảo mộc, Mật ong & Thức uống dinh dưỡng',
    shortName: 'Trà & mật ong',
    description: 'Chè Shan tuyết, chè xanh, mật ong rừng, xạ đen, tinh bột nghệ.',
    tone: 'forest',
  },
];

export function categoryName(id: string, list: Category[] = CATEGORIES): string {
  return list.find((c) => c.id === id)?.name ?? 'Nhóm khác';
}

export function categoryShortName(id: string, list: Category[] = CATEGORIES): string {
  return list.find((c) => c.id === id)?.shortName ?? 'Khác';
}
