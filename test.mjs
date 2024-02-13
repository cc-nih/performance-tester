// test.mjs
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { URL } from 'url';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.wikipedia.org/'); // URL of the website to test

  const report = await lighthouse(page.url(), {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'html',
    logLevel: 'info',
    onlyCategories: ['performance']
  });

  console.log('Lighthouse report is generated for', report.lhr.finalUrl);
  console.log('Performance score:', report.lhr.categories.performance.score * 100);

  await browser.close();
})();
