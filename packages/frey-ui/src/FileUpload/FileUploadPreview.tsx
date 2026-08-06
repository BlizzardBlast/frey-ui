import clsx from 'clsx';
import React, { useState } from 'react';
import { FileIcon } from '../Icons';
import { useFileUploadContext } from './FileUploadContext';
import styles from './fileUpload.module.css';
import { isPreviewableImage, useObjectUrl } from './useObjectUrl';

export type FileUploadPreviewProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  file?: File;
  alt?: string;
  fallback?: React.ReactNode;
  imageProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
};

type FileUploadPreviewComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadPreviewProps> & React.RefAttributes<HTMLSpanElement>
>;

export const FileUploadPreview: FileUploadPreviewComponent = React.forwardRef<
  HTMLSpanElement,
  Readonly<FileUploadPreviewProps>
>(function FileUploadPreview(
  { file, alt = '', fallback, imageProps, className, style, ...previewProps },
  forwardedRef
) {
  const context = useFileUploadContext();
  const currentFile = file ?? context.files[0];
  const canPreview = isPreviewableImage(currentFile);
  const objectUrl = useObjectUrl(currentFile, canPreview);
  const [failedObjectUrl, setFailedObjectUrl] = useState<string>();
  const hasImageError = Boolean(objectUrl && failedObjectUrl === objectUrl);
  const displaysImage = Boolean(objectUrl && !hasImageError);

  if (!currentFile) {
    return null;
  }

  const fallbackContent = fallback ?? <FileIcon size='lg' />;

  return (
    <span
      ref={forwardedRef}
      className={clsx(styles.preview, className)}
      style={style}
      data-preview={displaysImage ? 'image' : 'file'}
      {...previewProps}
    >
      {displaysImage ? (
        <img
          {...imageProps}
          src={objectUrl}
          alt={alt}
          className={clsx(styles.previewImage, imageProps?.className)}
          loading={imageProps?.loading ?? 'lazy'}
          decoding={imageProps?.decoding ?? 'async'}
          onError={(event) => {
            imageProps?.onError?.(event);
            setFailedObjectUrl(objectUrl);
          }}
        />
      ) : (
        <span className={styles.previewFallback} aria-hidden='true'>
          {fallbackContent}
        </span>
      )}
    </span>
  );
});

FileUploadPreview.displayName = 'FileUpload.Preview';
