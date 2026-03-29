import { expect, type Page, test } from '@playwright/test';

async function gotoStory(storyId: string, page: Page) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await expect(page.locator('#storybook-root')).toBeVisible({
    timeout: 15_000
  });
}

test.describe('component stories', () => {
  test.describe.configure({ mode: 'serial' });

  test('accordion content is hidden until expanded', async ({ page }) => {
    await gotoStory('stories-accordion--basic', page);

    const trigger = page.getByRole('button', { name: 'Is it accessible?' });
    const content = page.getByText(
      'Yes. It adheres to the WAI-ARIA design pattern',
      {
        exact: false
      }
    );

    await expect(content).toBeHidden();

    await trigger.click();

    await expect(content).toBeVisible();

    await trigger.click();

    await expect(content).toBeHidden();
  });

  test('controlled switch updates its visible state label', async ({
    page
  }) => {
    await gotoStory('stories-switch--controlled', page);

    const toggle = page.getByRole('switch', { name: 'Dark mode' });

    await expect(toggle).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('Switch is: OFF')).toBeVisible();

    await toggle.click();

    await expect(page.getByText('Switch is: ON')).toBeVisible();
  });

  test('controlled select updates selected value text', async ({ page }) => {
    await gotoStory('stories-select--controlled', page);

    const select = page.getByLabel('Permission level');

    await expect(select).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('Selected: owner')).toBeVisible();

    await select.selectOption('editor');

    await expect(page.getByText('Selected: editor')).toBeVisible();
  });

  test('theme provider stories expose expected data attributes', async ({
    page
  }) => {
    await gotoStory('stories-themeprovider--dark-theme', page);

    const darkThemeRoot = page.locator('[data-frey-theme]').first();

    await expect(darkThemeRoot).toHaveAttribute('data-frey-theme', 'dark');
    await expect(darkThemeRoot).toHaveAttribute(
      'data-frey-high-contrast',
      'false'
    );

    await gotoStory('stories-themeprovider--high-contrast', page);

    const highContrastRoot = page
      .locator('[data-frey-high-contrast="true"]')
      .first();

    await expect(highContrastRoot).toHaveAttribute(
      'data-frey-high-contrast',
      'true'
    );
  });
});
