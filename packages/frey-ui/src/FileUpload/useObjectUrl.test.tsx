import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPreviewableImage, useObjectUrl } from './useObjectUrl';

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  'createObjectURL'
);
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  'revokeObjectURL'
);
const createObjectURL = vi.fn<(file: Blob) => string>();
const revokeObjectURL = vi.fn<(url: string) => void>();

beforeEach(() => {
  createObjectURL.mockReset();
  revokeObjectURL.mockReset();
  createObjectURL
    .mockReturnValueOnce('blob:first')
    .mockReturnValueOnce('blob:second');

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURL,
  });
});

afterAll(() => {
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
  }

  if (originalRevokeObjectURL) {
    Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
  }
});

describe('useObjectUrl', () => {
  it('creates and revokes object URLs as the file changes', async () => {
    const first = new File(['one'], 'first.png', { type: 'image/png' });
    const second = new File(['two'], 'second.png', { type: 'image/png' });
    const { result, rerender, unmount } = renderHook(
      ({ file }) => useObjectUrl(file),
      { initialProps: { file: first as File | undefined } }
    );

    await waitFor(() => {
      expect(result.current).toBe('blob:first');
    });

    rerender({ file: second });

    await waitFor(() => {
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
      expect(result.current).toBe('blob:second');
    });

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
  });

  it('does not create an object URL when disabled', () => {
    const file = new File(['one'], 'first.png', { type: 'image/png' });
    const { result } = renderHook(() => useObjectUrl(file, false));

    expect(result.current).toBeUndefined();
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});

describe('isPreviewableImage', () => {
  it('accepts raster images and excludes SVG', () => {
    expect(
      isPreviewableImage(
        new File(['x'], 'image.png', { type: 'image/png' })
      )
    ).toBe(true);
    expect(
      isPreviewableImage(
        new File(['x'], 'image.svg', { type: 'image/svg+xml' })
      )
    ).toBe(false);
  });
});
