import { describe, expect, it } from 'vitest';
import {
  type FileValidationRule,
  formatAcceptedTypes,
  formatFileSize,
  formatFileType,
  getFileValidationError,
  matchesAccept,
  parseAccept,
  validateFile,
} from './fileValidation';

describe('parseAccept', () => {
  it('splits and normalizes MIME types and extensions', () => {
    expect(parseAccept(' IMAGE/*, .PNG, application/pdf ')).toEqual({
      mimeTypes: ['image/*', 'application/pdf'],
      extensions: ['.png'],
    });
  });

  it('returns empty rules when accept is missing', () => {
    expect(parseAccept(undefined)).toEqual({
      mimeTypes: [],
      extensions: [],
    });
  });
});

describe('matchesAccept', () => {
  it('matches exact and wildcard MIME types', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });

    expect(matchesAccept(file, 'image/png')).toBe(true);
    expect(matchesAccept(file, 'image/*')).toBe(true);
    expect(matchesAccept(file, 'audio/*')).toBe(false);
  });

  it('matches compound extensions', () => {
    const file = new File([''], 'archive.tar.gz', { type: '' });

    expect(matchesAccept(file, '.tar.gz')).toBe(true);
    expect(matchesAccept(file, '.gz')).toBe(true);
    expect(matchesAccept(file, '.zip')).toBe(false);
  });

  it('allows any typed file for the all-MIME wildcard', () => {
    const file = new File([''], 'data.bin', {
      type: 'application/octet-stream',
    });

    expect(matchesAccept(file, '*/*')).toBe(true);
  });
});

describe('getFileValidationError', () => {
  it.each(
    [
      [
        { maxSize: 1 },
        new File(['xx'], 'large.txt', { type: 'text/plain' }),
        'file-too-large',
      ],
      [
        { minSize: 2 },
        new File(['x'], 'small.txt', { type: 'text/plain' }),
        'file-too-small',
      ],
      [
        { accept: 'image/*' },
        new File(['x'], 'file.txt', { type: 'text/plain' }),
        'file-invalid-type',
      ],
    ] satisfies Array<[FileValidationRule, File, string]>
  )('returns a structured error for built-in rules', (rule, file, code) => {
    expect(getFileValidationError(file, rule, [])?.code).toBe(code);
  });

  it('runs custom validation after built-in validation', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const validate = () => 'Custom error';

    expect(
      getFileValidationError(file, { accept: 'image/*', validate }, [])
    ).toEqual({
      code: 'file-invalid-type',
      reason: 'File type is not allowed',
    });
    expect(
      getFileValidationError(file, { accept: 'text/*', validate }, [])
    ).toEqual({
      code: 'custom',
      reason: 'Custom error',
    });
  });

  it('keeps validateFile backward compatible', () => {
    const file = new File(['xx'], 'large.txt', { type: 'text/plain' });

    expect(validateFile(file, { maxSize: 1 }, [])).toBe('File is too large');
  });
});

describe('formatters', () => {
  it('formats file sizes and types', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(
      formatFileType(new File([''], 'archive.tar.gz', { type: '' }))
    ).toBe('GZ');
  });

  it('formats accepted types for UI copy', () => {
    expect(formatAcceptedTypes('.png,.jpg,application/pdf')).toBe(
      'PNG, JPG, or PDF'
    );
  });
});
