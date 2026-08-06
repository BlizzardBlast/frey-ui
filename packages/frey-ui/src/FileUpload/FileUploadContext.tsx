import { createContext, useContext } from 'react';
import type { UseFileUploadStateReturn } from './useFileUploadState';

export type FileUploadContextValue = UseFileUploadStateReturn & {
  inputId: string;
  labelId: string;
  describedBy?: string;
  hasError: boolean;
  isRequired: boolean;
  disabled: boolean;
  isMultiple: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export const FileUploadContext: React.Context<FileUploadContextValue | null> =
  createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(): FileUploadContextValue {
  const value = useContext(FileUploadContext);

  if (!value) {
    throw new Error(
      'FileUpload compound components must be rendered inside <FileUpload>'
    );
  }

  return value;
}
