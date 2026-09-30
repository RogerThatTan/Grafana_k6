import { browser } from 'k6/browser';
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 4 or 5 -> put load on url get call - 100 users, url browser

  scenarios: {
    ui: {
      executor: 'shared-iterations',
      exec: 'browserTest',
      vus: 2,
      maxDuration: '1m',
      iterations: 4,
      options: {
        browser: {
          type: 'chromium',
          headless: false,
        },
      },
    },

    backEndStress: {
      executor: 'constant-vus',
      exec: 'backEndStress',
      vus: 10,
      duration: '1m',
    },
  },

  thresholds: {
    checks: ['rate == 1.0'],
  },
};

export async function browserTest() {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://rahulshettyacademy.com/locatorspractice/');
  await page.locator('#inputUsername').type('rahul');
  console.log(`Filling Password....`);
  await page.locator("input[placeholder='Password]").type('rahulshettyacademy');
  console.log(`Submitiing Form....`);
  await page.locator("button[type='submit']").click();
  console.log(`Navigation Completed....`);
  await page.waitForTimeout(2000);

  const headerText = await page.locator('h1').first().textContent();
  check(headerText, {
    header: (headerText) => {
      return headerText.includes('Rahul Shetty ');
    },
  });

  await page.close();
}

export async function backEndStress() {
  const res = http.get('https://rahulshettyacademy.com/locatorspractice/');

  check(res, {
    'status is 200': () => res.status === 200,
  });
}
