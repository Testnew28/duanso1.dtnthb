import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:5183';
const OUT = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\kilo\\shots';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const consoleErrors = [];
const pageErrors = [];

function ok(name, condition, extra = '') {
  log.push(`${condition ? 'PASS' : 'FAIL'} | ${name}${extra ? ' | ' + extra : ''}`);
  if (!condition) console.log(`❌ ${name} ${extra}`);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1000'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // 1) Trang chủ
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1');
  const homeText = await page.$eval('body', (b) => b.innerText);
  ok('Trang chủ hiển thị', homeText.includes('Hương sắc núi rừng'));
  ok('Trang chủ có 4 trụ cột STEM', ['Science', 'Technology', 'Engineering', 'Math'].every((s) => homeText.includes(s)));

  // 2) Cửa hàng
  await page.goto(BASE + '/cua-hang', { waitUntil: 'networkidle2' });
  await page.waitForSelector('article[id^="product-"]');
  const cardCount = await page.$$eval('article[id^="product-"]', (els) => els.length);
  ok('Cửa hàng có 34 sản phẩm', cardCount === 34, `count=${cardCount}`);

  // tìm kiếm không dấu
  const search = await page.$('input[type="search"]');
  await search.type('mang');
  await new Promise((r) => setTimeout(r, 700));
  const searchText = await page.$eval('body', (b) => b.innerText);
  ok('Tìm "mang" ra Măng', searchText.includes('Măng nứa') || searchText.includes('Măng khô') || searchText.includes('Măng vầu'));
  const filteredCount = await page.$$eval('article[id^="product-"]', (els) => els.length);
  ok('Lọc không dấu thu hẹp kết quả', filteredCount > 0 && filteredCount < 34, `count=${filteredCount}`);

  // xóa tìm kiếm
  await page.$eval('input[type="search"]', (el) => {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 500));

  // 3) Thêm vào giỏ từ thẻ
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Thêm vào giỏ'));
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const headerText = await page.$eval('header', (h) => h.innerText);
  ok('Nút thêm vào giỏ hoạt động', headerText.includes('1'), headerText.replace(/\n/g, ' '));

  // 4) Trang giỏ hàng
  await page.goto(BASE + '/dat-hang', { waitUntil: 'networkidle2' });
  const checkoutText = await page.$eval('body', (b) => b.innerText);
  ok('Giỏ hàng có sản phẩm', checkoutText.includes('Tóm tắt đơn hàng') && checkoutText.includes('Tổng thanh toán'));
  await page.screenshot({ path: OUT + '\\checkout.png' });

  // 5) Sang bước nhập thông tin rồi điền
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Tiếp tục nhập thông tin'));
    btn?.click();
  });
  await page.waitForSelector('#customerName', { timeout: 5000 });
  await page.type('#customerName', 'Nguyễn Thị Lan');
  await page.type('#phone', '0912345678');
  await page.type('#classUnit', '11A1');
  const step2 = await page.$eval('body', (b) => b.innerText);
  ok('Sang bước thông tin', step2.includes('Thông tin người nhận'));

  // Gửi đơn ngay từ bước thông tin (luồng 2 bước, không trang xác nhận trung gian)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Đặt hàng & nhận mã đơn'));
    btn?.click();
  });
  await page.waitForFunction(() => location.pathname.startsWith('/don-hang/'), { timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
  const successText = await page.$eval('body', (b) => b.innerText);
  const codeMatch = successText.match(/HSXM-[A-Z0-9]{6}/);
  ok('Đặt hàng tạo mã đơn', Boolean(codeMatch), codeMatch?.[0] || '');
  ok('Trang thành công hiển thị', successText.includes('Đặt hàng thành công') || successText.includes('Mã đơn hàng'));
  await page.screenshot({ path: OUT + '\\order-success.png' });

  // 7) Tra cứu
  await page.goto(BASE + '/tra-cuu', { waitUntil: 'networkidle2' });
  if (codeMatch) {
    await page.type('#order-code', codeMatch[0]);
    await page.type('#order-phone', '0912345678');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Tra cứu đơn'));
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    const lookupText = await page.$eval('body', (b) => b.innerText);
    ok('Tra cứu đơn theo SĐT + mã', lookupText.includes('Nguyễn Thị Lan'), codeMatch[0]);
  }

  // 8) Trang khoa học
  await page.goto(BASE + '/khoa-hoc', { waitUntil: 'networkidle2' });
  const scienceText = await page.$eval('body', (b) => b.innerText);
  ok('Trang khoa học có thẻ lật', scienceText.includes('Lên men lactic') && scienceText.includes('hoạt độ nước'));

  // 9) Tạo sản phẩm mới (chế độ A)
  await page.goto(BASE + '/cua-hang', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Tạo thêm sản phẩm theo yêu cầu'));
    btn?.click();
  });
  await page.waitForSelector('#create-product-form', { timeout: 5000 });
  await page.type('#p-name', 'Bánh ít lá gai xứ Mường');
  await page.select('#p-category', 'tuoi-song');
  await page.select('#p-district', 'Huyện Lạc Sơn');
  await page.type('#p-commune', 'Xã Yên Phú');
  await page.type('#p-unit', 'Chục 10 chiếc');
  await page.type('#p-market-min', '30000');
  await page.type('#p-market-max', '35000');
  await page.type('#p-import', '20000');
  await page.type('#p-price', '27000');
  await page.type('#p-stock', '20');
  await page.type('#p-safety', 'Nguyên liệu địa phương, gói lá chuối tươi trong ngày, không chất bảo quản.');
  await page.type('#p-nutrition', 'Giàu chất xơ, năng lượng 250 kcal/100g.');
  await page.type('#p-storage', 'Dùng trong 2 ngày, bảo quản ngăn mát.');
  await page.type('#p-requester', 'Trần Văn Minh');
  await page.type('#p-phone', '0987654321');
  await page.click('#p-commitment');
  await page.screenshot({ path: OUT + '\\create-form.png', fullPage: false });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Lưu & đưa sản phẩm lên gian hàng'));
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 2500));
  const shopAfter = await page.$eval('body', (b) => b.innerText);
  ok('Sản phẩm mới xuất hiện trên kệ', shopAfter.includes('Bánh ít lá gai xứ Mường'));
  ok('Sản phẩm mới có nhãn đặt trước', shopAfter.includes('Đặt trước') || shopAfter.includes('Chờ xác nhận nguồn cung'));
  await page.screenshot({ path: OUT + '\\shop-after-create.png' });

  const newCount = await page.$$eval('article[id^="product-"]', (els) => els.length);
  ok('Số sản phẩm tăng lên 35', newCount === 35, `count=${newCount}`);

  // 10) Bảng dự toán tự thêm dòng
  await page.goto(BASE + '/khao-sat-gia', { waitUntil: 'networkidle2' });
  const pricingAfter = await page.$eval('body', (b) => b.innerText);
  ok('Dự toán có sản phẩm mới', pricingAfter.includes('Bánh ít lá gai xứ Mường'));
  const rows = await page.$$eval('tbody tr', (els) => els.length);
  ok('Bảng dự toán có 35 dòng', rows === 35, `rows=${rows}`);
  const newTotals = pricingAfter.match(/Doanh thu dự toán|LỢI NHUẬN RÒNG/);
  ok('Tổng dự toán vẫn hiển thị', Boolean(newTotals));

  // 11) Admin login
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle2' });
  const adminText = await page.$eval('body', (b) => b.innerText);
  ok('Trang admin yêu cầu đăng nhập', adminText.includes('Trang quản trị ban tổ chức'));
  await page.type('#admin-email', 'ban-to-chuc@huongsac.local');
  await page.type('#admin-password', 'HuongSac@2026');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Đăng nhập'));
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const dash = await page.$eval('body', (b) => b.innerText);
  ok('Đăng nhập admin thành công', dash.includes('Bảng điều khiển ban tổ chức'));
  await page.screenshot({ path: OUT + '\\admin.png' });

  // 12) Đơn hàng hiện trong admin
  ok('Admin thấy đơn vừa đặt', dash.includes('Nguyễn Thị Lan') || dash.includes('HSXM-'));

  // 13) Đổi trạng thái đơn
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Đã xác nhận');
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const afterStatus = await page.$eval('body', (b) => b.innerText);
  ok('Đổi trạng thái đơn hoạt động', afterStatus.includes('Đã xác nhận'));

  // 14) Tab sản phẩm + sửa giá
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Sản phẩm');
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  const prodTab = await page.$eval('body', (b) => b.innerText);
  // Tiêu đề cột được CSS viết hoa (text-transform) nên so sánh không phân biệt hoa thường
  const prodTabLower = prodTab.toLowerCase();
  const adminRows = await page.$$eval('table tbody tr', (els) => els.length);
  ok(
    'Tab sản phẩm mở',
    prodTabLower.includes('trạng thái') && prodTabLower.includes('thao tác') && adminRows >= 34,
    `rows=${adminRows}`,
  );

  // 15) Tab cấu hình
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cấu hình');
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  const cfg = await page.$eval('body', (b) => b.innerText);
  ok('Tab cấu hình mở', cfg.includes('Chi phí vận chuyển'));

  // 16) Tab báo cáo
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Báo cáo');
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  const report = await page.$eval('body', (b) => b.innerText);
  ok('Tab báo cáo mở', report.includes('Doanh thu thực tế'));

  // 17) Mobile render
  await page.setViewport({ width: 360, height: 780 });
  await page.goto(BASE + '/cua-hang', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: OUT + '\\shop-mobile.png' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok('Không tràn ngang trên 360px', overflow <= 2, `overflow=${overflow}`);
} catch (err) {
  log.push('ERROR | ' + (err?.stack || err));
  console.log(err);
} finally {
  await browser.close();
}

fs.writeFileSync(OUT + '\\e2e.log', log.join('\n'), 'utf8');
console.log(log.join('\n'));
console.log('--- console errors ---');
console.log(consoleErrors.slice(0, 15).join('\n') || '(none)');
console.log('--- page errors ---');
console.log(pageErrors.slice(0, 15).join('\n') || '(none)');
