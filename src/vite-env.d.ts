/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_LOCAL_ADMIN_PASSWORD?: string;
  readonly VITE_BANK_BIN?: string;
  readonly VITE_BANK_ACCOUNT_NO?: string;
  readonly VITE_BANK_ACCOUNT_NAME?: string;
  readonly VITE_BANK_NAME?: string;
  readonly VITE_MAP_EMBED_URL?: string;
  readonly VITE_TELEGRAM_ENABLED?: string;
  readonly VITE_HOTLINE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
