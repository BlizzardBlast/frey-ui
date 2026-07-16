import { expect, type Page, test } from '@playwright/test';

type Rgb = readonly [number, number, number];

function parseRgb(color: string): Rgb {
  const channels = color.match(/[\d.]+/g)?.map(Number);
  const [red, green, blue, alpha = 1] = channels ?? [];

  if (
    red === undefined ||
    green === undefined ||
    blue === undefined ||
    alpha !== 1
  ) {
    throw new Error(`Unable to parse computed color: ${color}`);
  }

  return [red, green, blue];
}

function relativeLuminance(color: Rgb): number {
  const [red, green, blue] = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(parseRgb(foreground));
  const backgroundLuminance = relativeLuminance(parseRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

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

  test('segmented control keeps its intrinsic width inside a field', async ({
    page,
  }) => {
    await gotoStory('stories-segmentedcontrol--basic', page);

    const group = page.getByRole('radiogroup', { name: 'Dashboard view' });
    const field = group.locator('..');
    const groupBox = await group.boundingBox();
    const fieldBox = await field.boundingBox();

    expect(groupBox).not.toBeNull();
    expect(fieldBox).not.toBeNull();
    expect((fieldBox?.width ?? 0) - (groupBox?.width ?? 0)).toBeGreaterThan(20);
  });

  test('segmented control maintains accessible contrast in every theme', async ({
    page,
  }) => {
    await gotoStory('stories-segmentedcontrol--theme-compatibility', page);

    const themes = [
      { label: 'Light theme', description: 'light' },
      { label: 'Dark theme', description: 'dark' },
      { label: 'Light high contrast', description: 'light high contrast' },
      { label: 'Dark high contrast', description: 'dark high contrast' },
    ] as const;

    for (const { label, description } of themes) {
      const group = page.getByRole('radiogroup', {
        name: `${label} dashboard view`,
      });
      const selected = group.getByRole('radio', { name: 'List' });
      const unselected = group.getByRole('radio', { name: 'Grid' });
      const selectedSegment = selected.locator(
        'xpath=following-sibling::span[1]'
      );
      const unselectedSegment = unselected.locator(
        'xpath=following-sibling::span[1]'
      );

      await expect(selected).toBeChecked();
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      await page.keyboard.press('Tab');
      await selected.focus();
      await expect(selected).toBeFocused();
      await group.evaluate(async (element) => {
        await Promise.all(
          element
            .getAnimations({ subtree: true })
            .map(async (animation) => animation.finished)
        );
      });

      const colors = await Promise.all([
        group.evaluate((element) => getComputedStyle(element).backgroundColor),
        selectedSegment.evaluate((element) => {
          const styles = getComputedStyle(element);
          return {
            background: styles.backgroundColor,
            border: styles.borderColor,
            foreground: styles.color,
            outline: styles.outlineColor,
            outlineStyle: styles.outlineStyle,
            outlineWidth: styles.outlineWidth,
          };
        }),
        unselectedSegment.evaluate(
          (element) => getComputedStyle(element).color
        ),
      ]);
      const [groupBackground, selectedColors, unselectedColor] = colors;

      expect(selectedColors.outlineStyle).toBe('solid');
      expect(selectedColors.outlineWidth).toBe('2px');
      expect(
        contrastRatio(unselectedColor, groupBackground),
        `${description} unselected text contrast (${unselectedColor} on ${groupBackground})`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(selectedColors.foreground, selectedColors.background),
        `${description} selected text contrast (${selectedColors.foreground} on ${selectedColors.background})`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        Math.max(
          contrastRatio(selectedColors.background, groupBackground),
          contrastRatio(selectedColors.border, groupBackground)
        ),
        `${description} selected indicator contrast`
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(selectedColors.outline, groupBackground),
        `${description} focus contrast (${selectedColors.outline} on ${groupBackground})`
      ).toBeGreaterThanOrEqual(3);
    }
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
