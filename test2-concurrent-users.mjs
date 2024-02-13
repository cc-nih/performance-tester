// How to Run the Modified Script:
// To run the test for a specific number of concurrent users, use the command "node test2-concurrent-users.mjs [NUMBER_OF_USERS]". 
// Replace [NUMBER_OF_USERS] with the desired number of concurrent users.
// For example, "node test2-concurrent-users.mjs 5" will run the test for 5 concurrent users.
// If you don't specify a number, the script will default to 1 user.

// test.mjs
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { URL } from 'url';
import fs from 'fs';

// Function to run Lighthouse for a single user
async function runLighthouseForUser(userNumber) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.wikipedia.org/');

  const report = await lighthouse(page.url(), {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'html',
    logLevel: 'info',
    onlyCategories: ['performance']
  });

  console.log(`User ${userNumber}: Lighthouse report is generated for`, report.lhr.finalUrl);
  console.log(`User ${userNumber}: Performance score:`, report.lhr.categories.performance.score * 100);

  // Save the report for each user
  fs.writeFileSync(`lighthouse_report_user_${userNumber}.html`, report.report);

  await browser.close();
}

(async () => {
  try {
    // Retrieve the number of concurrent users from the command line arguments
    const concurrentUsers = parseInt(process.argv[2]) || 1; // Default to 1 user if not specified

    // Running instances of the Lighthouse test in parallel
    const userPromises = [];
    for (let i = 1; i <= concurrentUsers; i++) {
      userPromises.push(runLighthouseForUser(i));
    }

    await Promise.all(userPromises);
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();
