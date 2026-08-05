import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFileUploadState } from './useFileUploadState';

function createInputChangeEvent(
  files: File[] | null
): React.ChangeEvent<HTMLInputElement> {
  return {
    currentTarget: {
      files:
        files === null
          ? null
          : (files as unknown as FileList),
    },
  } as React.ChangeEvent<HTMLInputElement>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useFileUploadState remaining branches', () => {
  it('announces plural accepted files', () => {
    const first = new File(['a'], 'first.txt', { type: 'text/plain' });
    const second = new File(['b'], 'second.txt', { type: 'text/plain' });
    const { result } = renderHook(() =>
      useFileUploadState({ multiple: true })
    );

    act(() => {
      result.current.onInputChange(createInputChangeEvent([first, second]));
    });

    expect(result.current.files).toEqual([first, second]);
    expect(result.current.statusMessage).toBe('2 files added');
  });

  it('announces plural rejections and mixed results without a callback', () => {
    const valid = new File(['a'], 'valid.png', { type: 'image/png' });
    const firstInvalid = new File(['b'], 'first.txt', { type: 'text/plain' });
    const secondInvalid = new File(['c'], 'second.txt', { type: 'text/plain' });
    const { result } = renderHook(() =>
      useFileUploadState({ multiple: true, accept: 'image/*' })
    );

    act(() => {
      result.current.onInputChange(
        createInputChangeEvent([firstInvalid, secondInvalid])
      );
    });
    expect(result.current.statusMessage).toBe('2 files were rejected');

    act(() => {
      result.current.onInputChange(
        createInputChangeEvent([valid, firstInvalid])
      );
    });
    expect(result.current.statusMessage).toBe(
      '1 file added. 1 file was rejected'
    );
  });

  it('does not process input files while disabled', () => {
    const onValueChange = vi.fn();
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const { result } = renderHook(() =>
      useFileUploadState({ disabled: true, onValueChange })
    );

    act(() => {
      result.current.onInputChange(createInputChangeEvent([file]));
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.statusMessage).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores missing and empty input file lists', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({ onValueChange })
    );

    act(() => {
      result.current.onInputChange(createInputChangeEvent(null));
      result.current.onInputChange(createInputChangeEvent([]));
    });

    expect(result.current.files).toEqual([]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps React state authoritative when DataTransfer is unavailable', () => {
    vi.stubGlobal('DataTransfer', undefined);
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useFileUploadState({}));
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.onInputChange(createInputChangeEvent([file]));
    });

    expect(result.current.files).toEqual([file]);
  });

  it('keeps React state authoritative when DataTransfer throws', () => {
    vi.stubGlobal(
      'DataTransfer',
      class {
        constructor() {
          throw new Error('Unavailable');
        }
      }
    );
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useFileUploadState({}));
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.onInputChange(createInputChangeEvent([file]));
    });

    expect(result.current.files).toEqual([file]);
  });

  it('removes by identity and ignores invalid indexes', () => {
    const first = new File(['a'], 'first.txt', { type: 'text/plain' });
    const second = new File(['b'], 'second.txt', { type: 'text/plain' });
    const missing = new File(['c'], 'missing.txt', { type: 'text/plain' });
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({
        multiple: true,
        defaultValue: [first, second],
        onValueChange,
      })
    );

    act(() => {
      result.current.removeFileAt(-1);
      result.current.removeFileAt(2);
      result.current.removeFile(missing);
    });
    expect(result.current.files).toEqual([first, second]);

    act(() => {
      result.current.removeFile(first);
    });
    expect(result.current.files).toEqual([second]);
    expect(result.current.statusMessage).toBe('first.txt removed');
  });

  it('does not remove files while disabled', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUploadState({
        disabled: true,
        defaultValue: [file],
        onValueChange,
      })
    );

    act(() => {
      result.current.removeFileAt(0);
    });

    expect(result.current.files).toEqual([file]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clears files, rejection state, native value, and status', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const { result } = renderHook(() =>
      useFileUploadState({ defaultValue: [file] })
    );
    const input = document.createElement('input');
    input.type = 'file';
    result.current.inputRef.current = input;

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.rejected).toEqual([]);
    expect(result.current.statusMessage).toBe('Files cleared');
    expect(input.value).toBe('');
  });

  it('opens the native dialog only while enabled', () => {
    const enabled = renderHook(() => useFileUploadState({}));
    const enabledInput = document.createElement('input');
    const enabledClick = vi.spyOn(enabledInput, 'click');
    enabled.result.current.inputRef.current = enabledInput;

    act(() => {
      enabled.result.current.openFileDialog();
    });
    expect(enabledClick).toHaveBeenCalledTimes(1);

    const disabled = renderHook(() =>
      useFileUploadState({ disabled: true })
    );
    const disabledInput = document.createElement('input');
    const disabledClick = vi.spyOn(disabledInput, 'click');
    disabled.result.current.inputRef.current = disabledInput;

    act(() => {
      disabled.result.current.openFileDialog();
    });
    expect(disabledClick).not.toHaveBeenCalled();
  });
});
