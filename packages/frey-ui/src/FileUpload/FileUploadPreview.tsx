import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { FileIcon } from '../Icons';
import styles from './fileUpload.module.css';
import { useFileUploadContext } from './FileUploadContext';
import { isPreviewableImage, useObjectUrl } from './useObjectUrl';

export type FileUploadPreviewProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  file?: File;
  alt?: string;
  fallback?: React.ReactNode;
  imageProps?: Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'alt'
  >;
};

type FileUploadPreviewComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadPreviewProps> & React.RefAttributes<HTMLSpanElement>
>;

export const FileUploadPreview: FileUploadPreviewComponent = React.forwardRef<
  HTMLSpanElement,
  Readonly<FileUploadPreviewProps>
>(function FileUploadPreview(
  {
    file,
    alt = '',
    fallback,
    imageProps,
    className,
    style,
    ...previewProps
  },
  forwardedRef
) {
  const context = useFileUploadContext();
  const currentFile = file ?? context.files[0];
  const canPreview = isPreviewableImage(currentFile);
  const objectUrl = useObjectUrl(currentFile, canPreview);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [objectUrl]);

  if (!currentFile) {
    return null;
  }

  const fallbackContent = fallback ?? <FileIcon size='lg' />;

  return (
    <span
      ref={forwardedRef}
      className={clsx(styles.preview, className)}
      style={style}
      data-preview={canPreview && !hasImageError ? 'image' : 'file'}
      {...previewProps}
    >
      {objectUrl && !hasImageError ? (
        <img
          {...imageProps}
          src={objectUrl}
          alt={alt}
          className={clsx(styles.previewImage, imageProps?.className)}
          loading={imageProps?.loading ?? 'lazy'}
          decoding={imageProps?.decoding ?? 'async'}
          onError={(event) => {
            imageProps?.onError?.(event);
            setHasImageError(true);
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
