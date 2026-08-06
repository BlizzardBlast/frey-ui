import clsx from 'clsx';
import React from 'react';
import { CloseIcon } from '../Icons';
import { useFileUploadContext } from './FileUploadContext';
import { FileUploadPreview } from './FileUploadPreview';
import styles from './fileUpload.module.css';
import { formatFileSize, formatFileType } from './fileValidation';

export type FileUploadItemProps = Omit<
  React.HTMLAttributes<HTMLLIElement>,
  'children'
> & {
  file?: File;
  fileIndex?: number;
  preview?: boolean;
  children?:
    | React.ReactNode
    | ((file: File, onRemove: () => void) => React.ReactNode);
};

type FileUploadItemComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadItemProps> & React.RefAttributes<HTMLLIElement>
>;

function getFileIndex(
  file: File | undefined,
  fileIndex: number | undefined,
  files: ReadonlyArray<File>
): number {
  if (fileIndex !== undefined) {
    return fileIndex;
  }

  if (!file) {
    return -1;
  }

  return files.indexOf(file);
}

export const FileUploadItem: FileUploadItemComponent = React.forwardRef<
  HTMLLIElement,
  Readonly<FileUploadItemProps>
>(function FileUploadItem(
  { file, fileIndex, preview = true, children, className, style, ...itemProps },
  forwardedRef
) {
  const context = useFileUploadContext();
  const currentFile = file ?? context.files[0];
  const currentIndex = getFileIndex(currentFile, fileIndex, context.files);

  if (!currentFile || currentIndex < 0) {
    return null;
  }

  const onRemove = () => {
    context.removeFileAt(currentIndex);
    context.triggerRef.current?.focus();
  };

  let content: React.ReactNode;

  if (typeof children === 'function') {
    content = children(currentFile, onRemove);
  } else if (children !== undefined) {
    content = children;
  } else {
    content = (
      <div className={styles.itemContent}>
        {preview && <FileUploadPreview file={currentFile} />}

        <span className={styles.fileDetails}>
          <span className={styles.fileName} title={currentFile.name}>
            {currentFile.name}
          </span>
          <span className={styles.fileMeta}>
            {formatFileType(currentFile)} · {formatFileSize(currentFile.size)}
          </span>
        </span>

        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          disabled={context.disabled}
          aria-label={`Remove ${currentFile.name}`}
          className={styles.removeButton}
        >
          <CloseIcon size='sm' />
        </button>
      </div>
    );
  }

  return (
    <li
      ref={forwardedRef}
      className={clsx(styles.item, className)}
      style={style}
      {...itemProps}
    >
      {content}
    </li>
  );
});

FileUploadItem.displayName = 'FileUpload.Item';
