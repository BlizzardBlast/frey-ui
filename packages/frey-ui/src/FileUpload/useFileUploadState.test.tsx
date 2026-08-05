import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
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

// jsdom does not implement DataTransfer or a settable FileList on file inputs,
// so we stub both here to exercise the syncInputFiles code path under test.
const originalFilesDescriptor = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'files'
);

beforeAll(() => {
  vi.stubGlobal('DataTransfer', DataTransferMock);

  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    configurable: true,
    enumerable: true,
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
    <div>
      <input
        type='file'
        ref={state.inputRef}
        onChange={state.onInputChange}
        data-testid='input'
        multiple={Boolean(props.multiple)}
      />
      <button type='button' onClick={state.openFileDialog} data-testid='open'>
        Open
      </button>
      <button
        type='button'
        data-testid='remove'
        onClick={() => state.files[0] && state.removeFile(state.files[0])}
      >
        Remove
      </button>
      <button
        type='button'
        data-testid='dropzone'
        onDragEnter={state.onDragEnter}
        onDragLeave={state.onDragLeave}
        onDragOver={state.onDragOver}
        onDrop={state.onDrop}
      />
      <span data-testid='files'>
        {state.files.map((file) => file.name).join(',')}
      </span>
      <span data-testid='rejected'>
        {state.rejected.map((rejected) => rejected.reason).join(',')}
      </span>
    </div>
  );
}

describe('useFileUploadState', () => {
  it('starts with an empty file list', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('files').textContent).toBe('');
    expect(screen.getByTestId('rejected').textContent).toBe('');
  });

  it('adds valid files from a drop event', () => {
    const onValueChange = vi.fn();
    render(<TestComponent multiple onValueChange={onValueChange} />);

    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByTestId('files').textContent).toBe('greeting.txt');
    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it('adds multiple valid files when multiple is true', () => {
    const onValueChange = vi.fn();
    render(<TestComponent multiple onValueChange={onValueChange} />);

    const a = new File(['a'], 'a.txt', { type: 'text/plain' });
    const b = new File(['b'], 'b.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [a, b] },
    });

    expect(screen.getByTestId('files').textContent).toBe('a.txt,b.txt');
    expect(onValueChange).toHaveBeenCalledWith([a, b]);
  });

  it('rejects invalid files and reports them', () => {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <TestComponent
        accept='image/*'
        onValueChange={onValueChange}
        onFilesRejected={onFilesRejected}
      />
    );

    const file = new File(['x'], 'script.exe', { type: '' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByTestId('files').textContent).toBe('');
    expect(screen.getByTestId('rejected').textContent).toBe(
      'File type is not allowed'
    );
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFilesRejected).toHaveBeenCalledWith([
      { file, reason: 'File type is not allowed' },
    ]);
  });

  it('replaces the existing file in single-file mode', () => {
    const onValueChange = vi.fn();
    render(<TestComponent onValueChange={onValueChange} />);

    const first = new File(['first'], 'first.txt', { type: 'text/plain' });
    const second = new File(['second'], 'second.txt', { type: 'text/plain' });

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [first] },
    });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [second] },
    });

    expect(screen.getByTestId('files').textContent).toBe('second.txt');
    expect(onValueChange).toHaveBeenLastCalledWith([second]);
  });

  it('respects maxFiles and rejects the rest', () => {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <TestComponent
        multiple
        maxFiles={2}
        onValueChange={onValueChange}
        onFilesRejected={onFilesRejected}
      />
    );

    const a = new File(['a'], 'a.txt', { type: 'text/plain' });
    const b = new File(['b'], 'b.txt', { type: 'text/plain' });
    const c = new File(['c'], 'c.txt', { type: 'text/plain' });

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [a, b, c] },
    });

    expect(screen.getByTestId('files').textContent).toBe('a.txt,b.txt');
    expect(screen.getByTestId('rejected').textContent).toBe(
      'Maximum number of files reached'
    );
    expect(onValueChange).toHaveBeenCalledWith([a, b]);
    expect(onFilesRejected).toHaveBeenCalledWith([
      { file: c, reason: 'Maximum number of files reached' },
    ]);
  });

  it('removes a selected file', () => {
    const onValueChange = vi.fn();
    render(<TestComponent multiple onValueChange={onValueChange} />);

    const a = new File(['a'], 'a.txt', { type: 'text/plain' });
    const b = new File(['b'], 'b.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [a, b] },
    });

    fireEvent.click(screen.getByTestId('remove'));

    expect(screen.getByTestId('files').textContent).toBe('b.txt');
    expect(onValueChange).toHaveBeenLastCalledWith([b]);
  });

  it('does not process files when disabled', () => {
    const onValueChange = vi.fn();
    render(<TestComponent disabled onValueChange={onValueChange} />);

    const file = new File(['x'], 'disabled.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByTestId('files').textContent).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('reflects controlled value without calling onValueChange', () => {
    const onValueChange = vi.fn();
    const file = new File(['x'], 'controlled.txt', { type: 'text/plain' });
    const { rerender } = render(
      <TestComponent value={[file]} onValueChange={onValueChange} />
    );

    expect(screen.getByTestId('files').textContent).toBe('controlled.txt');

    const next = new File(['y'], 'next.txt', { type: 'text/plain' });
    rerender(<TestComponent value={[next]} onValueChange={onValueChange} />);

    expect(screen.getByTestId('files').textContent).toBe('next.txt');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('adds files from an input change event', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useFileUploadState({ onValueChange }));

    const file = new File(['x'], 'input.txt', { type: 'text/plain' });
    act(() => {
      result.current.onInputChange({
        currentTarget: { files: [file] as unknown as FileList },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.files).toEqual([file]);
    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it('does nothing when the input change event has no files', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useFileUploadState({ onValueChange }));

    act(() => {
      result.current.onInputChange({
        currentTarget: { files: { length: 0 } as FileList },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.files).toEqual([]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not call onFilesRejected when it is not provided', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({ onValueChange, accept: 'image/*' })
    );

    const file = new File(['x'], 'script.exe', { type: '' });
    act(() => {
      result.current.onInputChange({
        currentTarget: { files: [file] as unknown as FileList },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.rejected).toEqual([
      { file, reason: 'File type is not allowed' },
    ]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not open the file dialog when disabled', () => {
    const { result } = renderHook(() => useFileUploadState({ disabled: true }));
    const input = document.createElement('input');
    const clickSpy = vi.spyOn(input, 'click');
    act(() => {
      result.current.inputRef.current = input;
      result.current.openFileDialog();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });
});
