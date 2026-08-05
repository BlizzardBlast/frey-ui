import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { useFileUploadState } from './useFileUploadState';

class FileListMock {
  length: number;

  constructor(private readonly files: File[]) {
    this.length = files.length;
  }

  item(index: number): File | null {
    return this.files[index] ?? null;
  }

  [Symbol.iterator](): IterableIterator<File> {
    return this.files[Symbol.iterator]();
  }
}

class DataTransferMock {
  files = new FileListMock([]);

  items = {
    add: (file: File) => {
      this.files = new FileListMock([...this.files, file]);
    },
  };
}

const originalFilesDescriptor = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'files'
);

beforeAll(() => {
  vi.stubGlobal('DataTransfer', DataTransferMock);

  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    configurable: true,
    get(this: HTMLInputElement) {
      return (this as unknown as { _files?: FileListMock })._files ?? null;
    },
    set(this: HTMLInputElement, value: FileListMock | undefined) {
      (this as unknown as { _files?: FileListMock })._files = value;
    },
  });
});

afterAll(() => {
  vi.unstubAllGlobals();

  if (originalFilesDescriptor) {
    Object.defineProperty(
      HTMLInputElement.prototype,
      'files',
      originalFilesDescriptor
    );
  }
});

function TestComponent(props: Record<string, unknown>) {
  const state = useFileUploadState(
    props as Parameters<typeof useFileUploadState>[0]
  );

  return (
    <form data-testid='form'>
      <input
        type='file'
        ref={state.inputRef}
        onChange={state.onInputChange}
        data-testid='input'
      />
      <button
        type='button'
        data-testid='remove-first'
        onClick={() => state.removeFileAt(0)}
      />
      <button type='reset'>Reset</button>
      <section
        aria-label='Dropzone'
        data-testid='dropzone'
        onDrop={state.onDrop}
      />
      <span data-testid='files'>
        {state.files.map((file) => file.name).join(',')}
      </span>
      <span data-testid='rejected'>
        {state.rejected
          .map((rejection) => `${rejection.code}:${rejection.reason}`)
          .join(',')}
      </span>
    </form>
  );
}

describe('useFileUploadState', () => {
  it('adds multiple files and reports structured rejections', () => {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    const image = new File(['x'], 'image.png', { type: 'image/png' });
    const invalid = new File(['x'], 'invalid.txt', { type: 'text/plain' });

    render(
      <TestComponent
        multiple
        accept='image/*'
        onValueChange={onValueChange}
        onFilesRejected={onFilesRejected}
      />
    );

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [image, invalid], types: ['Files'] },
    });

    expect(screen.getByTestId('files')).toHaveTextContent('image.png');
    expect(screen.getByTestId('rejected')).toHaveTextContent(
      'file-invalid-type:File type is not allowed'
    );
    expect(onValueChange).toHaveBeenCalledWith([image]);
    expect(onFilesRejected).toHaveBeenCalledWith([
      {
        file: invalid,
        code: 'file-invalid-type',
        reason: 'File type is not allowed',
      },
    ]);
  });

  it('replaces a file in single mode and rejects additional dropped files', () => {
    const onValueChange = vi.fn();
    const first = new File(['a'], 'first.txt', { type: 'text/plain' });
    const second = new File(['b'], 'second.txt', { type: 'text/plain' });

    render(<TestComponent onValueChange={onValueChange} />);

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [first, second], types: ['Files'] },
    });

    expect(screen.getByTestId('files')).toHaveTextContent('first.txt');
    expect(screen.getByTestId('rejected')).toHaveTextContent(
      'too-many-files:Only one file is allowed'
    );
  });

  it('restores the existing single file when a replacement is rejected', () => {
    const existing = new File(['image'], 'existing.png', {
      type: 'image/png',
    });
    const invalid = new File(['text'], 'invalid.txt', { type: 'text/plain' });

    render(
      <TestComponent accept='image/*' defaultValue={[existing]} />
    );

    const input = screen.getByTestId('input') as HTMLInputElement;
    (input as unknown as { _files?: FileListMock })._files = new FileListMock([
      invalid,
    ]);

    fireEvent.change(input);

    expect(screen.getByTestId('files')).toHaveTextContent('existing.png');
    expect(screen.getByTestId('rejected')).toHaveTextContent(
      'file-invalid-type:File type is not allowed'
    );
    expect(Array.from(input.files ?? [])).toEqual([existing]);
  });

  it('removes only one occurrence of the same File object', () => {
    const file = new File(['x'], 'duplicate.txt', { type: 'text/plain' });
    const onValueChange = vi.fn();

    render(
      <TestComponent
        multiple
        value={[file, file]}
        onValueChange={onValueChange}
      />
    );

    fireEvent.click(screen.getByTestId('remove-first'));

    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it('resets uncontrolled state and the native input to defaultValue', async () => {
    const defaultFile = new File(['a'], 'default.txt', {
      type: 'text/plain',
    });
    const nextFile = new File(['b'], 'next.txt', { type: 'text/plain' });

    render(
      <TestComponent
        multiple
        defaultValue={[defaultFile]}
      />
    );

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [nextFile], types: ['Files'] },
    });
    expect(screen.getByTestId('files')).toHaveTextContent(
      'default.txt,next.txt'
    );

    fireEvent.reset(screen.getByTestId('form'));

    await waitFor(() => {
      expect(screen.getByTestId('files')).toHaveTextContent('default.txt');
      expect(Array.from(input.files ?? [])).toEqual([defaultFile]);
    });
  });

  it('continues to work when DataTransfer construction fails', () => {
    const originalDataTransfer = globalThis.DataTransfer;
    vi.stubGlobal(
      'DataTransfer',
      class {
        constructor() {
          throw new Error('Unsupported');
        }
      }
    );
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({ onValueChange })
    );
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    act(() => {
      result.current.onInputChange({
        currentTarget: {
          files: [file] as unknown as FileList,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.files).toEqual([file]);
    expect(onValueChange).toHaveBeenCalledWith([file]);

    vi.stubGlobal('DataTransfer', originalDataTransfer);
  });
});
