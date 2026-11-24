import { expect, test } from '@playwright/test';

test('opens the client as the supplied Webin account without retaining the fragment', async ({
  page,
}) => {
  const token = `e30.${Buffer.from(
    JSON.stringify({
      username: 'Webin-12345',
      exp: Math.floor(Date.now() / 1000) + 600,
      token_type: 'sliding',
    })
  ).toString('base64url')}.signature`;

  await page.route('**/auth/sliding/refresh', (route) =>
    route.fulfill({ json: { token, token_type: 'sliding' } })
  );
  await page.goto(`login?from=private-request#impersonation_token=${token}`);
  await expect(page.getByText('You are logged in as')).toContainText(
    'Webin-12345'
  );
  await expect(page).toHaveURL(/\/login\?from=private-request$/);
  expect(
    await page.evaluate(() => localStorage.getItem('mgnify.v2.token'))
  ).toBe(token);
  await page.reload();
  await expect(page.getByText('You are logged in as')).toContainText(
    'Webin-12345'
  );
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page.getByLabel('Webin-ID:')).toBeVisible();
});
