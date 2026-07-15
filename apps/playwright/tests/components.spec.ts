import { expect, type Page, test } from '@playwright/test';

async function gotoStory(storyId: string, page: Page) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await expect(page.locator('#storybook-root')).toBeVisible({
    timeout: 15_000,
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
        exact: false,
      }
    );

    await expect(content).toBeHidden();

    await trigger.click();

    await expect(content).toBeVisible();

    await trigger.click();

    await expect(content).toBeHidden();
  });

  test('accordion releases non-portaled overlays after expansion settles', async ({
    page,
  }) => {
    await gotoStory('stories-accordion--overflow-safe-content', page);

    const trigger = page.getByRole('button', {
      name: 'Show overflow-safe content',
    });
    const overlay = page.getByTestId('accordion-non-portaled-overlay');
    const panel = overlay.locator('xpath=ancestor::section');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();

    await expect
      .poll(() =>
        panel.evaluate((element) => getComputedStyle(element).overflow)
      )
      .toBe('visible');

    const overlayBox = await overlay.boundingBox();
    const panelBox = await panel.boundingBox();

    expect(overlayBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect(overlayBox?.x).toBeGreaterThan(
      (panelBox?.x ?? 0) + (panelBox?.width ?? 0)
    );

    const hitTestId = await page.evaluate(
      ({ x, y }) => {
        return document
          .elementFromPoint(x, y)
          ?.closest('[data-testid]')
          ?.getAttribute('data-testid');
      },
      {
        x: (overlayBox?.x ?? 0) + 2,
        y: (overlayBox?.y ?? 0) + 2,
      }
    );

    expect(hitTestId).toBe('accordion-non-portaled-overlay');
  });

  test('controlled switch updates its visible state label', async ({
    page,
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

  test('segmented control supports keyboard selection and visible focus', async ({
    page,
  }) => {
    await gotoStory('stories-segmentedcontrol--disabled-states', page);

    const group = page.getByRole('radiogroup', {
      name: 'Layout navigation',
    });
    const list = group.getByRole('radio', { name: 'List' });
    const unavailable = group.getByRole('radio', {
      name: 'Grid unavailable',
    });
    const compact = group.getByRole('radio', { name: 'Compact' });

    await expect(list).toBeChecked();
    await expect(unavailable).toBeDisabled();

    await list.focus();
    await page.keyboard.press('ArrowRight');

    await expect(compact).toBeFocused();
    await expect(compact).toBeChecked();

    const compactSegment = compact.locator('xpath=following-sibling::span[1]');
    await expect
      .poll(() =>
        compactSegment.evaluate((element) => {
          const styles = getComputedStyle(element);
          return `${styles.outlineStyle} ${styles.outlineWidth}`;
        })
      )
      .toBe('solid 2px');

    await page.keyboard.press('ArrowRight');

    await expect(list).toBeFocused();
    await expect(list).toBeChecked();
  });

  test('theme provider stories expose expected data attributes', async ({
    page,
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
