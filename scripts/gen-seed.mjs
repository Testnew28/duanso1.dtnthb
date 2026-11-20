// Sinh supabase/seed.sql từ src/data/products.ts
// Chạy: node scripts/gen-seed.mjs
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const tmp = path.join(os.tmpdir(), `hsxm-seed-${Date.now()}.mjs`);

await esbuild.build({
  entryPoints: [path.join(root, 'src/data/products.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: tmp,
  logLevel: 'error',
});

const { SEED_PRODUCTS } = await import(`file://${tmp.replace(/\\/g, '/')}`);

const q = (v) => `'${String(v ?? '').replace(/'/g, "''")}'`;
const arr = (list) => `array[${(list || []).map(q).join(', ')}]::text[]`;
const num = (n) => String(Math.round(Number(n) || 0));

const cols = [
  'id',
  'slug',
  'name',
  'category_id',
  'district',
  'commune',
  'ethnicities',
  'image_alt',
  'description',
  'nutrition',
  'safety',
  'storage',
  'unit',
  'market_min',
  'market_max',
  'import_price',
  'price',
  'stock',
  'featured',
  'certs',
];

const values = SEED_PRODUCTS.map((p) =>
  [
    q(p.id),
    q(p.slug),
    q(p.name),
    q(p.categoryId),
    q(p.district),
    q(p.commune),
    arr(p.ethnicities),
    q(p.imageAlt),
    q(p.description),
    q(p.nutrition),
    q(p.safety),
    q(p.storage),
    q(p.unit),
    num(p.marketMin),
    num(p.marketMax),
    num(p.importPrice),
    num(p.price),
    num(p.stock),
    p.featured ? 'true' : 'false',
    arr(p.certs),
  ].join(', '),
);

const totals = SEED_PRODUCTS.reduce(
  (acc, p) => {
    acc.qty += p.stock;
    acc.revenue += p.price * p.stock;
    acc.cost += p.importPrice * p.stock;
    return acc;
  },
  { qty: 0, revenue: 0, cost: 0 },
);

const fmt = (n) => n.toLocaleString('vi-VN');

const sql = `-- ============================================================
-- HƯƠNG SẮC XỨ MƯỜNG – DỮ LIỆU MẪU 34 SẢN PHẨM
-- Sinh tự động từ src/data/products.ts – KHÔNG sửa tay file này.
-- Chạy SAU khi đã chạy supabase/schema.sql.
--
-- Kiểm tra sau khi chạy:
--   select count(*) from public.products;              -- 34
--   select sum(stock), sum(price*stock), sum(import_price*stock) from public.products;
--   → ${fmt(totals.qty)} đơn vị · doanh thu ${fmt(totals.revenue)} đ · vốn ${fmt(totals.cost)} đ
-- ============================================================

insert into public.products (${cols.join(', ')})
values
${values.map((v) => `  (${v})`).join(',\n')}
on conflict (id) do nothing;

-- Cho phép chạy lại nhiều lần mà không nhân đôi dữ liệu.
-- Muốn nạp lại từ đầu: delete from public.products where source = 'default';
`;

const out = path.join(root, 'supabase', 'seed.sql');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, sql, 'utf8');
fs.unlinkSync(tmp);

console.log(`Đã tạo ${out}`);
console.log(`Sản phẩm: ${SEED_PRODUCTS.length} | SL: ${fmt(totals.qty)} | DT: ${fmt(totals.revenue)} | Vốn: ${fmt(totals.cost)}`);
