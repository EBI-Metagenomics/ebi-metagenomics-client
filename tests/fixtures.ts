import { test as base, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const test = base.extend<{
  mockApi: (route: string, fixturePath: string) => Promise<void>;
  mockApiWithData: (route: string, data: any) => Promise<void>;
}>({
  mockApi: async ({ page }, use) => {
    await use(async (route: string, fixturePath: string) => {
      const fullPath = path.join(__dirname, '..', 'cypress', 'fixtures', fixturePath);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      await page.route(route, async (r) => {
        await r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        });
      });
    });
  },
  mockApiWithData: async ({ page }, use) => {
    await use(async (route: string, data: any) => {
      await page.route(route, async (r) => {
        await r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        });
      });
    });
  },
});

export { expect };

export async function acceptCookies(page: Page) {
  await page.context().addCookies([
    {
      name: 'cookies-accepted',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
  ]);
}
