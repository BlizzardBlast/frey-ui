import clsx from 'clsx';
import React from 'react';
import Button from '../Button';
import { UploadIcon } from '../Icons';
import styles from './fileUpload.module.css';
import { useFileUploadContext } from './FileUploadContext';
import { FileUploadTrigger } from './FileUploadTrigger';
import {
  formatAcceptedTypes,
  formatFileSize,
} from './fileValidation';

export type FileUploadDropzoneProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> & {
  children?: React.ReactNode;
  heading?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
};

type FileUploadDropzoneComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadDropzoneProps> & React.RefAttributes<HTMLElement>
>;

function getConstraintDescription(
  accept: string | undefined,
  maxSize: number | undefined,
  maxFiles: number | undefined,
  multiple: boolean
): string {
  const constraints: string[] = [];
  const acceptedTypes = formatAcceptedTypes(accept);

  if (acceptedTypes) {
    constraints.push(acceptedTypes);
  }

  if (typeof maxSize === 'number' && maxSize > 0) {
    constraints.push(`up to ${formatFileSize(maxSize)}`);
  }

  if (multiple && typeof maxFiles === 'number' && maxFiles > 0) {
    constraints.push(`maximum ${maxFiles} files`);
  }

  if (constraints.length > 0) {
    return constraints.join(' · ');
  }

  return multiple ? 'Select one or more files' : 'Select one file';
}

export const FileUploadDropzone: FileUploadDropzoneComponent =
  React.forwardRef<HTMLElement, Readonly<FileUploadDropzoneProps>>(
    function FileUploadDropzone(
      {
        children,
        heading,
        description,
        icon,
        className,
        style,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDragEnd,
        onDrop,
        ...dropzoneProps
      },
      forwardedRef
    ) {
      const context = useFileUploadContext();
      const defaultHeading = context.isDragOver
        ? `Drop ${context.isMultiple ? 'files' : 'the file'} to add`
        : `Drag and drop ${context.isMultiple ? 'files' : 'a file'} here`;
      const defaultDescription = getConstraintDescription(
        context.accept,
        context.maxSize,
        context.maxFiles,
        context.isMultiple
      );

      const handleDragEnter: React.DragEventHandler<HTMLElement> = (event) => {
        onDragEnter?.(event);

        if (!event.defaultPrevented) {
          context.onDragEnter(event);
        }
      };
      const handleDragLeave: React.DragEventHandler<HTMLElement> = (event) => {
        onDragLeave?.(event);

        if (!event.defaultPrevented) {
          context.onDragLeave(event);
        }
      };
      const handleDragOver: React.DragEventHandler<HTMLElement> = (event) => {
        onDragOver?.(event);

        if (!event.defaultPrevented) {
          context.onDragOver(event);
        }
      };
      const handleDragEnd: React.DragEventHandler<HTMLElement> = (event) => {
        onDragEnd?.(event);

        if (!event.defaultPrevented) {
          context.onDragEnd(event);
        }
      };
      const handleDrop: React.DragEventHandler<HTMLElement> = (event) => {
        onDrop?.(event);

        if (!event.defaultPrevented) {
          context.onDrop(event);
        }
      };

      return (
        <section
          {...dropzoneProps}
          ref={forwardedRef}
          className={clsx(styles.dropzone, className)}
          style={style}
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (ariaLabel ? undefined : context.labelId)
          }
          aria-disabled={context.disabled || undefined}
          data-dragging={context.isDragOver ? true : undefined}
          data-disabled={context.disabled ? true : undefined}
          data-invalid={context.hasError ? true : undefined}
          data-has-files={context.files.length > 0 ? true : undefined}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        >
          {children ?? (
            <>
              <span className={styles.dropzoneIcon} aria-hidden='true'>
                {icon ?? <UploadIcon size='xl' />}
              </span>

              <span className={styles.dropzoneCopy}>
                <span className={styles.dropzoneHeading}>
                  {heading ?? defaultHeading}
                </span>
                <span className={styles.dropzoneDescription}>
                  {description ?? defaultDescription}
                </span>
              </span>

              <FileUploadTrigger asChild>
                <Button
                  variant='secondary'
                  size='sm'
                  disabled={context.disabled}
                >
                  Browse files
                </Button>
              </FileUploadTrigger>
            </>
          )}
        </section>
      );
    }
  );

FileUploadDropzone.displayName = 'FileUpload.Dropzone';
