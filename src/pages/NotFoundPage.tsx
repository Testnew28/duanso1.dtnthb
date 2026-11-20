import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-wood-300">404</p>
      <h1 className="mt-2 text-2xl">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-ink/60">
        Đường dẫn có thể đã thay đổi. Bạn có thể về trang chủ hoặc vào gian hàng để chọn nông sản.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/">
          <Button variant="primary">Về trang chủ</Button>
        </Link>
        <Link to="/cua-hang">
          <Button variant="outline">Vào gian hàng</Button>
        </Link>
      </div>
    </div>
  );
}
