import { render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileUpload } from './index';

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
  createObjectURL.mockReturnValue('blob:preview-defaults');

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
  it('uses image metadata, lazy loading, and asynchronous decoding', async () => {
    const file = new File(['image'], 'preview.png', { type: 'image/png' });

    render(
      <FileUpload label='Image' value={[file]}>
        <FileUpload.Preview alt='Image preview' data-testid='preview' />
      </FileUpload>
    );

    const image = await screen.findByRole('img', { name: 'Image preview' });

    expect(screen.getByTestId('preview')).toHaveAttribute(
      'data-preview',
      'image'
    );
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('reports file metadata when object URL creation throws', async () => {
    createObjectURL.mockImplementationOnce(() => {
      throw new Error('Object URLs are unavailable');
    });
    const file = new File(['image'], 'preview.png', { type: 'image/png' });

    render(
      <FileUpload label='Image' value={[file]}>
        <FileUpload.Preview
          alt='Image preview'
          data-testid='preview'
          fallback={<span>File fallback</span>}
        />
      </FileUpload>
    );

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledWith(file);
    });
    expect(screen.getByTestId('preview')).toHaveAttribute(
      'data-preview',
      'file'
    );
    expect(screen.getByText('File fallback')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('reports file metadata when object URL APIs are unavailable', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: undefined,
    });
    const file = new File(['image'], 'preview.png', { type: 'image/png' });

    render(
      <FileUpload label='Image' value={[file]}>
        <FileUpload.Preview
          alt='Image preview'
          data-testid='preview'
          fallback={<span>File fallback</span>}
        />
      </FileUpload>
    );

    expect(screen.getByTestId('preview')).toHaveAttribute(
      'data-preview',
      'file'
    );
    expect(screen.getByText('File fallback')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
