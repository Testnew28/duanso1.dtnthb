import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StiltHouseMark } from '@/components/ui/Motif';
import { backendMode } from '@/lib/repo';

export function AdminLogin() {
  usePageMeta('Đăng nhập quản trị | Hương Sắc Xứ Mường');
  const { user, loading, signIn } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <StiltHouseMark className="mx-auto h-16 w-24 text-wood-500" />
          <h1 className="mt-2 font-display text-2xl text-forest-900">Trang quản trị ban tổ chức</h1>
          <p className="mt-1 text-sm text-ink/60">{settings.pickupAddress}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl2 border border-wood-300/40 bg-rice p-5 shadow-card">
          {backendMode === 'local' && (
            <div className="mb-4 rounded-lg border border-honey-300 bg-honey-100/70 p-3 text-xs leading-relaxed text-honey-700">
              <strong>Chế độ chạy thử:</strong> chưa cấu hình Supabase nên dữ liệu chỉ lưu trên trình duyệt này. Mật
              khẩu mặc định lấy từ <code>VITE_LOCAL_ADMIN_PASSWORD</code> (mặc định <code>HuongSac@2026</code>).
            </div>
          )}

          <label htmlFor="admin-email" className="block text-sm font-semibold">
            Email quản trị
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base mt-1"
            placeholder="ban-to-chuc@truong.edu.vn"
          />

          <label htmlFor="admin-password" className="mt-3 block text-sm font-semibold">
            Mật khẩu
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base mt-1"
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="mt-3 rounded-lg border border-thocam-500/25 bg-thocam-500/10 px-3 py-2 text-xs font-medium text-thocam-700">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-4" loading={submitting}>
            Đăng nhập
          </Button>

          <div className="mt-3 flex items-center justify-between text-xs">
            <Badge tone={backendMode === 'supabase' ? 'forest' : 'honey'}>
              {backendMode === 'supabase' ? 'Supabase Auth' : 'Chạy thử cục bộ'}
            </Badge>
            <button type="button" onClick={() => navigate('/')} className="font-semibold text-forest-700 hover:underline">
              Về trang khách
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/45">
          Tài khoản quản trị đầu tiên được tạo trong Supabase (xem docs/TRIEN-KHAI.md). Chỉ cấp quyền cho thành viên
          ban tổ chức.
        </p>
      </div>
    </div>
  );
}
