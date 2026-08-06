export type FileUploadRejectionCode =
  | 'file-invalid-type'
  | 'file-too-small'
  | 'file-too-large'
  | 'too-many-files'
  | 'custom';

export type FileUploadRejected = {
  file: File;
  code: FileUploadRejectionCode;
  reason: string;
};

export type FileValidationError = Omit<FileUploadRejected, 'file'>;

export type FileValidationRule = {
  accept?: string;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  validate?: (file: File) => string | null;
};

export type AcceptSpec = {
  mimeTypes: ReadonlyArray<string>;
  extensions: ReadonlyArray<string>;
};

export function parseAccept(accept: string | undefined): AcceptSpec {
  if (!accept) {
    return { mimeTypes: [], extensions: [] };
  }

  const parts = accept
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const mimeTypes: string[] = [];
  const extensions: string[] = [];

  for (const part of parts) {
    if (part.startsWith('.')) {
      extensions.push(part.toLowerCase());
    } else {
      mimeTypes.push(part.toLowerCase());
    }
  }

  return { mimeTypes, extensions };
}

function matchMime(fileType: string, pattern: string): boolean {
  const normalizedFileType = fileType.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();

  if (normalizedPattern === '*/*') {
    return normalizedFileType.includes('/');
  }

  const [type, subtype] = normalizedPattern.split('/');
  const [fileTypePart, fileSubtype] = normalizedFileType.split('/');

  if (!type || !subtype || type !== fileTypePart) {
    return false;
  }

  if (subtype === '*') {
    return Boolean(fileSubtype);
  }

  return subtype === fileSubtype;
}

export function matchesAccept(file: File, accept: string): boolean {
  const trimmedAccept = accept.trim();

  if (!trimmedAccept) {
    return true;
  }

  const { mimeTypes, extensions } = parseAccept(trimmedAccept);

  if (mimeTypes.length === 0 && extensions.length === 0) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.trim().toLowerCase();

  if (mimeTypes.some((mime) => matchMime(fileType, mime))) {
    return true;
  }

  return extensions.some((extension) => fileName.endsWith(extension));
}

export function getFileValidationError(
  file: File,
  rule: FileValidationRule,
  currentFiles: ReadonlyArray<File>
): FileValidationError | null {
  if (rule.multiple === false && currentFiles.length > 0) {
    return {
      code: 'too-many-files',
      reason: 'Only one file is allowed',
    };
  }

  if (
    typeof rule.maxFiles === 'number' &&
    rule.maxFiles > 0 &&
    currentFiles.length >= rule.maxFiles
  ) {
    return {
      code: 'too-many-files',
      reason: 'Maximum number of files reached',
    };
  }

  if (typeof rule.minSize === 'number' && file.size < rule.minSize) {
    return {
      code: 'file-too-small',
      reason: 'File is too small',
    };
  }

  if (typeof rule.maxSize === 'number' && file.size > rule.maxSize) {
    return {
      code: 'file-too-large',
      reason: 'File is too large',
    };
  }

  if (rule.accept && !matchesAccept(file, rule.accept)) {
    return {
      code: 'file-invalid-type',
      reason: 'File type is not allowed',
    };
  }

  const customReason = rule.validate?.(file);

  if (customReason) {
    return {
      code: 'custom',
      reason: customReason,
    };
  }

  return null;
}

export function validateFile(
  file: File,
  rule: FileValidationRule,
  currentFiles: ReadonlyArray<File>
): string | null {
  return getFileValidationError(file, rule, currentFiles)?.reason ?? null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex === 0 ? 0 : 1;
  return `${Number(size.toFixed(decimals))} ${units[unitIndex]}`;
}

export function formatFileType(file: File): string {
  const fileName = file.name.trim();
  const extensionIndex = fileName.lastIndexOf('.');

  if (extensionIndex > -1 && extensionIndex < fileName.length - 1) {
    return fileName.slice(extensionIndex + 1).toUpperCase();
  }

  const subtype = file.type.split('/')[1]?.split('+')[0];

  return subtype ? subtype.toUpperCase() : 'FILE';
}

function formatList(values: ReadonlyArray<string>): string {
  if (values.length === 0) {
    return '';
  }

  if (values.length === 1) {
    return values.join('');
  }

  if (values.length === 2) {
    return `${values[0]} or ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, or ${values.at(-1)}`;
}

export function formatAcceptedTypes(accept: string | undefined): string {
  if (!accept) {
    return '';
  }

  const labels = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('.')) {
        return part.slice(1).toUpperCase();
      }

      if (part.endsWith('/*')) {
        return `${part.slice(0, -2)} files`;
      }

      return part.split('/')[1]?.split('+')[0]?.toUpperCase() ?? part;
    });

  return formatList([...new Set(labels)]);
}
