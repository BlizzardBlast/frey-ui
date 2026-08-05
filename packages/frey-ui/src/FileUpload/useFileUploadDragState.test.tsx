import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFileUploadDragState } from './useFileUploadDragState';

function TestComponent({
  onDrop,
  disabled,
}: {
  onDrop?: (files: File[]) => void;
  disabled?: boolean;
}) {
  const { isDragOver, ...dragHandlers } = useFileUploadDragState(
    onDrop,
    disabled
  );

  return (
    <div
      data-testid='dropzone'
      data-dragging={String(isDragOver)}
      {...dragHandlers}
    />
  );
}

describe('useFileUploadDragState', () => {
  it('ignores non-file drags', () => {
    render(<TestComponent />);
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['text/plain'] },
    });

    expect(dropzone).toHaveAttribute('data-dragging', 'false');
  });

  it('tracks nested file drags without flickering', () => {
    render(<TestComponent />);
    const dropzone = screen.getByTestId('dropzone');
    const child = document.createElement('span');
    dropzone.appendChild(child);

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    fireEvent.dragLeave(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
      relatedTarget: child,
    });

    expect(dropzone).toHaveAttribute('data-dragging', 'true');
  });

  it('processes dropped files and resets state', () => {
    const onDrop = vi.fn();
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    render(<TestComponent onDrop={onDrop} />);
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onDrop).toHaveBeenCalledWith([file]);
    expect(dropzone).toHaveAttribute('data-dragging', 'false');
  });

  it('does not process files when disabled', () => {
    const onDrop = vi.fn();
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    render(<TestComponent onDrop={onDrop} disabled />);

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onDrop).not.toHaveBeenCalled();
  });
});
