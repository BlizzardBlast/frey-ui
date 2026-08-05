import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useFileUploadDragState } from './useFileUploadDragState';

function createDragEvent(
  currentTarget: HTMLElement,
  relatedTarget: Element | null = null,
  dataTransferFiles: File[] = []
): React.DragEvent<HTMLElement> {
  let defaultPrevented = false;

  return {
    currentTarget,
    relatedTarget,
    target: currentTarget,
    preventDefault: () => {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
    dataTransfer: {
      files: dataTransferFiles as unknown as FileList,
    } as unknown as DataTransfer,
    bubbles: true,
    cancelable: true,
    nativeEvent: new Event('drag'),
  } as unknown as React.DragEvent<HTMLElement>;
}

function TestComponent({ onDrop }: { onDrop?: (files: File[]) => void }) {
  const { isDragOver, ...drag } = useFileUploadDragState(onDrop);
  return (
    <div data-testid='dropzone' data-dragover={String(isDragOver)} {...drag}>
      <span data-testid='child'>Child</span>
    </div>
  );
}

describe('useFileUploadDragState', () => {
  it('starts with dragOver false', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('dropzone').dataset.dragover).toBe('false');
  });

  it('sets dragOver true on dragEnter', () => {
    render(<TestComponent />);
    const zone = screen.getByTestId('dropzone');
    fireEvent.dragEnter(zone);
    expect(zone.dataset.dragover).toBe('true');
  });

  it('sets dragOver false on dragLeave', () => {
    render(<TestComponent />);
    const zone = screen.getByTestId('dropzone');
    fireEvent.dragEnter(zone);
    fireEvent.dragLeave(zone);
    expect(zone.dataset.dragover).toBe('false');
  });

  it('prevents default on dragOver', () => {
    const { result } = renderHook(() => useFileUploadDragState());
    const event = createDragEvent(document.body);
    act(() => {
      result.current.onDragOver(event);
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it('calls onDrop with files from dataTransfer', () => {
    const onDrop = vi.fn();
    render(<TestComponent onDrop={onDrop} />);
    const zone = screen.getByTestId('dropzone');
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onDrop).toHaveBeenCalledWith([file]);
    expect(zone.dataset.dragover).toBe('false');
  });

  it('does not call onDrop when dataTransfer has no files', () => {
    const onDrop = vi.fn();
    render(<TestComponent onDrop={onDrop} />);
    const zone = screen.getByTestId('dropzone');
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('keeps dragOver true when leaving toward a child element', () => {
    const { result } = renderHook(() => useFileUploadDragState());
    const zone = document.createElement('div');
    const child = document.createElement('span');
    zone.appendChild(child);

    act(() => {
      result.current.onDragEnter(createDragEvent(zone));
      result.current.onDragEnter(createDragEvent(zone));
      result.current.onDragLeave(createDragEvent(zone, child));
    });

    expect(result.current.isDragOver).toBe(true);
  });
});
