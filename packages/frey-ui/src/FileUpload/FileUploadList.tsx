import clsx from 'clsx';
import React, { Children, cloneElement } from 'react';
import styles from './fileUpload.module.css';
import { useFileUploadContext } from './FileUploadContext';
import { FileUploadItem, type FileUploadItemProps } from './FileUploadItem';

export type FileUploadListProps = React.HTMLAttributes<HTMLUListElement> & {
  children?: React.ReactNode;
};

type FileUploadListComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadListProps> & React.RefAttributes<HTMLUListElement>
>;

function getFileKeyBase(file: File): string {
  return [file.name, file.size, file.type, file.lastModified].join('-');
}

export const FileUploadList: FileUploadListComponent = React.forwardRef<
  HTMLUListElement,
  Readonly<FileUploadListProps>
>(function FileUploadList(
  { children, className, style, ...listProps },
  forwardedRef
) {
  const context = useFileUploadContext();

  if (context.files.length === 0) {
    return null;
  }

  const itemTemplate = Children.toArray(children).find(
    (child): child is React.ReactElement<FileUploadItemProps> =>
      React.isValidElement(child) && child.type === FileUploadItem
  );
  const keyOccurrences = new Map<string, number>();
  let accessibleLabel = listProps['aria-label'];

  if (!accessibleLabel && !listProps['aria-labelledby']) {
    accessibleLabel = 'Selected files';
  }

  return (
    <ul
      {...listProps}
      ref={forwardedRef}
      className={clsx(styles.list, className)}
      style={style}
      aria-label={accessibleLabel}
    >
      {context.files.map((file, index) => {
        const keyBase = getFileKeyBase(file);
        const occurrence = keyOccurrences.get(keyBase) ?? 0;
        keyOccurrences.set(keyBase, occurrence + 1);
        const key = `${keyBase}-${occurrence}`;

        return itemTemplate ? (
          cloneElement(itemTemplate, { file, fileIndex: index, key })
        ) : (
          <FileUploadItem key={key} file={file} fileIndex={index} />
        );
      })}
    </ul>
  );
});

FileUploadList.displayName = 'FileUpload.List';
