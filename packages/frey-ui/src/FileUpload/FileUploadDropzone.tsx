import clsx from 'clsx';
import React from 'react';
import Button from '../Button';
import { UploadIcon } from '../Icons';
import { useFileUploadContext } from './FileUploadContext';
import { FileUploadTrigger } from './FileUploadTrigger';
import styles from './fileUpload.module.css';
import { formatAcceptedTypes, formatFileSize } from './fileValidation';

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

type DragHandler = React.DragEventHandler<HTMLElement>;

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

function getDefaultHeading(isDragOver: boolean, isMultiple: boolean): string {
  if (isDragOver) {
    return isMultiple ? 'Drop files to add' : 'Drop the file to add';
  }

  return isMultiple ? 'Drag and drop files here' : 'Drag and drop a file here';
}

function composeDragHandler(
  externalHandler: DragHandler | undefined,
  internalHandler: DragHandler
): DragHandler {
  return (event) => {
    externalHandler?.(event);

    if (!event.defaultPrevented) {
      internalHandler(event);
    }
  };
}

export const FileUploadDropzone: FileUploadDropzoneComponent = React.forwardRef<
  HTMLElement,
  Readonly<FileUploadDropzoneProps>
>(function FileUploadDropzone(
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
  const defaultHeading = getDefaultHeading(
    context.isDragOver,
    context.isMultiple
  );
  const defaultDescription = getConstraintDescription(
    context.accept,
    context.maxSize,
    context.maxFiles,
    context.isMultiple
  );
  const handleDragEnter = composeDragHandler(onDragEnter, context.onDragEnter);
  const handleDragLeave = composeDragHandler(onDragLeave, context.onDragLeave);
  const handleDragOver = composeDragHandler(onDragOver, context.onDragOver);
  const handleDragEnd = composeDragHandler(onDragEnd, context.onDragEnd);
  const handleDrop = composeDragHandler(onDrop, context.onDrop);
  let accessibleLabelledBy = ariaLabelledBy;

  if (!accessibleLabelledBy && !ariaLabel) {
    accessibleLabelledBy = context.labelId;
  }

  return (
    <section
      {...dropzoneProps}
      ref={forwardedRef}
      className={clsx(styles.dropzone, className)}
      style={style}
      aria-label={ariaLabel}
      aria-labelledby={accessibleLabelledBy}
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
            <Button variant='secondary' size='sm' disabled={context.disabled}>
              Browse files
            </Button>
          </FileUploadTrigger>
        </>
      )}
    </section>
  );
});

FileUploadDropzone.displayName = 'FileUpload.Dropzone';
