export const FILE_UPLOAD_REJECTION_CODES = {
  type: 'file-invalid-type',
  tooLarge: 'file-too-large',
  tooSmall: 'file-too-small',
  tooMany: 'too-many-files',
  custom: 'custom-validation',
} as const;

export type FileUploadRejectionCode =
  (typeof FILE_UPLOAD_REJECTION_CODES)[keyof typeof FILE_UPLOAD_REJECTION_CODES];

export type FileValidationError = {
  code: FileUploadRejectionCode;
  reason: string;
};

export type FileUploadRejected = FileValidationError & {
  file: File;
};

export type FileValidationRule = {
  accept?: string;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  validate?: (file: File) => string | null;
};

function getFileExtension(fileName: string): string {
  const normalizedName = fileName.toLowerCase();
  const extensionIndex = normalizedName.indexOf('.');

  return extensionIndex >= 0 ? normalizedName.slice(extensionIndex) : '';
}

function matchesAcceptedType(file: File, acceptedType: string): boolean {
  if (acceptedType.startsWith('.')) {
    return getFileExtension(file.name).endsWith(acceptedType);
  }

  if (acceptedType.endsWith('/*')) {
    return file.type.startsWith(acceptedType.slice(0, -1));
  }

  return file.type === acceptedType;
}

function matchesAccept(file: File, accept: string): boolean {
  const acceptedTypes = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  return (
    acceptedTypes.length === 0 ||
    acceptedTypes.some((acceptedType) =>
      matchesAcceptedType(file, acceptedType)
    )
  );
}

function createValidationError(
  code: FileUploadRejectionCode,
  reason: string
): FileValidationError {
  return { code, reason };
}

export function getFileValidationError(
  file: File,
  rule: FileValidationRule,
  currentFiles: ReadonlyArray<File> = []
): FileValidationError | null {
  if (rule.accept && !matchesAccept(file, rule.accept)) {
    return createValidationError(
      FILE_UPLOAD_REJECTION_CODES.type,
      `File type not accepted: ${file.name}`
    );
  }

  if (typeof rule.maxSize === 'number' && file.size > rule.maxSize) {
    return createValidationError(
      FILE_UPLOAD_REJECTION_CODES.tooLarge,
      `File is too large: ${file.name}`
    );
  }

  if (typeof rule.minSize === 'number' && file.size < rule.minSize) {
    return createValidationError(
      FILE_UPLOAD_REJECTION_CODES.tooSmall,
      `File is too small: ${file.name}`
    );
  }

  const effectiveMaxFiles = rule.multiple === true ? rule.maxFiles : 1;

  if (
    typeof effectiveMaxFiles === 'number' &&
    currentFiles.length >= effectiveMaxFiles
  ) {
    return createValidationError(
      FILE_UPLOAD_REJECTION_CODES.tooMany,
      `Too many files. Maximum is ${effectiveMaxFiles}`
    );
  }

  const customReason = rule.validate?.(file);

  if (customReason) {
    return createValidationError(
      FILE_UPLOAD_REJECTION_CODES.custom,
      customReason
    );
  }

  return null;
}

export function validateFile(
  file: File,
  rule: FileValidationRule,
  currentFiles: ReadonlyArray<File> = []
): string | null {
  return getFileValidationError(file, rule, currentFiles)?.reason ?? null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
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

      const subtype = part.split('/')[1]?.split('+')[0];

      return subtype ? subtype.toUpperCase() : part;
    });

  return formatList([...new Set(labels)]);
}
