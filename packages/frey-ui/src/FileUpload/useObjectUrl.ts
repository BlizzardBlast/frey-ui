import { useEffect, useState } from 'react';

type ObjectUrlState = {
  file: File;
  url: string;
};

export function isPreviewableImage(file: File | undefined): boolean {
  return Boolean(
    file?.type.startsWith('image/') && file.type !== 'image/svg+xml'
  );
}

export function useObjectUrl(
  file: File | undefined,
  enabled = true
): string | undefined {
  const [objectUrl, setObjectUrl] = useState<ObjectUrlState>();

  useEffect(() => {
    if (
      !enabled ||
      !file ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function' ||
      typeof URL.revokeObjectURL !== 'function'
    ) {
      setObjectUrl(undefined);
      return;
    }

    let nextUrl: string;

    try {
      nextUrl = URL.createObjectURL(file);
    } catch {
      setObjectUrl(undefined);
      return;
    }

    setObjectUrl({ file, url: nextUrl });

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [enabled, file]);

  if (!enabled || objectUrl?.file !== file) {
    return undefined;
  }

  return objectUrl.url;
}
