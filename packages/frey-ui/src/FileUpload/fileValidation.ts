export type FileUploadRejected = {
  file: File;
  reason: string;
};

export type FileValidationRule = {
  accept?: string;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  validate?: (file: File) => string | null;
};

type AcceptSpec = {
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
      mimeTypes.push(part);
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

  if (type !== fileTypePart) {
    return false;
  }

  if (subtype === '*') {
    return true;
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
  const extensionMatch = fileName.match(/\.[^.]+$/);
  const fileExtension = extensionMatch?.[0] ?? '';

  for (const mime of mimeTypes) {
    if (matchMime(fileType, mime)) {
      return true;
    }
  }

  if (extensions.includes(fileExtension)) {
    return true;
  }

  return false;
}

export function validateFile(
  file: File,
  rule: FileValidationRule,
  currentFiles: ReadonlyArray<File>
): string | null {
  if (rule.validate) {
    const custom = rule.validate(file);
    if (custom) {
      return custom;
    }
  }

  if (rule.multiple === false && currentFiles.length > 0) {
    return 'Only one file is allowed';
  }

  if (
    typeof rule.maxFiles === 'number' &&
    rule.maxFiles > 0 &&
    currentFiles.length >= rule.maxFiles
  ) {
    return 'Maximum number of files reached';
  }

  if (typeof rule.minSize === 'number' && file.size < rule.minSize) {
    return 'File is too small';
  }

  if (typeof rule.maxSize === 'number' && file.size > rule.maxSize) {
    return 'File is too large';
  }

  if (rule.accept && !matchesAccept(file, rule.accept)) {
    return 'File type is not allowed';
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
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
