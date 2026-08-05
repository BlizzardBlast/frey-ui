import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useFileUploadDragState } from './useFileUploadDragState';

type DragEventOptions = {
  files?: File[];
  types?: string[];
};

function createDragEvent({
  files,
  types,
}: DragEventOptions = {}): React.DragEvent<HTMLElement> & {
  preventDefault: ReturnType<typeof vi.fn>;
} {
  const preventDefault = vi.fn();
  const dataTransfer = {
    files: files as unknown as FileList,
    types,
    dropEffect: 'none' as DataTransfer['dropEffect'],
  } as unknown as DataTransfer;

  return {
    preventDefault,
    dataTransfer,
  } as unknown as React.DragEvent<HTMLElement> & {
    preventDefault: ReturnType<typeof vi.fn>;
  };
}

describe('useFileUploadDragState remaining branches', () => {
  it('falls back to files when drag types are unavailable', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useFileUploadDragState());
    const fileEvent = createDragEvent({ files: [file] });
    const emptyEvent = createDragEvent({ files: [] });

    act(() => {
      result.current.onDragEnter(fileEvent);
    });
    expect(fileEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isDragOver).toBe(true);

    act(() => {
      result.current.onDragEnd(fileEvent);
      result.current.onDragEnter(emptyEvent);
    });
    expect(emptyEvent.preventDefault).not.toHaveBeenCalled();
    expect(result.current.isDragOver).toBe(false);
  });

  it('uses a nested drag counter and ignores an unmatched leave', () => {
    const { result } = renderHook(() => useFileUploadDragState());
    const fileEvent = createDragEvent({ files: [], types: ['Files'] });

    act(() => {
      result.current.onDragLeave(fileEvent);
    });
    expect(fileEvent.preventDefault).not.toHaveBeenCalled();

    act(() => {
      result.current.onDragEnter(fileEvent);
      result.current.onDragEnter(fileEvent);
      result.current.onDragLeave(fileEvent);
    });
    expect(result.current.isDragOver).toBe(true);

    act(() => {
      result.current.onDragLeave(fileEvent);
    });
    expect(result.current.isDragOver).toBe(false);
  });

  it('sets copy drop effect only for file drags', () => {
    const { result } = renderHook(() => useFileUploadDragState());
    const fileEvent = createDragEvent({ files: [], types: ['Files'] });
    const textEvent = createDragEvent({ files: [], types: ['text/plain'] });

    act(() => {
      result.current.onDragOver(fileEvent);
      result.current.onDragOver(textEvent);
    });

    expect(fileEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(fileEvent.dataTransfer.dropEffect).toBe('copy');
    expect(textEvent.preventDefault).not.toHaveBeenCalled();
    expect(textEvent.dataTransfer.dropEffect).toBe('none');
  });

  it('handles empty drops and optional drop callbacks', () => {
    const onFilesDrop = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useFileUploadDragState(callback),
      {
        initialProps: {
          callback: onFilesDrop as ((files: File[]) => void) | undefined,
        },
      }
    );
    const emptyEvent = createDragEvent({ files: [], types: ['Files'] });
    const missingFilesEvent = createDragEvent({ types: ['Files'] });
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const fileEvent = createDragEvent({ files: [file], types: ['Files'] });

    act(() => {
      result.current.onDrop(emptyEvent);
      result.current.onDrop(missingFilesEvent);
      result.current.onDrop(fileEvent);
    });
    expect(onFilesDrop).toHaveBeenCalledWith([file]);

    rerender({ callback: undefined });
    act(() => {
      result.current.onDrop(fileEvent);
    });
    expect(onFilesDrop).toHaveBeenCalledTimes(1);
  });

  it('ignores every handler while disabled and resets when disabled changes', () => {
    const onFilesDrop = vi.fn();
    const { result, rerender } = renderHook(
      ({ disabled }) => useFileUploadDragState(onFilesDrop, disabled),
      { initialProps: { disabled: false } }
    );
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const fileEvent = createDragEvent({ files: [file], types: ['Files'] });

    act(() => {
      result.current.onDragEnter(fileEvent);
    });
    expect(result.current.isDragOver).toBe(true);

    rerender({ disabled: true });
    expect(result.current.isDragOver).toBe(false);

    act(() => {
      result.current.onDragEnter(fileEvent);
      result.current.onDragLeave(fileEvent);
      result.current.onDragOver(fileEvent);
      result.current.onDrop(fileEvent);
    });
    expect(result.current.isDragOver).toBe(false);
    expect(onFilesDrop).not.toHaveBeenCalled();
  });

  it('resets from window drag cancellation events and onDragEnd', () => {
    const { result } = renderHook(() => useFileUploadDragState());
    const fileEvent = createDragEvent({ files: [], types: ['Files'] });

    act(() => {
      result.current.onDragEnter(fileEvent);
      window.dispatchEvent(new Event('dragend'));
    });
    expect(result.current.isDragOver).toBe(false);

    act(() => {
      result.current.onDragEnter(fileEvent);
      window.dispatchEvent(new Event('drop'));
    });
    expect(result.current.isDragOver).toBe(false);

    act(() => {
      result.current.onDragEnter(fileEvent);
      result.current.onDragEnd(fileEvent);
    });
    expect(result.current.isDragOver).toBe(false);
  });
});
