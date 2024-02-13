// Use the command node runTests.js [NUMBER_OF_CONCURRENT_USERS], 
// replacing [NUMBER_OF_CONCURRENT_USERS] with the number of concurrent users you want to simulate.
// For example, node runTests.js 5 will run 5 Nightwatch instances concurrently, followed by Lighthouse analysis.

const { exec } = require('child_process');
const path = require('path');

// Function to run a single Nightwatch test instance
function runNightwatchInstance(instanceNumber) {
  return new Promise((resolve, reject) => {
    exec(`npx nightwatch`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error in Nightwatch instance ${instanceNumber}:`, error);
        return reject(error);
      }
      console.log(`Nightwatch instance ${instanceNumber} output:\n`, stdout);
      resolve();
    });
  });
}

// Function to run multiple Nightwatch instances concurrently
async function runNightwatchConcurrently(concurrentUsers) {
  const promises = [];
  for (let i = 1; i <= concurrentUsers; i++) {
    promises.push(runNightwatchInstance(i));
  }
  await Promise.all(promises);
}

// Function to run Lighthouse
function runLighthouse() {
  const url = 'https://www.wikipedia.org/';
  const reportPath = path.join(__dirname, `lighthouse_report.html`);

  return new Promise((resolve, reject) => {
    exec(`npx lighthouse ${url} --output html --output-path ${reportPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Lighthouse:`, error);
        return reject(error);
      }
      console.log(`Lighthouse report generated at ${reportPath}`);
      resolve();
    });
  });
}

// Main function to run the tests
async function runTests() {
  const concurrentUsers = parseInt(process.argv[2]) || 1; // Default to 1 user if not specified

  try {
    await runNightwatchConcurrently(concurrentUsers);
    await runLighthouse();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
