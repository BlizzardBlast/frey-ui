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
type FileUploadVisualState = 'empty' | 'replace' | 'append';

function getVisualState(
  fileCount: number,
  multiple: boolean
): FileUploadVisualState {
  if (fileCount === 0) {
    return 'empty';
  }

  return multiple ? 'append' : 'replace';
}

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

function getDefaultHeading(
  isDragOver: boolean,
  visualState: FileUploadVisualState,
  isMultiple: boolean
): string {
  if (isDragOver) {
    if (visualState === 'replace') {
      return 'Drop the file to replace';
    }

    if (visualState === 'append') {
      return 'Drop files to add';
    }

    return isMultiple ? 'Drop files to add' : 'Drop the file to add';
  }

  if (visualState === 'replace') {
    return 'Drop a new file to replace';
  }

  if (visualState === 'append') {
    return 'Add more files';
  }

  return isMultiple ? 'Drag and drop files here' : 'Drag and drop a file here';
}

function getDefaultDescription(
  visualState: FileUploadVisualState,
  accept: string | undefined,
  maxSize: number | undefined,
  maxFiles: number | undefined,
  isMultiple: boolean
): string {
  if (visualState === 'replace') {
    return 'The current file remains until a valid replacement is selected';
  }

  return getConstraintDescription(accept, maxSize, maxFiles, isMultiple);
}

function getDefaultActionLabel(visualState: FileUploadVisualState): string {
  if (visualState === 'replace') {
    return 'Replace file';
  }

  if (visualState === 'append') {
    return 'Add files';
  }

  return 'Browse files';
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
  const visualState = getVisualState(
    context.files.length,
    context.isMultiple
  );
  const defaultHeading = getDefaultHeading(
    context.isDragOver,
    visualState,
    context.isMultiple
  );
  const defaultDescription = getDefaultDescription(
    visualState,
    context.accept,
    context.maxSize,
    context.maxFiles,
    context.isMultiple
  );
  const defaultActionLabel = getDefaultActionLabel(visualState);
  const handleDragEnter = composeDragHandler(onDragEnter, context.onDragEnter);
  const handleDragLeave = composeDragHandler(onDragLeave, context.onDragLeave);
  const handleDragOver = composeDragHandler(onDragOver, context.onDragOver);
  const handleDragEnd = composeDragHandler(onDragEnd, context.onDragEnd);
  const handleDrop = composeDragHandler(onDrop, context.onDrop);
  let accessibleLabelledBy = ariaLabelledBy;

  if (!accessibleLabelledBy && !ariaLabel) {
    accessibleLabelledBy = context.labelId;
  }

  const defaultContent = (
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
          className={styles.dropzoneAction}
        >
          {defaultActionLabel}
        </Button>
      </FileUploadTrigger>
    </>
  );
  const resolvedChildren = children ?? defaultContent;

  return (
    <section
      {...dropzoneProps}
      ref={forwardedRef}
      className={clsx(styles.dropzone, className)}
      style={style}
      aria-label={ariaLabel}
      aria-labelledby={accessibleLabelledBy}
      data-state={visualState}
      data-default-content={resolvedChildren === defaultContent ? true : undefined}
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
      {resolvedChildren}
    </section>
  );
});

FileUploadDropzone.displayName = 'FileUpload.Dropzone';
