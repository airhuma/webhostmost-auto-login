const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  const usernames = process.env.USERNAMES?.split(',') || [];
  const passwords = process.env.PASSWORDS?.split(',') || [];

  if (usernames.length !== passwords.length) {
    console.error("用户名和密码数量不匹配");
    return;
  }

  for (let i = 0; i < usernames.length; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      console.log(`尝试登录用户：${usernames[i]}`);
      await page.goto('https://client.webhostmost.com/login', { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await page.fill('input[name="username"]', usernames[i]);
      await page.fill('input[name="password"]', passwords[i]);

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }), // 等待页面加载
        page.click('button[type="submit"]')
      ]);

      // 打印当前 URL，检查是否真的跳转了
      console.log(`当前页面 URL: ${page.url()}`);

      if (page.url().includes('clientarea.php')) {
        console.log(`✅ 用户 ${usernames[i]} 登录成功！`);
      } else {
        // 检查页面是否有错误提示
        const errorMessage = await page.locator('div.error-message').textContent();
        throw new Error(errorMessage ? `登录失败: ${errorMessage}` : "登录失败，未跳转到 clientarea.php");
      }

    } catch (error) {
      console.error(`❌ 用户 ${usernames[i]} 登录失败:`, error.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
})();
