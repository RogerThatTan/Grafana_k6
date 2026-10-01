# Web Vitals in Grafana k6

Web Vitals are browser measurements that describe how quickly a page loads, how soon it becomes useful, and whether it stays responsive and stable. In k6 browser tests, these values are collected as built-in browser metrics when a page is loaded.

The examples below use the login page from this project:

```javascript
await page.goto('https://rahulshettyacademy.com/locatorspractice/');
```

The thresholds are example targets, not universal rules. Choose targets that match your product and users.

## 1. FCP: First Contentful Paint

### What does it measure?

FCP is the time from navigation until the browser paints the first piece of content, such as text, an image, or a form. It answers:

> When does the user see something instead of a blank page?

### Real-life example

When a user opens a login page, the page background or the **Username** label appears after 1.2 seconds. That first visible content is the FCP event. A page with an FCP of 5 seconds feels slow even if the login form eventually works correctly.

### k6 example

```javascript
export const options = {
  scenarios: {
    loginPage: {
      executor: 'shared-iterations',
      vus: 2,
      iterations: 4,
      options: {
        browser: { type: 'chromium' },
      },
    },
  },
  thresholds: {
    // Keep the 95th percentile below two seconds.
    browser_web_vital_fcp: ['p(95)<2000'],
  },
};
```

## 2. LCP: Largest Contentful Paint

### What does it measure?

LCP is the time until the largest visible content element finishes rendering. It is usually a large heading, image, banner, or main form. It answers:

> When is the main content ready for the user?

### Real-life example

On an online store, the product hero image is the largest element above the fold. If the page shell appears quickly but the hero image takes 4 seconds, the user still experiences the page as slow. On the project login page, the main login form may be the important content to make visible quickly.

### k6 example

```javascript
export const options = {
  thresholds: {
    // A common "good" LCP target is 2.5 seconds or less.
    browser_web_vital_lcp: ['p(95)<2500'],
  },
};
```

## 3. CLS: Cumulative Layout Shift

### What does it measure?

CLS measures unexpected movement of visible content while the page is loading. It answers:

> Does the page jump while the user is reading or clicking?

CLS is a score, not a duration. A lower score is better.

### Real-life example

A user tries to click **Submit**, but an advertisement loads above the form and pushes the button down. The user clicks a different control by mistake. Reserving space for images, ads, and banners helps prevent this kind of layout shift.

### k6 example

```javascript
export const options = {
  thresholds: {
    // Keep the 95th percentile CLS score below 0.1.
    browser_web_vital_cls: ['p(95)<0.1'],
  },
};
```

## 4. FID/INP: Interaction to Next Paint

### What happened to FID?

FID (First Input Delay) measured the delay before the browser started handling a user's first interaction. It has been replaced by **INP**, which measures the responsiveness of interactions throughout the page visit. INP gives a better picture of what happens when users click, type, or tap more than once.

### What does it measure?

INP measures the time from a user interaction until the browser shows the next visual update. It answers:

> After I click or type, how quickly does the page respond visually?

### Real-life example

A user enters a username and clicks **Submit**. If heavy JavaScript keeps the browser busy for 2 seconds, the button appears not to work. The user may click it repeatedly, creating duplicate requests. Fast event handling and smaller JavaScript tasks improve INP.

### k6 example

```javascript
export const options = {
  thresholds: {
    // Example target for interaction responsiveness.
    browser_web_vital_inp: ['p(95)<200'],
  },
};
```

## 5. TTFB: Time to First Byte

### What does it measure?

TTFB is the time from the browser requesting a page until it receives the first byte from the server. It includes connection setup, request processing, and the time before the server begins sending a response. It answers:

> How quickly does the server begin responding?

### Real-life example

A user opens the login page. The browser shows nothing for 1.5 seconds because the server is waiting for a slow database query before sending the first response byte. Improving database queries, server capacity, caching, or network distance can reduce TTFB.

### k6 example

```javascript
export const options = {
  thresholds: {
    // Example target for the server's initial response.
    browser_web_vital_ttfb: ['p(95)<800'],
  },
};
```

## Complete threshold example

Put the Web Vitals thresholds together with the browser scenario in a test file:

```javascript
import { browser } from 'k6/browser';

export const options = {
  scenarios: {
    webVitals: {
      executor: 'shared-iterations',
      vus: 2,
      iterations: 4,
      options: {
        browser: { type: 'chromium' },
      },
    },
  },
  thresholds: {
    browser_web_vital_fcp: ['p(95)<2000'],
    browser_web_vital_lcp: ['p(95)<2500'],
    browser_web_vital_cls: ['p(95)<0.1'],
    browser_web_vital_inp: ['p(95)<200'],
    browser_web_vital_ttfb: ['p(95)<800'],
  },
};

export async function webVitals() {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://rahulshettyacademy.com/locatorspractice/');
  await page.locator('#inputUsername').type('rahul');
  await page.locator("input[placeholder='Password']").type('rahulshettyacademy');
  await page.locator("button[type='submit']").click();

  await page.close();
  await context.close();
}
```

## How to read the results

- **FCP and LCP:** lower milliseconds are better.
- **INP and TTFB:** lower milliseconds are better.
- **CLS:** a lower score is better; unexpected movement should be close to zero.
- **Percentiles:** `p(95)<2000` means 95% of measured values should be below 2,000 milliseconds.

Run a browser test and inspect the `browser_web_vital_*` metrics in the k6 output or Grafana dashboard. Always compare results across several runs because network conditions, browser startup, and the test environment can affect browser timings.
