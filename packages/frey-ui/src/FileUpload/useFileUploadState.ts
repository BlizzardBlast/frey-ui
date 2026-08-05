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
      multiple,
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

  const processFiles = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) {
        return;
      }

      const accepted: File[] = [];
      const nextRejected: FileUploadRejected[] = [];
      const isMultiple = validationRule.multiple === true;
      let currentFiles = isMultiple ? [...filesRef.current] : [];

      for (const file of incoming) {
        if (!isMultiple && accepted.length > 0) {
          nextRejected.push({
            file,
            code: 'too-many-files',
            reason: 'Only one file is allowed',
          });
          continue;
        }

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
        filesRef.current = currentFiles;
        setFiles(currentFiles);
        syncInputFiles(currentFiles);
      }
    },
    [
      disabled,
      onFilesRejected,
      setFiles,
      syncInputFiles,
      validationRule,
    ]
  );

  const removeFileAt = useCallback(
    (index: number) => {
      const currentFiles = filesRef.current;

      if (disabled || index < 0 || index >= currentFiles.length) {
        return;
      }

      const nextFiles = [...currentFiles];
      const [removedFile] = nextFiles.splice(index, 1);

      filesRef.current = nextFiles;
      setFiles(nextFiles);
      setRejected([]);
      syncInputFiles(nextFiles);

      if (removedFile) {
        setStatusMessage(`${removedFile.name} removed`);
      }
    },
    [disabled, setFiles, syncInputFiles]
  );

  const removeFile = useCallback(
    (file: File) => {
      removeFileAt(filesRef.current.indexOf(file));
    },
    [removeFileAt]
  );

  const clearFiles = useCallback(() => {
    filesRef.current = [];
    setFiles([]);
    setRejected([]);
    setStatusMessage('Files cleared');
    syncInputFiles([]);
  }, [setFiles, syncInputFiles]);

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

    const handleReset = () => {
      filesRef.current = defaultValue;
      setRejected([]);
      setStatusMessage('');
      setFiles(defaultValue);
      syncInputFiles(defaultValue);
    };

    form.addEventListener('reset', handleReset);

    return () => {
      form.removeEventListener('reset', handleReset);
    };
  }, [defaultValue, setFiles, syncInputFiles]);

  const drag = useFileUploadDragState(processFiles, disabled);

  return {
    files,
    rejected,
    statusMessage,
    inputRef,
    onInputChange,
    openFileDialog,
    removeFile,
    removeFileAt,
    clearFiles,
    ...drag,
  };
}
