import { expect, type Locator, type Page, test } from '@playwright/test';
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

type ElementBox = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;
type OverlaySide = 'top' | 'right' | 'bottom' | 'left';

async function getSettledBox(locator: Locator): Promise<ElementBox> {
  await expect(locator).toBeVisible();
  await locator.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map(async (animation) => {
        try {
          await animation.finished;
        } catch {
          // A canceled entry animation is already settled for geometry checks.
        }
      })
    );
  });
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box as ElementBox;
}

function expectViewportContainment(
  box: ElementBox,
  viewport: Readonly<{ width: number; height: number }>
): void {
  expect(box.x).toBeGreaterThanOrEqual(7);
  expect(box.y).toBeGreaterThanOrEqual(7);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 7);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 7);
}

function expectRequestedSide(
  trigger: ElementBox,
  overlay: ElementBox,
  side: OverlaySide
): void {
  const gapBySide: Record<OverlaySide, number> = {
    top: trigger.y - (overlay.y + overlay.height),
    right: overlay.x - (trigger.x + trigger.width),
    bottom: overlay.y - (trigger.y + trigger.height),
    left: trigger.x - (overlay.x + overlay.width),
  };
  expect(gapBySide[side]).toBeGreaterThanOrEqual(7);
  expect(gapBySide[side]).toBeLessThanOrEqual(9);
}

async function getControlledOverlay(
  trigger: Locator,
  page: Page
): Promise<Locator> {
  const contentId = await trigger.getAttribute('aria-controls');
  expect(contentId).not.toBeNull();
  return page.locator(`[id="${contentId}"]`);
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

  test('popover placement variants honor every requested side and viewport padding', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await gotoStory('stories-popover--placement-variants', page);

    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      const trigger = page
        .locator('button')
        .filter({ hasText: new RegExp(`^${side}$`) });
      await trigger.click();
      const overlay = await getControlledOverlay(trigger, page);
      const [triggerBox, overlayBox] = await Promise.all([
        getSettledBox(trigger),
        getSettledBox(overlay),
      ]);

      expectRequestedSide(triggerBox, overlayBox, side);
      expectViewportContainment(overlayBox, { width: 900, height: 600 });

      await page.keyboard.press('Escape');
      await expect(overlay).toHaveCount(0);
    }
  });

  test('popover flips away from bottom and right viewport edges', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 320 });
    await gotoStory('stories-popover--placement-variants', page);

    const bottomTrigger = page
      .locator('button')
      .filter({ hasText: /^bottom$/ });
    await bottomTrigger.evaluate((element) => {
      Object.assign(element.style, {
        bottom: '4px',
        left: '210px',
        position: 'fixed',
      });
    });
    await bottomTrigger.click();
    const bottomOverlay = await getControlledOverlay(bottomTrigger, page);
    const [bottomTriggerBox, bottomOverlayBox] = await Promise.all([
      getSettledBox(bottomTrigger),
      getSettledBox(bottomOverlay),
    ]);
    expectRequestedSide(bottomTriggerBox, bottomOverlayBox, 'top');
    expectViewportContainment(bottomOverlayBox, { width: 480, height: 320 });
    await page.keyboard.press('Escape');

    const rightTrigger = page.locator('button').filter({ hasText: /^right$/ });
    await rightTrigger.evaluate((element) => {
      Object.assign(element.style, {
        position: 'fixed',
        right: '4px',
        top: '140px',
      });
    });
    await rightTrigger.click();
    const rightOverlay = await getControlledOverlay(rightTrigger, page);
    const [rightTriggerBox, rightOverlayBox] = await Promise.all([
      getSettledBox(rightTrigger),
      getSettledBox(rightOverlay),
    ]);
    expectRequestedSide(rightTriggerBox, rightOverlayBox, 'left');
    expectViewportContainment(rightOverlayBox, { width: 480, height: 320 });
  });

  test('popover focus scope hides outside content, traps focus, and restores the trigger', async ({
    page,
  }) => {
    await gotoStory('stories-popover--basic-popover', page);
    await page.evaluate(() => {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'overlay-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.textContent = 'Live overlay updates';
      document.body.append(liveRegion);
      const outsideButton = document.createElement('button');
      outsideButton.id = 'popover-outside-target';
      outsideButton.style.position = 'fixed';
      outsideButton.style.left = '4px';
      outsideButton.style.top = '4px';
      outsideButton.textContent = 'Outside popover target';
      document.body.append(outsideButton);
    });
    const trigger = page.locator('button[aria-haspopup="dialog"]');

    await trigger.click();
    const content = await getControlledOverlay(trigger, page);
    await expect(content).toBeFocused();
    await expect
      .poll(() =>
        trigger.evaluate((element) =>
          Boolean(element.closest('[aria-hidden="true"]'))
        )
      )
      .toBe(true);
    await expect(page.locator('#overlay-live-region')).not.toHaveAttribute(
      'aria-hidden',
      'true'
    );

    await page.keyboard.press('Tab');
    await expect(content).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(await getControlledOverlay(trigger, page)).toBeVisible();
    const outsideTarget = page.locator('#popover-outside-target');
    await outsideTarget.click();
    await expect(page.getByText('Team Access')).toHaveCount(0);
    await expect(outsideTarget).toBeFocused();
    await expect
      .poll(() =>
        trigger.evaluate(
          (element) => element.closest('[aria-hidden="true"]') === null
        )
      )
      .toBe(true);
  });

  test('nested popovers dismiss and restore focus one top layer at a time', async ({
    page,
  }) => {
    await gotoStory('stories-popover--nested-overlays', page);
    const parentTrigger = page.getByRole('button', {
      name: 'Open parent overlay',
    });

    await parentTrigger.click();
    const childTrigger = page.getByRole('button', {
      name: 'Open child overlay',
    });
    await childTrigger.click();
    const childAction = page.getByRole('button', {
      name: 'Child overlay action',
    });
    await expect(childAction).toBeFocused();
    await expect
      .poll(() =>
        childAction.evaluate(
          (element) => element.closest('[aria-hidden="true"]') === null
        )
      )
      .toBe(true);

    await page.keyboard.press('Escape');
    await expect(childAction).toHaveCount(0);
    await expect(
      page.getByText('Parent overlay', { exact: true })
    ).toBeVisible();
    await expect(childTrigger).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByText('Parent overlay', { exact: true })).toHaveCount(
      0
    );
    await expect(parentTrigger).toBeFocused();
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

  test('dropdown menu traps Tab, hides outside content, and restores focus for both dismissals', async ({
    page,
  }) => {
    await gotoStory('stories-dropdownmenu--basic-menu', page);
    await page.evaluate(() => {
      const outsideButton = document.createElement('button');
      outsideButton.id = 'menu-outside-target';
      outsideButton.style.position = 'fixed';
      outsideButton.style.left = '4px';
      outsideButton.style.top = '4px';
      outsideButton.textContent = 'Outside menu target';
      document.body.append(outsideButton);
    });
    const trigger = page.locator('button[aria-haspopup="menu"]');

    await trigger.click();
    const menu = page.getByRole('menu');
    const rename = page.getByRole('menuitem', { name: 'Rename' });
    await expect(rename).toBeFocused();
    await expect
      .poll(() =>
        trigger.evaluate((element) =>
          Boolean(element.closest('[aria-hidden="true"]'))
        )
      )
      .toBe(true);

    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(rename).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    const outsideTarget = page.locator('#menu-outside-target');
    await outsideTarget.click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(outsideTarget).toBeFocused();
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

  test('tooltip preserves delay, hover, keyboard, ARIA, blur, and Escape behavior', async ({
    page,
  }) => {
    await gotoStory('stories-tooltip--basic-tooltip', page);
    const trigger = page.getByRole('button', { name: 'Hover or focus me' });
    const tooltip = page.getByRole('tooltip');

    await trigger.hover();
    expect(await tooltip.count()).toBe(0);
    await expect(tooltip).toBeVisible();
    const tooltipId = await tooltip.getAttribute('id');
    expect(tooltipId).not.toBeNull();
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      tooltipId as string
    );

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');

    await page.mouse.move(1, 1);
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  test('tooltip repositions after ancestor scroll and reference movement', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 500 });
    await gotoStory('stories-tooltip--placement-variants', page);
    const trigger = page.locator('button').filter({ hasText: /^top$/ });
    const storyRoot = page.locator('#storybook-root');
    await storyRoot.evaluate((element) => {
      Object.assign(element.style, {
        display: 'block',
        height: '220px',
        left: '40px',
        overflow: 'auto',
        position: 'fixed',
        top: '40px',
        width: '360px',
      });
    });
    await trigger.evaluate((element) => {
      element.style.marginTop = '300px';
    });
    await storyRoot.evaluate((element) => {
      element.scrollTop = 200;
    });
    await page.keyboard.press('Tab');
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();

    await storyRoot.evaluate((element) => {
      element.scrollTop += 30;
    });
    await expect
      .poll(async () => {
        const [triggerBox, tooltipBox] = await Promise.all([
          trigger.boundingBox(),
          tooltip.boundingBox(),
        ]);
        if (!triggerBox || !tooltipBox) return false;
        const gap = triggerBox.y - (tooltipBox.y + tooltipBox.height);
        return gap >= 7 && gap <= 9;
      })
      .toBe(true);

    const beforeMove = await getSettledBox(tooltip);
    await trigger.evaluate((element) => {
      element.style.transform = 'translateX(50px)';
    });
    await expect
      .poll(async () => (await getSettledBox(tooltip)).x - beforeMove.x)
      .toBeGreaterThan(20);
    const [movedTrigger, movedTooltip] = await Promise.all([
      getSettledBox(trigger),
      getSettledBox(tooltip),
    ]);
    expectRequestedSide(movedTrigger, movedTooltip, 'top');
    expectViewportContainment(movedTooltip, { width: 800, height: 500 });
  });

  test('popover repositions after page scroll and viewport resize', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 500 });
    await gotoStory('stories-popover--basic-popover', page);
    const storyRoot = page.locator('#storybook-root');
    await storyRoot.evaluate((element) => {
      Object.assign(element.style, {
        left: '50%',
        position: 'absolute',
        top: '700px',
        transform: 'translateX(-50%)',
      });
      document.body.style.minHeight = '1400px';
      window.scrollTo(0, 500);
    });
    const trigger = page.locator('button[aria-haspopup="dialog"]');
    await trigger.click();
    const overlay = await getControlledOverlay(trigger, page);
    await getSettledBox(overlay);

    await page.evaluate(() => window.scrollTo(0, 550));
    await expect
      .poll(async () => {
        const [triggerBox, overlayBox] = await Promise.all([
          trigger.boundingBox(),
          overlay.boundingBox(),
        ]);
        if (!triggerBox || !overlayBox) return false;
        const gap = overlayBox.y - (triggerBox.y + triggerBox.height);
        return gap >= 7 && gap <= 9;
      })
      .toBe(true);

    const beforeResize = await getSettledBox(trigger);
    await page.setViewportSize({ width: 600, height: 500 });
    await expect
      .poll(async () => {
        const triggerBox = await trigger.boundingBox();
        return triggerBox ? beforeResize.x - triggerBox.x : 0;
      })
      .toBeGreaterThan(90);
    const resizedOverlay = await getSettledBox(overlay);
    expectViewportContainment(resizedOverlay, { width: 600, height: 500 });
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
    await expect(
      page.getByText('Current picker ISO: 2024-03-21')
    ).toBeVisible();
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
    const unavailable = page.locator('button[data-date-value="2024-03-25"]');
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await unavailable.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByText('Current picker ISO: 2024-03-20')
    ).toBeVisible();

    await gotoStory(
      'stories-datepicker--required-disabled-and-read-only',
      page
    );
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
    await gotoStory(
      'stories-datepicker--localized-digits-first-day-and-rtl',
      page
    );
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
      const portal = dialog.locator(
        'xpath=ancestor::*[@data-frey-portal="true"]'
      );
      await expect(portal).toHaveAttribute('data-frey-theme', theme);
      await expect(portal).toHaveAttribute(
        'data-frey-high-contrast',
        highContrast
      );
      await page.keyboard.press('Escape');
    }
  });
});
