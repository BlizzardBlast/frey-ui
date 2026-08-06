import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useControllableValue } from '../hooks/useControllableState';
import {
  type FileUploadRejected,
  type FileValidationRule,
  getFileValidationError,
} from './fileValidation';
import { useFileUploadDragState } from './useFileUploadDragState';

const EMPTY_FILES: File[] = [];

export type UseFileUploadStateOptions = FileValidationRule & {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onFilesRejected?: (rejected: FileUploadRejected[]) => void;
  disabled?: boolean;
};

export type UseFileUploadStateReturn = {
  files: File[];
  rejected: FileUploadRejected[];
  statusMessage: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  openFileDialog: () => void;
  removeFile: (file: File) => void;
  removeFileAt: (index: number) => void;
  clearFiles: () => void;
  isDragOver: boolean;
  onDragEnter: React.DragEventHandler<HTMLElement>;
  onDragLeave: React.DragEventHandler<HTMLElement>;
  onDragOver: React.DragEventHandler<HTMLElement>;
  onDragEnd: React.DragEventHandler<HTMLElement>;
  onDrop: React.DragEventHandler<HTMLElement>;
};

function getSelectionMessage(
  acceptedCount: number,
  rejectedCount: number
): string {
  const parts: string[] = [];

  if (acceptedCount > 0) {
    parts.push(
      `${acceptedCount} ${acceptedCount === 1 ? 'file' : 'files'} added`
    );
  }

  if (rejectedCount > 0) {
    parts.push(
      `${rejectedCount} ${rejectedCount === 1 ? 'file was' : 'files were'} rejected`
    );
  }

  return parts.join('. ');
}

export function useFileUploadState(
  options: UseFileUploadStateOptions
): UseFileUploadStateReturn {
  const {
    value,
    defaultValue = EMPTY_FILES,
    onValueChange,
    onFilesRejected,
    disabled: disabledProp,
    accept,
    maxSize,
    minSize,
    maxFiles,
    multiple,
    validate,
  } = options;

  const isControlled = value !== undefined;
  const [files, setFiles] = useControllableValue<File[]>(
    value,
    defaultValue,
    onValueChange
  );
  const [rejected, setRejected] = useState<FileUploadRejected[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  const disabled = Boolean(disabledProp);

  const validationRule = useMemo<FileValidationRule>(
    () => ({
      accept,
      maxSize,
      minSize,
      maxFiles,
      multiple: multiple === true,
      validate,
    }),
    [accept, maxSize, minSize, maxFiles, multiple, validate]
  );

  const syncInputFiles = useCallback((nextFiles: File[]): boolean => {
    const input = inputRef.current;

    if (!input) {
      return false;
    }

    if (nextFiles.length === 0) {
      input.value = '';
      return true;
    }

    if (typeof DataTransfer === 'undefined') {
      return false;
    }

    try {
      const dataTransfer = new DataTransfer();

      for (const file of nextFiles) {
        dataTransfer.items.add(file);
      }

      input.files = dataTransfer.files;
      return true;
    } catch {
      return false;
    }
  }, []);

  const proposeFiles = useCallback(
    (nextFiles: File[]) => {
      setFiles(nextFiles);

      if (isControlled) {
        syncInputFiles(filesRef.current);
        return;
      }

      filesRef.current = nextFiles;
      syncInputFiles(nextFiles);
    },
    [isControlled, setFiles, syncInputFiles]
  );

  const processFiles = useCallback(
    (incoming: File[]) => {
      if (disabled) {
        return;
      }

      const accepted: File[] = [];
      const nextRejected: FileUploadRejected[] = [];
      const isMultiple = validationRule.multiple === true;
      let currentFiles = isMultiple ? [...filesRef.current] : [];

      for (const file of incoming) {
        const validationError = getFileValidationError(
          file,
          validationRule,
          currentFiles
        );

        if (validationError) {
          nextRejected.push({ file, ...validationError });
          continue;
        }

        currentFiles = isMultiple ? [...currentFiles, file] : [file];
        accepted.push(file);
      }

      setRejected(nextRejected);
      setStatusMessage(
        getSelectionMessage(accepted.length, nextRejected.length)
      );

      if (nextRejected.length > 0) {
        onFilesRejected?.(nextRejected);
      }

      if (accepted.length > 0) {
        proposeFiles(currentFiles);
        return;
      }

      syncInputFiles(filesRef.current);
    },
    [disabled, onFilesRejected, proposeFiles, syncInputFiles, validationRule]
  );

  const removeFileAt = useCallback(
    (index: number) => {
      const currentFiles = filesRef.current;
      const removedFile = currentFiles[index];

      if (disabled || !removedFile) {
        return;
      }

      const nextFiles = [
        ...currentFiles.slice(0, index),
        ...currentFiles.slice(index + 1),
      ];

      proposeFiles(nextFiles);
      setRejected([]);
      setStatusMessage(`${removedFile.name} removed`);
    },
    [disabled, proposeFiles]
  );

  const removeFile = useCallback(
    (file: File) => {
      removeFileAt(filesRef.current.indexOf(file));
    },
    [removeFileAt]
  );

  const clearFiles = useCallback(() => {
    if (disabled) {
      return;
    }

    proposeFiles([]);
    setRejected([]);
    setStatusMessage('Files cleared');
  }, [disabled, proposeFiles]);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = event.currentTarget.files;

      if (!inputFiles || inputFiles.length === 0) {
        return;
      }

      processFiles(Array.from(inputFiles));
    },
    [processFiles]
  );

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  useEffect(() => {
    syncInputFiles(files);
  }, [files, syncInputFiles]);

  useEffect(() => {
    const form = inputRef.current?.form;

    if (!form) {
      return;
    }

    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const handleReset = () => {
      setRejected([]);
      setStatusMessage('');

      if (!isControlled) {
        filesRef.current = defaultValue;
        setFiles(defaultValue);
      }

      if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
      }

      resetTimer = setTimeout(() => {
        syncInputFiles(isControlled ? filesRef.current : defaultValue);
      }, 0);
    };

    form.addEventListener('reset', handleReset);

    return () => {
      form.removeEventListener('reset', handleReset);

      if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
      }
    };
  }, [defaultValue, isControlled, setFiles, syncInputFiles]);

  const {
    isDragOver,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDragEnd,
    onDrop,
  } = useFileUploadDragState(processFiles, disabled);

  return useMemo(
    () => ({
      files,
      rejected,
      statusMessage,
      inputRef,
      onInputChange,
      openFileDialog,
      removeFile,
      removeFileAt,
      clearFiles,
      isDragOver,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDragEnd,
      onDrop,
    }),
    [
      clearFiles,
      files,
      isDragOver,
      onDragEnd,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      onInputChange,
      openFileDialog,
      rejected,
      removeFile,
      removeFileAt,
      statusMessage,
    ]
  );
}
