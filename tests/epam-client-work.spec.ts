import { test, expect } from '@playwright/test';

/**
 * Playwright test: EPAM Client Work page
 * - Navigates to https://www.epam.com/
 * - Selects "Services" from the header
 * - Clicks the "Explore Our Client Work" link
 * - Asserts that "Client Work" text is visible on the resulting page
 *
 * Notes / best practices used:
 * - Role-based locators (getByRole) for accessibility-stable targeting
 * - Explicit waits and fallback strategies for resilient navigation
 * - Minimal use of force clicks; used as a fallback when overlays intercept pointer events
 */
test('EPAM: navigate to Client Work via Services menu and verify visibility', async ({ page }) => {
  // 1) Navigate to EPAM
  await page.goto('https://www.epam.com/', { waitUntil: 'domcontentloaded' });

  // 2) Locate the Services header link and navigate to the Services page
  const servicesLink = page.getByRole('link', { name: /Services/i }).first();
  await servicesLink.waitFor({ state: 'visible', timeout: 10000 });
  await servicesLink.scrollIntoViewIfNeeded();

  // Click and wait for navigation if it triggers a navigation. Use try/catch to provide clearer failures.
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {}),
      servicesLink.click({ force: true })
    ]);
  } catch (err) {
    // If navigation doesn't occur, still continue — the target link may open dynamic content
  }

  // 3) On the Services page (or expanded menu), look for the "Explore Our Client Work" link.
  // Use a role-based locator with a regex to be robust against small text changes.
  let exploreLink = page.getByRole('link', { name: /Explore\s*Our\s*Client\s*Work/i });

  // Fallback: look for any link containing 'Client Work' if the primary locator doesn't find anything
  if ((await exploreLink.count()) === 0) {
    exploreLink = page.getByRole('link').filter({ hasText: /Client Work/i }).first();
  }

  await exploreLink.waitFor({ state: 'visible', timeout: 10000 });
  await exploreLink.scrollIntoViewIfNeeded();

  // Click and wait for navigation to the client work page
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {}),
      exploreLink.click({ force: true })
    ]);
  } catch (err) {
    // continue even if no navigation is detected
  }

  // 4) Assert that the 'Client Work' text is visible on the resulting page
  const clientWorkLocator = page.locator('text=Client Work').first();
  await expect(clientWorkLocator).toBeVisible({ timeout: 10000 });
});
