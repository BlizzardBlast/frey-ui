import { useEffect, useState } from 'react';

export function isPreviewableImage(file: File | undefined): boolean {
  return Boolean(
    file?.type.startsWith('image/') && file.type !== 'image/svg+xml'
  );
}

export function useObjectUrl(
  file: File | undefined,
  enabled = true
): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (
      !enabled ||
      !file ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function' ||
      typeof URL.revokeObjectURL !== 'function'
    ) {
      setUrl(undefined);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [enabled, file]);

  return url;
}
