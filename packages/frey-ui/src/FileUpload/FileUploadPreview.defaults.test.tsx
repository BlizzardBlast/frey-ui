import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { FileUpload } from './index';

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  'createObjectURL'
);
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  'revokeObjectURL'
);

beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:preview-defaults'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
});

afterAll(() => {
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
  } else {
    Reflect.deleteProperty(URL, 'createObjectURL');
  }

  if (originalRevokeObjectURL) {
    Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
  } else {
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  }
});

describe('FileUpload.Preview defaults', () => {
  it('uses lazy loading and asynchronous decoding by default', async () => {
    const file = new File(['image'], 'preview.png', { type: 'image/png' });

    render(
      <FileUpload label='Image' value={[file]}>
        <FileUpload.Preview alt='Image preview' />
      </FileUpload>
    );

    const image = await screen.findByRole('img', { name: 'Image preview' });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });
});
