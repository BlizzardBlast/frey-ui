import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:preview'),
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

describe('FileUpload remaining component branches', () => {
  it('renders all dropzone constraints and custom accessible content', () => {
    render(
      <FileUpload
        label='Assets'
        accept='.png'
        maxSize={2048}
        maxFiles={2}
        multiple
      >
        <FileUpload.Dropzone
          aria-label='Custom upload region'
          heading='Custom heading'
          description='Custom description'
          icon={<span>Custom icon</span>}
        />
      </FileUpload>
    );

    expect(
      screen.getByRole('region', { name: 'Custom upload region' })
    ).toBeInTheDocument();
    expect(screen.getByText('Custom heading')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('Custom icon')).toBeInTheDocument();
  });

  it('renders plural drag copy and composes every drag handler', () => {
    const handlers = {
      onDragEnter: vi.fn(),
      onDragLeave: vi.fn(),
      onDragOver: vi.fn(),
      onDragEnd: vi.fn(),
      onDrop: vi.fn(),
    };
    const file = new File(['x'], 'asset.png', { type: 'image/png' });

    render(
      <FileUpload label='Assets' multiple>
        <FileUpload.Dropzone data-testid='dropzone' {...handlers} />
      </FileUpload>
    );
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    expect(screen.getByText('Drop files to add')).toBeInTheDocument();

    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [], types: ['Files'], dropEffect: 'none' },
    });
    fireEvent.dragLeave(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    fireEvent.dragEnd(dropzone);
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    for (const handler of Object.values(handlers)) {
      expect(handler).toHaveBeenCalled();
    }
  });

  it('renders singular drag copy and respects prevented drag handlers', () => {
    const prevent = (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
    };

    render(
      <FileUpload label='Asset'>
        <FileUpload.Dropzone
          data-testid='dropzone'
          aria-labelledby='external-label'
          onDragEnter={prevent}
          onDragLeave={prevent}
          onDragOver={prevent}
          onDragEnd={prevent}
        />
      </FileUpload>
    );
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    expect(dropzone).not.toHaveAttribute('data-dragging');

    fireEvent.dragLeave(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [], types: ['Files'], dropEffect: 'none' },
    });
    fireEvent.dragEnd(dropzone);
  });

  it('renders single and multiple unconstrained descriptions', () => {
    const { rerender } = render(<FileUpload label='Single' />);

    expect(screen.getByText('Select one file')).toBeInTheDocument();

    rerender(<FileUpload label='Multiple' multiple />);
    expect(screen.getByText('Select one or more files')).toBeInTheDocument();
  });

  it('supports custom dropzone children', () => {
    render(
      <FileUpload label='Attachment'>
        <FileUpload.Dropzone>
          <span>Completely custom dropzone</span>
        </FileUpload.Dropzone>
      </FileUpload>
    );

    expect(screen.getByText('Completely custom dropzone')).toBeInTheDocument();
  });

  it('covers standalone, static, hidden-preview, and empty items', () => {
    const file = new File(['x'], 'standalone.txt', { type: 'text/plain' });
    const { rerender } = render(
      <FileUpload label='Attachment' value={[file]}>
        <FileUpload.Item data-testid='standalone-item' preview={false} />
      </FileUpload>
    );

    expect(screen.getByTestId('standalone-item')).toHaveTextContent(
      'standalone.txt'
    );
    expect(screen.queryByTestId('file-preview')).not.toBeInTheDocument();

    rerender(
      <FileUpload label='Attachment' value={[file]}>
        <FileUpload.Item file={file} fileIndex={0}>
          <span>Static item content</span>
        </FileUpload.Item>
      </FileUpload>
    );
    expect(screen.getByText('Static item content')).toBeInTheDocument();

    rerender(
      <FileUpload label='Attachment'>
        <FileUpload.Item />
        <FileUpload.Item file={file} fileIndex={-1} />
      </FileUpload>
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('removes a custom-rendered standalone item without a trigger', () => {
    const file = new File(['x'], 'custom.txt', { type: 'text/plain' });
    const onValueChange = vi.fn();

    render(
      <FileUpload
        label='Attachment'
        value={[file]}
        onValueChange={onValueChange}
      >
        <FileUpload.Item>
          {(_currentFile, onRemove) => (
            <button type='button' onClick={onRemove}>
              Remove custom item
            </button>
          )}
        </FileUpload.Item>
      </FileUpload>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove custom item' })
    );
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('supports list labelling and ignores non-item templates', () => {
    const file = new File(['x'], 'listed.txt', { type: 'text/plain' });

    render(
      <FileUpload label='Attachment' value={[file]}>
        <span id='selected-label'>Chosen files</span>
        <FileUpload.List aria-labelledby='selected-label'>
          not an element
          <span>Not an item</span>
          <FileUpload.Item />
        </FileUpload.List>
      </FileUpload>
    );

    expect(
      screen.getByRole('list', { name: 'Chosen files' })
    ).toBeInTheDocument();
  });

  it('renders image previews, custom image props, and the error fallback', async () => {
    const file = new File(['image'], 'preview.png', { type: 'image/png' });
    const onError = vi.fn();

    render(
      <FileUpload label='Image' value={[file]}>
        <FileUpload.Preview
          file={file}
          alt='Uploaded preview'
          data-testid='preview'
          imageProps={{
            className: 'custom-image',
            loading: 'eager',
            decoding: 'sync',
            onError,
          }}
        />
      </FileUpload>
    );

    const image = await screen.findByRole('img', { name: 'Uploaded preview' });
    expect(image).toHaveClass('custom-image');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('decoding', 'sync');

    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByTestId('preview')).toHaveAttribute(
        'data-preview',
        'file'
      );
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('renders custom and default preview fallbacks and no preview without a file', () => {
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    const { rerender } = render(
      <FileUpload label='Attachment' value={[file]}>
        <FileUpload.Preview fallback={<span>Custom fallback</span>} />
      </FileUpload>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();

    rerender(
      <FileUpload label='Attachment' value={[file]}>
        <FileUpload.Preview />
      </FileUpload>
    );
    expect(screen.getByText('Icon', { selector: 'title' })).toBeInTheDocument();

    rerender(
      <FileUpload label='Attachment'>
        <FileUpload.Preview />
      </FileUpload>
    );
    expect(screen.queryByText('Icon', { selector: 'title' })).not.toBeInTheDocument();
  });

  it('validates asChild content and supports trigger overrides', () => {
    expect(() =>
      render(
        <FileUpload label='Attachment'>
          <FileUpload.Trigger asChild>not an element</FileUpload.Trigger>
        </FileUpload>
      )
    ).toThrow('expects a single valid React element child');

    render(
      <FileUpload label='Attachment' helperText='Default helper' error='Error'>
        <FileUpload.Trigger
          disabled
          type='submit'
          aria-describedby='custom-description'
          aria-invalid={false}
        >
          Custom trigger
        </FileUpload.Trigger>
      </FileUpload>
    );

    const trigger = screen.getByRole('button', { name: 'Custom trigger' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('type', 'submit');
    expect(trigger).toHaveAttribute('aria-describedby', 'custom-description');
    expect(trigger).toHaveAttribute('aria-invalid', 'false');
  });
});
