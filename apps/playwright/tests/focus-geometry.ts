import type { Locator } from '@playwright/test';

export type BoxGeometry = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}>;

export type OutlineGeometry = Readonly<{
  style: string;
  width: number;
  offset: number;
  color: string;
  background: string;
  indicatorInset: number;
  paintOutset: number;
}>;

export type VisualSurfaceGeometry = Readonly<{
  box: BoxGeometry;
  source: 'element' | 'before';
  background: string;
  borderColor: string;
  borderWidth: number;
}>;

export async function getElementGeometry(
  locator: Locator
): Promise<BoxGeometry> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  });
}

export async function getVisualSurfaceGeometry(
  locator: Locator
): Promise<VisualSurfaceGeometry> {
  return locator.evaluate((element) => {
    const elementBox = element.getBoundingClientRect();
    const elementStyles = getComputedStyle(element);
    const beforeStyles = getComputedStyle(element, '::before');
    const hasBeforeSurface = !['none', 'normal'].includes(
      beforeStyles.content
    );

    if (!hasBeforeSurface) {
      return {
        box: {
          top: elementBox.top,
          right: elementBox.right,
          bottom: elementBox.bottom,
          left: elementBox.left,
          width: elementBox.width,
          height: elementBox.height,
        },
        source: 'element' as const,
        background: elementStyles.backgroundColor,
        borderColor: elementStyles.borderColor,
        borderWidth: Number.parseFloat(elementStyles.borderWidth),
      };
    }

    const parseInset = (value: string): number => {
      const inset = Number.parseFloat(value);
      return Number.isFinite(inset) ? inset : 0;
    };
    const top = elementBox.top + parseInset(beforeStyles.top);
    const right = elementBox.right - parseInset(beforeStyles.right);
    const bottom = elementBox.bottom - parseInset(beforeStyles.bottom);
    const left = elementBox.left + parseInset(beforeStyles.left);

    return {
      box: {
        top,
        right,
        bottom,
        left,
        width: right - left,
        height: bottom - top,
      },
      source: 'before' as const,
      background: beforeStyles.backgroundColor,
      borderColor: beforeStyles.borderColor,
      borderWidth: Number.parseFloat(beforeStyles.borderWidth),
    };
  });
}

export async function getRenderedPixel(
  locator: Locator,
  horizontalRatio: number,
  verticalRatio: number
): Promise<string> {
  const screenshot = await locator.screenshot();
  const source = `data:image/png;base64,${screenshot.toString('base64')}`;

  return locator.page().evaluate(
    async ({ imageSource, xRatio, yRatio }) => {
      const image = new Image();
      image.src = imageSource;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to create screenshot canvas.');

      context.drawImage(image, 0, 0);
      const x = Math.min(
        image.naturalWidth - 1,
        Math.max(0, Math.round(image.naturalWidth * xRatio))
      );
      const y = Math.min(
        image.naturalHeight - 1,
        Math.max(0, Math.round(image.naturalHeight * yRatio))
      );
      const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;
      if (alpha !== 255) {
        throw new Error(`Expected an opaque rendered pixel, received ${alpha}.`);
      }

      return `rgb(${red}, ${green}, ${blue})`;
    },
    {
      imageSource: source,
      xRatio: horizontalRatio,
      yRatio: verticalRatio,
    }
  );
}

export function getBoxGap(
  first: BoxGeometry,
  second: BoxGeometry
): number {
  const horizontalGap = Math.max(
    first.left - second.right,
    second.left - first.right,
    0
  );
  const verticalGap = Math.max(
    first.top - second.bottom,
    second.top - first.bottom,
    0
  );

  if (horizontalGap === 0) return verticalGap;
  if (verticalGap === 0) return horizontalGap;
  return Math.hypot(horizontalGap, verticalGap);
}

export async function getOutlineGeometry(
  locator: Locator
): Promise<OutlineGeometry> {
  return locator.evaluate((element) => {
    const elementStyles = getComputedStyle(element);
    const afterStyles = getComputedStyle(element, '::after');
    const usesAfterIndicator =
      elementStyles.outlineStyle === 'none' &&
      !['none', 'normal'].includes(afterStyles.content);
    const styles = usesAfterIndicator ? afterStyles : elementStyles;
    const width = Number.parseFloat(styles.outlineWidth);
    const offset = Number.parseFloat(styles.outlineOffset);
    const parseInset = (value: string): number => {
      const inset = Number.parseFloat(value);
      return Number.isFinite(inset) ? inset : 0;
    };
    const containmentInset = usesAfterIndicator
      ? Math.min(
          parseInset(afterStyles.top),
          parseInset(afterStyles.right),
          parseInset(afterStyles.bottom),
          parseInset(afterStyles.left)
        )
      : 0;

    return {
      style: styles.outlineStyle,
      width,
      offset,
      color: styles.outlineColor,
      background: elementStyles.backgroundColor,
      indicatorInset: containmentInset,
      paintOutset: Math.max(0, width + offset - containmentInset),
    };
  });
}
