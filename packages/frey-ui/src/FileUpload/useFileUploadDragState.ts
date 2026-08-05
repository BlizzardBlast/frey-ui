import { useCallback, useRef, useState } from 'react';

export type UseFileUploadDragStateReturn = {
  isDragOver: boolean;
  onDragEnter: React.DragEventHandler<HTMLElement>;
  onDragLeave: React.DragEventHandler<HTMLElement>;
  onDragOver: React.DragEventHandler<HTMLElement>;
  onDrop: React.DragEventHandler<HTMLElement>;
};

export function useFileUploadDragState(
  onDrop?: (files: File[]) => void
): UseFileUploadDragStateReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      event.preventDefault();
      dragCounterRef.current += 1;
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      event.preventDefault();
      dragCounterRef.current -= 1;

      if (
        dragCounterRef.current <= 0 ||
        !event.currentTarget.contains(event.relatedTarget as Node)
      ) {
        dragCounterRef.current = 0;
        setIsDragOver(false);
      }
    },
    []
  );

  const handleDragOver: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      event.preventDefault();
    },
    []
  );

  const handleDrop: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) {
        return;
      }

      onDrop?.(Array.from(files));
    },
    [onDrop]
  );

  return {
    isDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };
}
