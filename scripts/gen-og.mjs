// Sinh public/og-image.png (1200×630) bằng Chrome headless.
// Chạy: node scripts/gen-og.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(process.cwd(), 'public', 'og-image.png');

const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8" />
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;font-family:"Segoe UI",system-ui,sans-serif}
  .wrap{position:relative;width:1200px;height:630px;background:
    radial-gradient(1100px 520px at 88% -10%, #2F7550 0%, transparent 62%),
    radial-gradient(700px 420px at 4% 108%, #1A4A32 0%, transparent 60%),
    linear-gradient(135deg,#102B1F 0%,#163C2A 46%,#1F5B3D 100%);
    color:#FBF6EA;display:flex;flex-direction:column;justify-content:center;padding:0 76px}
  .glow{position:absolute;width:520px;height:520px;border-radius:50%;right:-140px;top:-120px;
    background:radial-gradient(circle,rgba(232,160,32,.42),transparent 66%)}
  .glow2{position:absolute;width:360px;height:360px;border-radius:50%;left:-90px;bottom:-120px;
    background:radial-gradient(circle,rgba(143,191,90,.20),transparent 70%)}
  .kicker{position:relative;display:inline-flex;align-items:center;gap:12px;font-size:21px;
    letter-spacing:.22em;text-transform:uppercase;color:#FADFA4;font-weight:700}
  .kicker:before{content:"";width:46px;height:2px;background:#E8A020}
  h1{position:relative;font-family:Georgia,"Times New Roman",serif;font-size:104px;line-height:1.02;
    margin-top:22px;letter-spacing:-.02em;text-shadow:0 6px 26px rgba(0,0,0,.28)}
  h1 span{color:#E8A020}
  p{position:relative;margin-top:26px;font-size:29px;line-height:1.42;color:rgba(251,246,234,.86);max-width:820px}
  .chips{position:relative;display:flex;gap:14px;margin-top:38px}
  .chip{border:1px solid rgba(251,246,234,.32);background:rgba(251,246,234,.10);
    padding:12px 22px;border-radius:999px;font-size:21px;font-weight:600}
  .mark{position:absolute;right:78px;bottom:64px;width:190px;height:190px;opacity:.95}
  .foot{position:absolute;left:76px;bottom:52px;font-size:19px;color:rgba(251,246,234,.55);letter-spacing:.02em}
</style></head>
<body><div class="wrap">
  <div class="glow"></div><div class="glow2"></div>
  <div class="kicker">Hội chợ Dinh dưỡng · Hòa Bình</div>
  <h1>Hương Sắc<br/><span>Xứ Mường</span></h1>
  <p>34 sản vật nội địa Hòa Bình – cam Cao Phong, bưởi đỏ Tân Lạc, mật ong Đà Bắc, gạo nếp nương Mai Châu.</p>
  <div class="chips">
    <span class="chip">Đặt online</span>
    <span class="chip">Giá minh bạch</span>
    <span class="chip">Nhận tại trường</span>
  </div>
  <div class="foot">Trường PT DTNT THPT Hòa Bình</div>
  <svg class="mark" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="30" r="15" fill="#E8A020"/>
    <path d="M32 15c4 6 4 12 0 15-4-3-4-9 0-15Z" fill="#8FBF5A"/>
    <path d="M20 46c4-8 9-12 12-13 3 1 8 5 12 13" fill="none" stroke="#FBF6EA" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="2.2" fill="#FBF6EA" opacity=".85"/>
    <circle cx="40" cy="35" r="2.2" fill="#FBF6EA" opacity=".85"/>
  </svg>
</div></body></html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 400));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`Đã tạo ${OUT} (${kb} KB, 1200×630)`);
