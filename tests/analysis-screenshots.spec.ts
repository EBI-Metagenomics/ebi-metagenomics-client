import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const analyses = [
  { accession: 'MGYA01022581', version: '6', type: 'assembly' },
  { accession: 'MGYA01020458', version: '6', type: 'metagenomic' },
  { accession: 'MGYA01021240', version: '6', type: 'amplicon' },
  { accession: 'MGYA00589025', version: '5', type: 'assembly' },
  { accession: 'MGYA00795052', version: '5', type: 'metagenomics' },
  { accession: 'MGYA00429313', version: '5', type: 'amplicon' },
  { accession: 'MGYA00345682', version: '4.1', type: 'assembly' },
  { accession: 'MGYA00581843', version: '4.1', type: 'metagenomic' },
  { accession: 'MGYA00160062', version: '4.1', type: 'amplicon' },
  { accession: 'MGYA00139323', version: '4', type: 'assembly' },
  { accession: 'MGYA00135058', version: '4', type: 'metagenomic' },
  { accession: 'MGYA00135048', version: '4', type: 'amplicon' },
  { accession: 'MGYA00132146', version: '3', type: 'assembly' },
  { accession: 'MGYA00142024', version: '3', type: 'metagenomic' },
  { accession: 'MGYA00138745', version: '3', type: 'amplicon' },
  { accession: 'MGYA00005112', version: '2', type: 'metagenomic' },
  { accession: 'MGYA00013658', version: '2', type: 'amplicon' },
  { accession: 'MGYA00004369', version: '1', type: 'assembly' },
  { accession: 'MGYA00002634', version: '1', type: 'metagenomic' },
  { accession: 'MGYA00002792', version: '1', type: 'amplicon' },
];

for (const { accession, version, type } of analyses) {
  test(`take screenshots for ${accession} (v${version} ${type})`, async ({
    page,
  }) => {
    const relativeUrl = `v2-analyses/${accession}`;

    // Create screenshots directory if it doesn't exist
    const dirName = `v${version}_${type}_${accession}`;
    const screenshotDir = path.join(__dirname, '..', 'screenshots', dirName);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Set cookie to accept cookies and avoid the banner
    await page.context().addCookies([
      {
        name: 'cookies-accepted',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto(`${relativeUrl}/overview`);

    // Wait for tabs to be visible
    await page.waitForSelector('.vf-tabs__list');

    // Get all tab links
    const tabLinks = page.locator('.vf-tabs__link');
    const count = await tabLinks.count();
    console.log(`Found ${count} tabs for ${accession}.`);

    const tabNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await tabLinks.nth(i).innerText();
      tabNames.push(
        name
          .trim()
          .replace(/\//g, '_')
          .replace(/\s+/g, '_')
          .toLowerCase()
      );
    }

    for (let i = 0; i < count; i++) {
      const tabName = tabNames[i];
      console.log(`Processing tab: ${tabName} for ${accession}`);

      await tabLinks.nth(i).click();

      // Wait for some content to load or just wait a bit for animations
      // Using a combination of timeout and waiting for network idle if possible
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({
        path: path.join(screenshotDir, `${tabName}.png`),
        fullPage: true,
      });

      // Check for subtabs (buttons with mg-button-as-tab class)
      const subtabButtons = page.locator('.mg-button-as-tab');
      const subtabCount = await subtabButtons.count();
      if (subtabCount > 0) {
        console.log(`Found ${subtabCount} subtabs for ${tabName}`);
        const subtabNames: string[] = [];
        for (let j = 0; j < subtabCount; j++) {
          const name = await subtabButtons.nth(j).innerText();
          subtabNames.push(
            name
              .trim()
              .replace(/\//g, '_')
              .replace(/\s+/g, '_')
              .toLowerCase()
          );
        }

        for (let j = 0; j < subtabCount; j++) {
          const subtabName = subtabNames[j];
          console.log(`Processing subtab: ${subtabName} for ${tabName}`);
          await subtabButtons.nth(j).click();
          await page.waitForTimeout(2000);
          await page.screenshot({
            path: path.join(screenshotDir, `${tabName}_${subtabName}.png`),
            fullPage: true,
          });
        }
      }
    }
  });
}
