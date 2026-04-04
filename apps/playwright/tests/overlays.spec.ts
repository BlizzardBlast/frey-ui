import { expect, type Page, test } from '@playwright/test';

async function gotoStory(storyId: string, page: Page) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
}

test.describe('overlay stories', () => {
  test('dialog opens and closes', async ({ page }) => {
    await gotoStory('stories-dialog--basic-dialog', page);

    await page.getByRole('button', { name: 'Open dialog' }).click();

    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Delete this project?' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('popover opens, portals, and closes on escape', async ({ page }) => {
    await gotoStory('stories-popover--basic-popover', page);

    await page.getByRole('button', { name: 'Open popover' }).click();

    await expect(page.getByText('Team Access')).toBeVisible();
    const portalContainer = page.locator('[data-frey-portal="true"]').last();
    await expect(portalContainer).toHaveClass(/frey-theme-provider/);

    await page.keyboard.press('Escape');
    await expect(page.getByText('Team Access')).toHaveCount(0);
  });

  test('dropdown menu supports keyboard navigation', async ({ page }) => {
    await gotoStory('stories-dropdownmenu--basic-menu', page);

    await page.getByRole('button', { name: 'Actions' }).click();

    const renameItem = page.getByRole('menuitem', { name: 'Rename' });
    const duplicateItem = page.getByRole('menuitem', { name: 'Duplicate' });

    await expect(renameItem).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(duplicateItem).toBeFocused();

    await duplicateItem.click();
    await expect(duplicateItem).toHaveCount(0);
  });

  test('tooltip appears on hover and closes on escape', async ({ page }) => {
    await gotoStory('stories-tooltip--basic-tooltip', page);

    const trigger = page.getByRole('button', { name: 'Hover or focus me' });
    await trigger.hover();

    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toContainText('Copy to clipboard');

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
  });

  test('drawer opens and closes', async ({ page }) => {
    await gotoStory('stories-drawer--basic-drawer', page);

    await page.getByRole('button', { name: 'Open drawer' }).click();

    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Workspace settings' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close drawer' }).click();
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('drawer closes on Escape and restores focus to trigger', async ({
    page
  }) => {
    await gotoStory('stories-drawer--basic-drawer', page);

    const trigger = page.getByRole('button', { name: 'Open drawer' });

    await trigger.click();
    await expect(page.locator('dialog[open]')).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('drawer placement variants render with expected placement attribute', async ({
    page
  }) => {
    await gotoStory('stories-drawer--placement-variants', page);

    for (const placement of ['left', 'right', 'top', 'bottom'] as const) {
      const trigger = page.getByRole('button', { name: `${placement} drawer` });

      await trigger.click();
      await expect(
        page.locator(`[data-placement='${placement}']`)
      ).toBeVisible();
      await expect(page.getByText(`Placement: ${placement}`)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('dialog[open]')).toHaveCount(0);
    }
  });
});
