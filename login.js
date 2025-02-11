const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  const usernames = process.env.USERNAMES.split(',');
  const passwords = process.env.PASSWORDS.split(',');

  for (let i = 0; i < usernames.length; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://client.webhostmost.com/login');
      await page.fill('input[name="username"]', usernames[i]);
      await page.fill('input[name="password"]', passwords[i]);
      await page.click('button[type="submit"]');
      
      // 检查页面跳转是否成功
      await page.waitForURL('https://client.webhostmost.com/clientarea.php', { timeout: 60000 });

      console.log(`用户 ${usernames[i]} 登录成功！`);

      // 推送成功消息
      await page.goto(`https://php.hipjs.cloudns.org/api/wxpush.php?txt1=用户 ${usernames[i]} 登录成功！`);

    } catch (error) {
      console.error(`用户 ${usernames[i]} 登录失败：`, error);

      // 推送失败消息
      await page.goto(`https://php.hipjs.cloudns.org/api/wxpush.php?txt1=用户 ${usernames[i]} 登录失败！`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
})();
