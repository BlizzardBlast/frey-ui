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

function createInputChangeEvent(
  files: File[]
): React.ChangeEvent<HTMLInputElement> {
  return {
    currentTarget: {
      files: files as unknown as FileList,
    },
  } as React.ChangeEvent<HTMLInputElement>;
}

function ControlledResetHarness({
  value,
  defaultValue,
  onValueChange,
}: Readonly<{
  value: File[];
  defaultValue: File[];
  onValueChange: (files: File[]) => void;
}>) {
  const state = useFileUploadState({ value, defaultValue, onValueChange });

  return (
    <form data-testid='form'>
      <input
        type='file'
        ref={state.inputRef}
        onChange={state.onInputChange}
        data-testid='input'
      />
      <span data-testid='files'>
        {state.files.map((file) => file.name).join(',')}
      </span>
    </form>
  );
}

describe('useFileUploadState controlled synchronization', () => {
  it('restores committed files when the parent declines a selection', () => {
    const committed = new File(['old'], 'committed.pdf', {
      type: 'application/pdf',
    });
    const proposed = new File(['new'], 'proposed.pdf', {
      type: 'application/pdf',
    });
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({ value: [committed], onValueChange })
    );
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.onInputChange(createInputChangeEvent([proposed]));
    });

    expect(onValueChange).toHaveBeenCalledWith([proposed]);
    expect(result.current.files).toEqual([committed]);
    expect(Array.from(input.files ?? [])).toEqual([committed]);
  });

  it('synchronizes the native input after delayed controlled acceptance', async () => {
    const committed = new File(['old'], 'committed.pdf', {
      type: 'application/pdf',
    });
    const proposed = new File(['new'], 'proposed.pdf', {
      type: 'application/pdf',
    });
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useFileUploadState({ value, onValueChange }),
      { initialProps: { value: [committed] } }
    );
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.onInputChange(createInputChangeEvent([proposed]));
    });
    expect(Array.from(input.files ?? [])).toEqual([committed]);

    rerender({ value: [proposed] });

    await waitFor(() => {
      expect(result.current.files).toEqual([proposed]);
      expect(Array.from(input.files ?? [])).toEqual([proposed]);
    });
  });

  it('restores committed files when removal and clearing are declined', () => {
    const first = new File(['first'], 'first.pdf', {
      type: 'application/pdf',
    });
    const second = new File(['second'], 'second.pdf', {
      type: 'application/pdf',
    });
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({
        value: [first, second],
        multiple: true,
        onValueChange,
      })
    );
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.removeFileAt(0);
    });

    expect(onValueChange).toHaveBeenLastCalledWith([second]);
    expect(result.current.files).toEqual([first, second]);
    expect(Array.from(input.files ?? [])).toEqual([first, second]);

    act(() => {
      result.current.clearFiles();
    });

    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(result.current.files).toEqual([first, second]);
    expect(Array.from(input.files ?? [])).toEqual([first, second]);
  });

  it('restores the controlled value after native form reset', async () => {
    const controlled = new File(['controlled'], 'controlled.pdf', {
      type: 'application/pdf',
    });
    const defaultFile = new File(['default'], 'default.pdf', {
      type: 'application/pdf',
    });
    const onValueChange = vi.fn();

    render(
      <ControlledResetHarness
        value={[controlled]}
        defaultValue={[defaultFile]}
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByTestId('input') as HTMLInputElement;

    await waitFor(() => {
      expect(Array.from(input.files ?? [])).toEqual([controlled]);
    });

    (input as unknown as { _files?: FileListMock })._files = new FileListMock([]);
    fireEvent.reset(screen.getByTestId('form'));

    await waitFor(() => {
      expect(screen.getByTestId('files')).toHaveTextContent('controlled.pdf');
      expect(Array.from(input.files ?? [])).toEqual([controlled]);
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not clear files through the imperative API while disabled', () => {
    const file = new File(['locked'], 'locked.pdf', {
      type: 'application/pdf',
    });
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({
        defaultValue: [file],
        disabled: true,
        onValueChange,
      })
    );

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toEqual([file]);
    expect(result.current.statusMessage).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
