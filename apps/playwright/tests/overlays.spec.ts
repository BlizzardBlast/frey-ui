import { expect, type Page, test } from '@playwright/test';
import { getOutlineGeometry } from './focus-geometry.js';

async function gotoStory(storyId: string, page: Page) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await expect(page.locator('#storybook-root')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    /^(light|dark)$/
  );
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
    page,
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
    page,
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

  test('command palette closes after arrow traversal and Enter selection', async ({
    page,
  }) => {
    await gotoStory('stories-commandpalette--basic-command-palette', page);

    const trigger = page.getByRole('button', {
      name: 'Open command palette',
    });

    await trigger.click();
    await expect(page.locator('dialog[open]')).toHaveCount(1);

    const input = page.getByRole('combobox', { name: 'Search commands' });
    await input.click();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('command palette closes on Escape and restores trigger focus', async ({
    page,
  }) => {
    await gotoStory('stories-commandpalette--basic-command-palette', page);

    const trigger = page.getByRole('button', {
      name: 'Open command palette',
    });

    await trigger.click();
    await expect(page.locator('dialog[open]')).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('date picker opens by keyboard, selects one ISO value, submits, and clears', async ({
    page,
  }) => {
    await gotoStory('stories-datepicker--browser-proof', page);

    const group = page.getByRole('group', { name: 'Browser picker date' });
    const month = group.getByRole('spinbutton', { name: 'Month' });
    await page.keyboard.press('Tab');
    await expect(month).toBeFocused();
    const segmentGeometry = await getOutlineGeometry(month);
    expect(segmentGeometry.style).toBe('solid');
    expect(segmentGeometry.paintOutset).toBe(0);

    const trigger = group.locator('button[aria-haspopup="dialog"]');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', {
      name: 'Browser picker date calendar',
    });
    const grid = dialog.getByRole('grid', {
      name: 'Browser picker date calendar',
    });
    await expect(dialog).toBeVisible();
    await expect(grid).toBeVisible();
    const selected = grid.locator('button[data-date-value="2024-03-20"]');
    await expect(selected).toBeFocused();
    const calendarGeometry = await getOutlineGeometry(selected);
    expect(calendarGeometry.style).toBe('solid');
    expect(calendarGeometry.paintOutset).toBe(0);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText('Current picker ISO: 2024-03-21')).toBeVisible();
    await expect(trigger).toBeFocused();

    await page.getByRole('button', { name: 'Submit picker date' }).click();
    await expect(
      page.getByText('Submitted picker ISO: 2024-03-21')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Clear date' }).click();
    await expect(page.getByText('Current picker ISO: empty')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Choose date' })
    ).toBeVisible();
  });

  test('date picker Escape and outside dismissal both restore trigger focus', async ({
    page,
  }) => {
    await gotoStory('stories-datepicker--browser-proof', page);
    const trigger = page
      .getByRole('group', { name: 'Browser picker date' })
      .locator('button[aria-haspopup="dialog"]');

    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('date picker blocks unavailable dates and keeps read-only values immutable', async ({
    page,
  }) => {
    await gotoStory('stories-datepicker--browser-proof', page);
    const trigger = page
      .getByRole('group', { name: 'Browser picker date' })
      .locator('button[aria-haspopup="dialog"]');
    await trigger.click();
    const unavailable = page.locator(
      'button[data-date-value="2024-03-25"]'
    );
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await unavailable.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Current picker ISO: 2024-03-20')).toBeVisible();

    await gotoStory('stories-datepicker--required-disabled-and-read-only', page);
    const disabledGroup = page.getByRole('group', { name: 'Disabled date' });
    await expect(
      disabledGroup.locator('button[aria-haspopup="dialog"]')
    ).toBeDisabled();
    const readOnlyGroup = page.getByRole('group', { name: 'Read-only date' });
    const readOnlyTrigger = readOnlyGroup.locator(
      'button[aria-haspopup="dialog"]'
    );
    await readOnlyTrigger.click();
    const readOnlyDialog = page.getByRole('dialog', {
      name: 'Read-only date calendar',
    });
    const readOnlyDate = readOnlyDialog.locator(
      'button[data-date-value="2024-03-21"]'
    );
    await readOnlyDate.focus();
    await page.keyboard.press('Enter');
    await expect(readOnlyDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(readOnlyDialog).toHaveCount(0);
    await expect(
      readOnlyGroup.getByRole('spinbutton', { name: 'Day' })
    ).toHaveValue('20');
  });

  test('date picker smoke-tests Japanese eras, Persian RTL, and a Hebrew leap month', async ({
    page,
  }) => {
    await gotoStory('stories-datepicker--localized-digits-first-day-and-rtl', page);
    const persianGroup = page.getByRole('group', {
      name: 'Persian appointment date',
    });
    const persianYear = persianGroup.getByRole('spinbutton', { name: 'Year' });
    await expect(persianYear).toHaveValue('۱۴۰۳');
    await persianYear.focus();
    await page.keyboard.press('Alt+ArrowDown');
    const persianGrid = page.getByRole('grid', {
      name: 'Persian appointment date calendar',
    });
    await expect(persianGrid.locator('..')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading')).toContainText('۱۴۰۳');
    await page.keyboard.press('ArrowRight');
    await expect(
      persianGrid.locator('button[data-date-value="2024-03-19"]')
    ).toBeFocused();
    await page.keyboard.press('Escape');

    await gotoStory('stories-datepicker--seven-calendars', page);
    const japaneseGroup = page.getByRole('group', { name: 'Japanese' });
    await expect(
      japaneseGroup.getByRole('spinbutton', { name: 'Era' })
    ).toHaveValue('令和');
    await japaneseGroup.locator('button[aria-haspopup="dialog"]').click();
    const japaneseGrid = page.getByRole('grid', {
      name: 'Japanese calendar',
    });
    await expect(
      japaneseGrid.locator('button[data-date-value="2019-05-01"]')
    ).toBeFocused();
    await page.keyboard.press('Escape');

    const hebrewGroup = page.getByRole('group', { name: 'Hebrew' });
    await hebrewGroup.locator('button[aria-haspopup="dialog"]').click();
    const hebrewGrid = page.getByRole('grid', { name: 'Hebrew calendar' });
    await expect(
      hebrewGrid.locator('button[data-date-value="2024-02-10"]')
    ).toBeFocused();
    await expect(page.getByRole('heading')).toContainText('אדר');
  });

  test('date picker portals inherit light, dark, and high-contrast themes', async ({
    page,
  }) => {
    await gotoStory('stories-datepicker--themes', page);

    for (const [label, theme, highContrast] of [
      ['Light date', 'light', 'false'],
      ['Dark date', 'dark', 'false'],
      ['High contrast date', 'dark', 'true'],
    ] as const) {
      const group = page.getByRole('group', { name: label });
      await group.locator('button[aria-haspopup="dialog"]').click();
      const dialog = page.getByRole('dialog', { name: `${label} calendar` });
      const portal = dialog.locator('xpath=ancestor::*[@data-frey-portal="true"]');
      await expect(portal).toHaveAttribute('data-frey-theme', theme);
      await expect(portal).toHaveAttribute(
        'data-frey-high-contrast',
        highContrast
      );
      await page.keyboard.press('Escape');
    }
  });
});
