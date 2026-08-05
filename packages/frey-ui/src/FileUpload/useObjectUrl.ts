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

    let nextUrl: string;

    try {
      nextUrl = URL.createObjectURL(file);
    } catch {
      setUrl(undefined);
      return;
    }

    setUrl(nextUrl);

    return () => {
      try {
        URL.revokeObjectURL(nextUrl);
      } catch {
        // Object URL cleanup is best effort in constrained browser environments.
      }
    };
  }, [enabled, file]);

  return url;
}
