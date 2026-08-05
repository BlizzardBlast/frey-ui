import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useControllableValue } from '../hooks/useControllableState';
import {
  type FileUploadRejected,
  type FileValidationRule,
  validateFile,
} from './fileValidation';
import { useFileUploadDragState } from './useFileUploadDragState';

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
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  openFileDialog: () => void;
  removeFile: (file: File) => void;
  isDragOver: boolean;
  onDragEnter: React.DragEventHandler<HTMLElement>;
  onDragLeave: React.DragEventHandler<HTMLElement>;
  onDragOver: React.DragEventHandler<HTMLElement>;
  onDrop: React.DragEventHandler<HTMLElement>;
};

export function useFileUploadState(
  options: UseFileUploadStateOptions
): UseFileUploadStateReturn {
  const {
    value,
    defaultValue = [],
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

  const [files, setFiles] = useControllableValue<File[]>(
    value,
    defaultValue,
    onValueChange
  );
  const [rejected, setRejected] = useState<FileUploadRejected[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const disabled = Boolean(disabledProp);

  const validationRule = useMemo<FileValidationRule>(
    () => ({
      accept,
      maxSize,
      minSize,
      maxFiles,
      multiple,
      validate,
    }),
    [accept, maxSize, minSize, maxFiles, multiple, validate]
  );

  const syncInputFiles = useCallback((nextFiles: File[]) => {
    if (inputRef.current && typeof DataTransfer !== 'undefined') {
      const dataTransfer = new DataTransfer();
      for (const file of nextFiles) {
        dataTransfer.items.add(file);
      }
      inputRef.current.files = dataTransfer.files;
    }
  }, []);

  const processFiles = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) {
        return;
      }

      const accepted: File[] = [];
      const nextRejected: FileUploadRejected[] = [];
      const isMultiple = validationRule.multiple === true;
      let currentFiles = isMultiple ? [...files] : [];

      for (const file of incoming) {
        const reason = validateFile(file, validationRule, currentFiles);
        if (reason) {
          nextRejected.push({ file, reason });
          continue;
        }

        currentFiles = isMultiple ? [...currentFiles, file] : [file];
        accepted.push(file);

        if (!isMultiple) {
          break;
        }
      }

      setRejected(nextRejected);
      onFilesRejected?.(nextRejected);

      if (accepted.length > 0) {
        setFiles(currentFiles);
        syncInputFiles(currentFiles);
      }
    },
    [disabled, files, validationRule, setFiles, onFilesRejected, syncInputFiles]
  );

  const removeFile = useCallback(
    (file: File) => {
      const next = files.filter((f) => f !== file);
      setFiles(next);
      syncInputFiles(next);
    },
    [files, setFiles, syncInputFiles]
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = event.currentTarget.files;
      if (inputFiles && inputFiles.length > 0) {
        processFiles(Array.from(inputFiles));
      }
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

  const drag = useFileUploadDragState(processFiles);

  return {
    files,
    rejected,
    inputRef,
    onInputChange,
    openFileDialog,
    removeFile,
    ...drag,
  };
}
