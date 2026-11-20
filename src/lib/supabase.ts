import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Khóa công khai (anon key) được phép nằm trong mã frontend.
// Bảo mật thật nằm ở Row Level Security trong supabase/schema.sql.
// TUYỆT ĐỐI không đặt service_role key ở đây.
const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const hasSupabase = Boolean(url && anonKey && url.startsWith('http'));

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Chưa cấu hình Supabase. Hãy điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env');
  }
  return supabase;
}
