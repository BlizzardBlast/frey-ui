import React, { useRef } from 'react';
import Field from '../Field';
import styles from './fileUpload.module.css';
import { FileUploadContext } from './FileUploadContext';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadList } from './FileUploadList';
import type { FileUploadRejected } from './fileValidation';
import {
  type UseFileUploadStateOptions,
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

function summarizeRejections(
  rejected: ReadonlyArray<FileUploadRejected>
): string | undefined {
  const reasons = [...new Set(rejected.map((item) => item.reason))];

  return reasons.length > 0 ? reasons.join('. ') : undefined;
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
  const fieldError = error ?? summarizeRejections(state.rejected);
  const defaultChildren = (
    <>
      <FileUploadDropzone />
      <FileUploadList />
    </>
  );

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
        <div
          className={styles.root}
          role='group'
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          aria-required={isRequired || undefined}
        >
          <input
            id={inputId}
            name={name}
            type='file'
            ref={state.inputRef}
            onChange={state.onInputChange}
            onInvalid={(event) => {
              event.preventDefault();
              triggerRef.current?.focus();
            }}
            accept={stateOptions.accept}
            multiple={stateOptions.multiple}
            disabled={disabled}
            required={isRequired && state.files.length === 0}
            className={styles.input}
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            aria-required={isRequired || undefined}
          />

          <FileUploadContext.Provider
            value={{
              ...state,
              inputId,
              labelId,
              describedBy,
              hasError,
              isRequired,
              disabled,
              isMultiple: stateOptions.multiple === true,
              accept: stateOptions.accept,
              maxSize: stateOptions.maxSize,
              maxFiles: stateOptions.maxFiles,
              triggerRef,
            }}
          >
            {children ?? defaultChildren}
          </FileUploadContext.Provider>

          <span
            className={styles.visuallyHidden}
            role='status'
            aria-live='polite'
            aria-atomic='true'
          >
            {state.statusMessage}
          </span>
        </div>
      )}
    </Field>
  );
};

FileUploadRoot.displayName = 'FileUpload';
