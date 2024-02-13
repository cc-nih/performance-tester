// test.mjs
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { URL } from 'url';
import fs from 'fs';

(async () => {
  // Define the target URL; defaults to 'https://www.wikipedia.org/' if not specified in the command line
  const targetUrl = process.argv[2] || 'https://www.wikipedia.org/';
  
  // Initialize Puppeteer browser
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    // Open a new page
    const page = await browser.newPage();
    await page.goto(targetUrl);

    // Run Lighthouse
    const report = await lighthouse(targetUrl, {
      port: (new URL(browser.wsEndpoint())).port,
      output: 'html',
      logLevel: 'info',
      onlyCategories: ['performance']
    });

    // Save the Lighthouse report to a file
    const reportHtml = report.report;
    fs.writeFileSync('lighthouse_report.html', reportHtml);
    console.log('Lighthouse report saved as lighthouse_report.html');

    // Log the final URL and performance score
    console.log('Lighthouse report is generated for', report.lhr.finalUrl);
    console.log('Performance score:', report.lhr.categories.performance.score * 100);

    // Extract and display key performance metrics
    const performanceMetrics = {
      'First Contentful Paint': report.lhr.audits['first-contentful-paint'].displayValue,
      'Speed Index': report.lhr.audits['speed-index'].displayValue,
      // Add other relevant metrics here
    };
    console.table(performanceMetrics);

    // Take and save a screenshot
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot saved as screenshot.png');
  } catch (error) {
    // Error handling
    console.error('Error occurred:', error);
  } finally {
    // Ensure the browser is closed
    if (browser) {
      await browser.close();
    }
  }
})();
