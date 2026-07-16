import { expect, type Locator, type Page, test } from '@playwright/test';
import {
  getBoxGap,
  getElementGeometry,
  getOutlineGeometry,
  getRenderedPixel,
  getVisualSurfaceGeometry,
} from './focus-geometry.js';

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
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    /^(light|dark)$/
  );
}

async function expectBalancedDatePartGaps(group: Locator): Promise<void> {
  const firstSegment = group.getByRole('spinbutton').first();
  const parts = firstSegment.locator('..').locator(':scope > *');
  const partCount = await parts.count();

  expect(partCount).toBeGreaterThan(1);

  for (let index = 0; index < partCount - 1; index += 1) {
    const [currentBox, nextBox] = await Promise.all([
      getElementGeometry(parts.nth(index)),
      getElementGeometry(parts.nth(index + 1)),
    ]);
    const gap = Math.round(getBoxGap(currentBox, nextBox) * 100) / 100;

    expect(gap, `date part gap after item ${index + 1}`).toBeGreaterThanOrEqual(
      4
    );
  }
}

async function focusWithTab(
  page: Page,
  target: Locator,
  maximumTabs = 20
): Promise<void> {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await target.evaluate(
      (element) => element === document.activeElement
    );
    if (focused) return;
  }

  throw new Error(`Target was not focused after ${maximumTabs} Tab presses.`);
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

  test('date field preserves one tab stop, keyboard editing, and ISO form data', async ({
    page,
  }) => {
    await gotoStory('stories-datefield--browser-proof', page);

    const group = page.getByRole('group', { name: 'Browser proof date' });
    const month = group.getByRole('spinbutton', { name: 'Month' });
    const day = group.getByRole('spinbutton', { name: 'Day' });
    const year = group.getByRole('spinbutton', { name: 'Year' });

    await expect(month).toHaveValue('1');
    await expect(day).toHaveValue('31');
    await expect(year).toHaveValue('2024');
    await expect(month).toHaveAttribute('tabindex', '0');
    await expect(day).toHaveAttribute('tabindex', '-1');
    await expect(year).toHaveAttribute('tabindex', '-1');
    await expect(group.getByRole('spinbutton')).toHaveCount(3);

    const segmentLabels = await group
      .getByRole('spinbutton')
      .evaluateAll((segments) =>
        segments.map((segment) => segment.getAttribute('aria-label'))
      );
    expect(segmentLabels).toEqual(['Month', 'Day', 'Year']);

    await month.focus();
    await expect
      .poll(() =>
        month.evaluate((element) => {
          const control = element.closest('[dir]');
          return control ? getComputedStyle(control).boxShadow : 'none';
        })
      )
      .not.toBe('none');

    await page.keyboard.press('ArrowRight');
    await expect(day).toBeFocused();
    await expect(day).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('ArrowLeft');
    await expect(month).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(month).toHaveValue('2');
    await expect(day).toHaveValue('29');
    await expect(page.getByText('Current ISO: 2024-02-29')).toBeVisible();

    await day.focus();
    await page.keyboard.press('Delete');
    await expect(day).toHaveValue('');
    await expect(group).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'Submit browser proof' }).click();
    await expect(page.getByText('Submitted ISO: Not submitted')).toBeVisible();

    await day.focus();
    await page.keyboard.press('Escape');
    await expect(day).toHaveValue('29');
    await expect(group).not.toHaveAttribute('aria-invalid');

    await page.getByRole('button', { name: 'Submit browser proof' }).click();
    await expect(page.getByText('Submitted ISO: 2024-02-29')).toBeVisible();
  });

  test('date field follows the browser locale and accepts localized digit paste', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'language', {
        configurable: true,
        get: () => 'id-ID',
      });
    });
    await gotoStory('stories-datefield--browser-proof', page);

    const defaultLocaleGroup = page.getByRole('group', {
      name: 'Browser proof date',
    });
    const labels = await defaultLocaleGroup
      .getByRole('spinbutton')
      .evaluateAll((segments) =>
        segments.map((segment) => segment.getAttribute('aria-label'))
      );
    expect(labels).toEqual(['Day', 'Month', 'Year']);

    await gotoStory('stories-datefield--localized-digits-and-rtl', page);

    const localizedGroup = page.getByRole('group', { name: 'Persian date' });
    await expect(localizedGroup).not.toHaveAttribute('aria-invalid');
    await expect(page.getByText('Localized ISO: 2024-03-21')).toBeVisible();
    await expect(
      localizedGroup.getByRole('spinbutton', { name: 'Year' })
    ).toHaveValue('۱۴۰۳');
  });

  test('date field focus indicators stay inside every Gregorian segment', async ({
    page,
  }) => {
    await gotoStory('stories-datefield--focus-geometry', page);

    const group = page.getByRole('group', {
      name: 'Gregorian focus geometry',
    });
    const segments = [
      group.getByRole('spinbutton', { name: 'Month' }),
      group.getByRole('spinbutton', { name: 'Day' }),
      group.getByRole('spinbutton', { name: 'Year' }),
    ];

    await expect(segments[0]).toBeFocused();

    for (const [index, segment] of segments.entries()) {
      if (index > 0) await page.keyboard.press('ArrowRight');
      await expect(segment).toBeFocused();

      const geometry = await getOutlineGeometry(segment);
      expect(geometry.style).toBe('solid');
      expect(geometry.width).toBe(2);
      expect(geometry.paintOutset).toBe(0);
    }

    await expectBalancedDatePartGaps(group);
  });

  test('date field focus stays contained across Persian RTL and Japanese era segments', async ({
    page,
  }) => {
    await gotoStory('stories-datefield--focus-geometry', page);

    const scenarios = [
      {
        label: 'Persian focus geometry',
        segmentLabels: ['Month', 'Day', 'Year', 'Era'],
        navigationKey: 'ArrowLeft',
      },
      {
        label: 'Japanese focus geometry',
        segmentLabels: ['Era', 'Year', 'Month', 'Day'],
        navigationKey: 'ArrowRight',
      },
    ] as const;

    for (const scenario of scenarios) {
      await page.keyboard.press('Tab');
      const group = page.getByRole('group', { name: scenario.label });

      for (const [index, label] of scenario.segmentLabels.entries()) {
        if (index > 0) await page.keyboard.press(scenario.navigationKey);
        const segment = group.getByRole('spinbutton', { name: label });
        await expect(segment).toBeFocused();

        const geometry = await getOutlineGeometry(segment);
        expect(geometry.style).toBe('solid');
        expect(geometry.width).toBe(2);
        expect(geometry.paintOutset).toBe(0);
      }

      await expectBalancedDatePartGaps(group);
    }
  });

  test('calendar keeps one day tab stop and implements complete keyboard navigation', async ({
    page,
  }) => {
    await gotoStory('stories-calendar--browser-proof', page);

    const grid = page.getByRole('grid', { name: 'Browser proof calendar' });
    const dayButtons = grid.locator('button[data-date-value]');
    const selected = grid.locator('button[data-date-value="2024-03-20"]');

    await expect(grid.getByRole('gridcell')).toHaveCount(42);
    await expect(dayButtons).toHaveCount(42);
    await expect(
      grid.locator('button[data-date-value][tabindex="0"]')
    ).toHaveCount(1);
    await selected.focus();
    await expect(selected).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(
      grid.locator('button[data-date-value="2024-03-21"]')
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Browser ISO: 2024-03-21')).toBeVisible();

    await page.keyboard.press('Home');
    await expect(
      grid.locator('button[data-date-value="2024-03-18"]')
    ).toBeFocused();
    await page.keyboard.press('End');
    await expect(
      grid.locator('button[data-date-value="2024-03-24"]')
    ).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const unavailable = grid.locator(
      'button[data-date-value="2024-03-25"]'
    );
    await expect(unavailable).toBeFocused();
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Browser ISO: 2024-03-21')).toBeVisible();

    await page.keyboard.press('PageDown');
    await expect(page.getByRole('heading', { name: 'April 2024' })).toBeVisible();
    await expect(
      grid.locator('button[data-date-value="2024-04-25"]')
    ).toBeFocused();
    await page.keyboard.press('Shift+PageDown');
    await expect(page.getByRole('heading', { name: 'April 2025' })).toBeVisible();
    await expect(
      grid.locator('button[data-date-value="2025-04-25"]')
    ).toBeFocused();

    const focusGeometry = await getOutlineGeometry(
      grid.locator('button[data-date-value="2025-04-25"]')
    );
    expect(focusGeometry.style).toBe('solid');
    expect(focusGeometry.width).toBe(2);
    expect(focusGeometry.paintOutset).toBe(0);
  });

  test('calendar focus stays inside selected days beside today', async ({
    page,
  }) => {
    await gotoStory('stories-calendar--focus-geometry', page);

    for (const scenario of [
      {
        label: 'Today after focused date',
        selectedValue: '2024-03-14',
        todayValue: '2024-03-15',
      },
      {
        label: 'Today before focused date',
        selectedValue: '2024-03-15',
        todayValue: '2024-03-14',
      },
      {
        label: 'RTL today after focused date',
        selectedValue: '2024-03-20',
        todayValue: '2024-03-21',
      },
    ]) {
      const grid = page.getByRole('grid', { name: scenario.label });
      const selected = grid.locator(
        `button[data-date-value="${scenario.selectedValue}"]`
      );
      const today = grid.locator(
        `button[data-date-value="${scenario.todayValue}"]`
      );

      await focusWithTab(page, selected);
      await expect(selected).toBeFocused();
      await expect(today).toHaveAttribute('data-today', '');

      const [geometry, selectedSurface, todaySurface] = await Promise.all([
        getOutlineGeometry(selected),
        getVisualSurfaceGeometry(selected),
        getVisualSurfaceGeometry(today),
      ]);
      const surfaceGap =
        Math.round(getBoxGap(selectedSurface.box, todaySurface.box) * 100) /
        100;

      expect(geometry.style).toBe('solid');
      expect(geometry.width).toBe(2);
      expect(geometry.paintOutset).toBe(0);
      expect(
        surfaceGap,
        `${scenario.label} selected/today surface gap`
      ).toBeGreaterThanOrEqual(4);
      expect(
        contrastRatio(geometry.color, selectedSurface.background),
        `${scenario.label} selected focus contrast`
      ).toBeGreaterThanOrEqual(3);

      const [renderedFocusColors, renderedSelectedColor] = await Promise.all([
        Promise.all(
          [0.1, 0.125, 0.15, 0.175].map((horizontalRatio) =>
            getRenderedPixel(selected, horizontalRatio, 0.5)
          )
        ),
        getRenderedPixel(selected, 0.3, 0.5),
      ]);
      const renderedFocusContrast = Math.max(
        ...renderedFocusColors.map((color) =>
          contrastRatio(color, renderedSelectedColor)
        )
      );
      expect(
        renderedFocusContrast,
        `${scenario.label} rendered selected focus contrast`
      ).toBeGreaterThanOrEqual(3);
    }

    const combinedGrid = page.getByRole('grid', {
      name: 'Focused selected today',
    });
    const combined = combinedGrid.locator(
      'button[data-date-value="2024-03-15"]'
    );
    await focusWithTab(page, combined);

    const [combinedBox, combinedGeometry, combinedSurface] =
      await Promise.all([
        getElementGeometry(combined),
        getOutlineGeometry(combined),
        getVisualSurfaceGeometry(combined),
      ]);
    const surfaceInset = combinedSurface.box.left - combinedBox.left;
    const stateFocusSeparation =
      combinedGeometry.indicatorInset -
      combinedGeometry.width -
      surfaceInset -
      combinedSurface.borderWidth;

    await expect(combined).toBeFocused();
    await expect(combined).toHaveAttribute('data-today', '');
    await expect(combined).toHaveAttribute('data-selected', '');
    expect(combinedGeometry.paintOutset).toBe(0);
    expect(stateFocusSeparation).toBeGreaterThanOrEqual(2);
    expect(
      contrastRatio(
        combinedSurface.borderColor,
        combinedSurface.background
      ),
      'combined today border contrast'
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(combinedGeometry.color, combinedSurface.background),
      'combined focus contrast'
    ).toBeGreaterThanOrEqual(3);
  });

  test('calendar follows RTL visual arrows and localized headings', async ({
    page,
  }) => {
    await gotoStory('stories-calendar--localized-digits-and-rtl', page);

    const grid = page.getByRole('grid', {
      name: 'Persian appointment date',
    });
    const calendarRoot = grid.locator('..');
    const selected = grid.locator('button[data-date-value="2024-03-20"]');

    await expect(calendarRoot).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading')).toContainText('۱۴۰۳');
    await selected.focus();
    const [selectedGeometry, selectedSurface] = await Promise.all([
      getOutlineGeometry(selected),
      getVisualSurfaceGeometry(selected),
    ]);
    expect(selectedGeometry.paintOutset).toBe(0);
    expect(
      contrastRatio(selectedGeometry.color, selectedSurface.background)
    ).toBeGreaterThanOrEqual(3);

    await page.keyboard.press('ArrowRight');
    const previousDay = grid.locator('button[data-date-value="2024-03-19"]');
    await expect(previousDay).toBeFocused();
    const previousDayGeometry = await getOutlineGeometry(previousDay);
    const calendarBackground = await calendarRoot.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );
    expect(
      contrastRatio(previousDayGeometry.color, calendarBackground)
    ).toBeGreaterThanOrEqual(3);
  });

  test('calendar selection and focus remain visible across themes', async ({
    page,
  }) => {
    await gotoStory('stories-calendar--themes', page);

    for (const label of [
      'Light calendar',
      'Dark calendar',
      'High contrast calendar',
    ]) {
      const grid = page.getByRole('grid', { name: label });
      const selected = grid.locator('button[data-date-value="2024-03-14"]');
      const calendarRoot = grid.locator('..');
      const colors = await Promise.all([
        selected.evaluate((element) => {
          const styles = getComputedStyle(element);
          return {
            foreground: styles.color,
          };
        }),
        getVisualSurfaceGeometry(selected),
        calendarRoot.evaluate(
          (element) => getComputedStyle(element).backgroundColor
        ),
      ]);
      const [selectedColors, selectedSurface, calendarBackground] = colors;

      expect(
        contrastRatio(selectedColors.foreground, selectedSurface.background),
        `${label} selected text contrast`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(selectedSurface.background, calendarBackground),
        `${label} selected indicator contrast`
      ).toBeGreaterThanOrEqual(3);

      await selected.focus();
      await expect(selected).toBeFocused();
      const geometry = await getOutlineGeometry(selected);
      expect(geometry.style).toBe('solid');
      expect(geometry.paintOutset).toBe(0);
      expect(
        contrastRatio(geometry.color, selectedSurface.background),
        `${label} selected focus contrast`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('date focus indicators remain visible in forced colors', async ({
    browser,
  }) => {
    const context = await browser.newContext({ forcedColors: 'active' });
    const page = await context.newPage();

    try {
      await gotoStory('stories-datefield--focus-geometry', page);
      const month = page
        .getByRole('group', { name: 'Gregorian focus geometry' })
        .getByRole('spinbutton', { name: 'Month' });
      await expect(month).toBeFocused();
      const segmentGeometry = await getOutlineGeometry(month);
      expect(segmentGeometry.style).toBe('solid');
      expect(segmentGeometry.width).toBe(2);
      expect(segmentGeometry.paintOutset).toBe(0);
      expect(segmentGeometry.color).not.toBe('transparent');

      await gotoStory('stories-calendar--focus-geometry', page);
      const selected = page
        .getByRole('grid', { name: 'Today after focused date' })
        .locator('button[data-date-value="2024-03-14"]');
      await expect(selected).toBeFocused();
      const calendarGeometry = await getOutlineGeometry(selected);
      expect(calendarGeometry.style).toBe('solid');
      expect(calendarGeometry.width).toBe(2);
      expect(calendarGeometry.paintOutset).toBe(0);
      expect(calendarGeometry.color).not.toBe('transparent');
    } finally {
      await context.close();
    }
  });

  test('calendar preserves 48px targets on narrow coarse pointers', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();

    try {
      await gotoStory('stories-calendar--browser-proof', page);
      const grid = page.getByRole('grid', { name: 'Browser proof calendar' });
      const day = grid.locator('button[data-date-value="2024-03-20"]');
      const nextMonth = page.getByRole('button', { name: 'Next month' });
      const [dayBox, nextMonthBox] = await Promise.all([
        day.boundingBox(),
        nextMonth.boundingBox(),
      ]);

      expect(dayBox?.width ?? 0).toBeGreaterThanOrEqual(48);
      expect(dayBox?.height ?? 0).toBeGreaterThanOrEqual(48);
      expect(nextMonthBox?.width ?? 0).toBeGreaterThanOrEqual(48);
      expect(nextMonthBox?.height ?? 0).toBeGreaterThanOrEqual(48);
    } finally {
      await context.close();
    }
  });

  test('date picker keeps balanced segment spacing without narrow overflow', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();

    try {
      await gotoStory('stories-datepicker--narrow-viewport', page);

      const group = page.getByRole('group', { name: 'Mobile booking date' });
      const firstSegment = group.getByRole('spinbutton').first();

      await page.keyboard.press('Tab');
      await expect(firstSegment).toBeFocused();
      await expectBalancedDatePartGaps(group);

      const trigger = page.getByRole('button', {
        name: 'Change date, March 20, 2024',
      });
      await trigger.click();
      await expect(
        page.getByRole('dialog', { name: 'Mobile booking date calendar' })
      ).toBeVisible();

      const viewportGeometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(viewportGeometry.scrollWidth).toBeLessThanOrEqual(
        viewportGeometry.clientWidth
      );
    } finally {
      await context.close();
    }
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
