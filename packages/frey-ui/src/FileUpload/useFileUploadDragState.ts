import { useCallback, useEffect, useRef, useState } from 'react';

export type UseFileUploadDragStateReturn = {
  isDragOver: boolean;
  onDragEnter: React.DragEventHandler<HTMLElement>;
  onDragLeave: React.DragEventHandler<HTMLElement>;
  onDragOver: React.DragEventHandler<HTMLElement>;
  onDragEnd: React.DragEventHandler<HTMLElement>;
  onDrop: React.DragEventHandler<HTMLElement>;
};

function hasFilePayload(event: React.DragEvent<HTMLElement>): boolean {
  const types = event.dataTransfer?.types;

  if (!types || types.length === 0) {
    return Boolean(event.dataTransfer?.files?.length);
  }

  return Array.from(types).includes('Files');
}

export function useFileUploadDragState(
  onFilesDrop?: (files: File[]) => void,
  disabled = false
): UseFileUploadDragStateReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const resetDragState = useCallback(() => {
    dragCounterRef.current = 0;
    setIsDragOver(false);
  }, []);

  const handleDragEnter: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || !hasFilePayload(event)) {
        return;
      }

      event.preventDefault();
      dragCounterRef.current += 1;
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || dragCounterRef.current === 0) {
        return;
      }

      event.preventDefault();
      dragCounterRef.current -= 1;

      if (dragCounterRef.current === 0) {
        resetDragState();
      }
    },
    [disabled, resetDragState]
  );

  const handleDragOver: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || !hasFilePayload(event)) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [disabled]
  );

  const handleDrop: React.DragEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || !hasFilePayload(event)) {
        return;
      }

      event.preventDefault();
      resetDragState();

      const droppedFiles = event.dataTransfer?.files;

      if (!droppedFiles || droppedFiles.length === 0) {
        return;
      }

      onFilesDrop?.(Array.from(droppedFiles));
    },
    [disabled, onFilesDrop, resetDragState]
  );

  useEffect(() => {
    if (disabled) {
      resetDragState();
    }
  }, [disabled, resetDragState]);

  useEffect(() => {
    /* v8 ignore next 3 -- React effects do not execute during SSR. */
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('dragend', resetDragState);
    window.addEventListener('drop', resetDragState);

    return () => {
      window.removeEventListener('dragend', resetDragState);
      window.removeEventListener('drop', resetDragState);
    };
  }, [resetDragState]);

  return {
    isDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDragEnd: resetDragState,
    onDrop: handleDrop,
  };
}
