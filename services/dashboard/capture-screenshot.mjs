import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for animations to settle
  await page.waitForTimeout(2000);

  // Capture full page
  const screenshot = await page.screenshot({ fullPage: true });

  // Save to file
  const fs = await import('fs');
  fs.writeFileSync('/tmp/wise2-landing.png', screenshot);

  await browser.close();
  console.log('Screenshot saved to /tmp/wise2-landing.png');
})();
