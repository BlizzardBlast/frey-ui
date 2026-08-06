import type React from 'react';
import { useMemo, useRef } from 'react';
import Field from '../Field';
import styles from './fileUpload.module.css';
import {
  FileUploadContext,
  type FileUploadContextValue,
} from './FileUploadContext';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadList } from './FileUploadList';
import type { FileUploadRejected } from './fileValidation';
import {
  type UseFileUploadStateOptions,
  type UseFileUploadStateReturn,
  useFileUploadState,
} from './useFileUploadState';

export type FileUploadProps = UseFileUploadStateOptions & {
  children?: React.ReactNode;
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
};

type FileUploadRootComponent = React.FC<Readonly<FileUploadProps>>;

type FileUploadControlProps = {
  children?: React.ReactNode;
  state: UseFileUploadStateReturn;
  inputId: string;
  labelId: string;
  describedBy?: string;
  hasError: boolean;
  isRequired: boolean;
  disabled: boolean;
  isMultiple: boolean;
  name?: string;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  triggerRef: React.RefObject<HTMLElement | null>;
};

function summarizeRejections(
  rejected: ReadonlyArray<FileUploadRejected>
): string | undefined {
  const reasons = [...new Set(rejected.map((item) => item.reason))];

  return reasons.length > 0 ? reasons.join('. ') : undefined;
}

function FileUploadControl({
  children,
  state,
  inputId,
  labelId,
  describedBy,
  hasError,
  isRequired,
  disabled,
  isMultiple,
  name,
  accept,
  maxSize,
  maxFiles,
  triggerRef,
}: Readonly<FileUploadControlProps>) {
  const {
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
  } = state;
  const contextValue = useMemo<FileUploadContextValue>(
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
      inputId,
      labelId,
      describedBy,
      hasError,
      isRequired,
      disabled,
      isMultiple,
      accept,
      maxSize,
      maxFiles,
      triggerRef,
    }),
    [
      accept,
      clearFiles,
      describedBy,
      disabled,
      files,
      hasError,
      inputId,
      inputRef,
      isDragOver,
      isMultiple,
      isRequired,
      labelId,
      maxFiles,
      maxSize,
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
      triggerRef,
    ]
  );

  return (
    <>
      <input
        id={inputId}
        name={name}
        type='file'
        ref={inputRef}
        onChange={onInputChange}
        onInvalid={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        accept={accept}
        multiple={isMultiple}
        disabled={disabled}
        required={isRequired && files.length === 0}
        className={styles.input}
        tabIndex={-1}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
      />

      <FileUploadContext.Provider value={contextValue}>
        {children ?? (
          <>
            <FileUploadDropzone />
            <FileUploadList />
          </>
        )}
      </FileUploadContext.Provider>

      <span
        className={styles.visuallyHidden}
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {statusMessage}
      </span>
    </>
  );
}

export const FileUploadRoot: FileUploadRootComponent = function FileUploadRoot({
  children,
  label,
  hideLabel,
  helperText,
  error,
  required,
  id,
  name,
  className,
  style,
  ...stateOptions
}: Readonly<FileUploadProps>) {
  const state = useFileUploadState(stateOptions);
  const triggerRef = useRef<HTMLElement | null>(null);
  const disabled = Boolean(stateOptions.disabled);
  const isRequired = Boolean(required);
  const isMultiple = stateOptions.multiple === true;
  const fieldError = error ?? summarizeRejections(state.rejected);

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      error={fieldError}
      helperText={helperText}
      required={required}
      disabled={disabled}
      id={id}
      className={className}
      style={style}
      labelElement='span'
    >
      {({ inputId, labelId, describedBy, hasError }) => (
        <fieldset
          className={styles.root}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
        >
          <FileUploadControl
            state={state}
            inputId={inputId}
            labelId={labelId}
            describedBy={describedBy}
            hasError={hasError}
            isRequired={isRequired}
            disabled={disabled}
            isMultiple={isMultiple}
            name={name}
            accept={stateOptions.accept}
            maxSize={stateOptions.maxSize}
            maxFiles={stateOptions.maxFiles}
            triggerRef={triggerRef}
          >
            {children}
          </FileUploadControl>
        </fieldset>
      )}
    </Field>
  );
};

FileUploadRoot.displayName = 'FileUpload';
