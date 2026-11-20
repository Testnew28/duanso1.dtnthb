import type { AdminUser } from '@/types';
import { hasSupabase, supabase } from './supabase';
import { readJSON, writeJSON } from './localStore';

// Đăng nhập quản trị.
// - Có Supabase: dùng Supabase Auth + bảng `admins` (RLS bảo vệ).
// - Chưa có Supabase: mật khẩu lấy từ VITE_LOCAL_ADMIN_PASSWORD (mặc định bên dưới).

const LOCAL_SESSION = 'hsxm:admin:v1';
const LOCAL_DEFAULT_EMAIL = 'ban-to-chuc@huongsac.local';

export async function getAdminSession(): Promise<AdminUser | null> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const { data: admin } = await supabase
      .from('admins')
      .select('email, full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!admin) return null;
    return {
      email: admin.email || user.email || '',
      name: admin.full_name || 'Ban tổ chức',
    };
  }
  return readJSON<AdminUser | null>(LOCAL_SESSION, null);
}

export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes('invalid')) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }
      throw new Error(error.message);
    }
    const user = data.user;
    if (!user) throw new Error('Không đăng nhập được.');

    const { data: admin } = await supabase
      .from('admins')
      .select('email, full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      throw new Error('Tài khoản này chưa được cấp quyền quản trị. Liên hệ ban tổ chức.');
    }
    return { email: admin.email || user.email || '', name: admin.full_name || 'Ban tổ chức' };
  }

  // Chế độ local
  const expected = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD || 'HuongSac@2026';
  if (!password) throw new Error('Vui lòng nhập mật khẩu.');
  if (password !== expected) throw new Error('Mật khẩu không đúng.');
  const user: AdminUser = {
    email: email.trim() || LOCAL_DEFAULT_EMAIL,
    name: 'Ban tổ chức Hội chợ',
  };
  writeJSON(LOCAL_SESSION, user);
  return user;
}

export async function signOutAdmin(): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(LOCAL_SESSION);
}

export { LOCAL_DEFAULT_EMAIL };
