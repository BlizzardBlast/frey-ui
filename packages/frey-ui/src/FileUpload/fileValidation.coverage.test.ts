import { describe, expect, it } from 'vitest';
import {
  formatAcceptedTypes,
  formatFileSize,
  formatFileType,
  getFileValidationError,
  matchesAccept,
  parseAccept,
  validateFile,
} from './fileValidation';

describe('file validation remaining branches', () => {
  it('handles empty and separator-only accept values', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    expect(matchesAccept(file, '   ')).toBe(true);
    expect(matchesAccept(file, ' , , ')).toBe(true);
    expect(parseAccept('.PNG, TEXT/PLAIN')).toEqual({
      mimeTypes: ['text/plain'],
      extensions: ['.png'],
    });
  });

  it('handles malformed, wildcard, missing, and mismatched MIME values', () => {
    const typed = new File(['x'], 'file.bin', {
      type: 'application/octet-stream',
    });
    const untyped = new File(['x'], 'file.bin', { type: '' });
    const incomplete = new File(['x'], 'file.bin', { type: 'image' });

    expect(matchesAccept(typed, '*/*')).toBe(true);
    expect(matchesAccept(untyped, '*/*')).toBe(false);
    expect(matchesAccept(typed, 'application')).toBe(false);
    expect(matchesAccept(typed, '/octet-stream')).toBe(false);
    expect(matchesAccept(typed, 'image/*')).toBe(false);
    expect(matchesAccept(incomplete, 'image/*')).toBe(false);
    expect(matchesAccept(typed, 'application/json')).toBe(false);
  });

  it('checks every file-count validation path', () => {
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    const existing = [file];

    expect(
      getFileValidationError(file, { multiple: false }, existing)
    ).toEqual({
      code: 'too-many-files',
      reason: 'Only one file is allowed',
    });
    expect(
      getFileValidationError(file, { multiple: true }, existing)
    ).toBeNull();
    expect(
      getFileValidationError(file, { maxFiles: 0 }, existing)
    ).toBeNull();
    expect(
      getFileValidationError(file, { maxFiles: 2 }, existing)
    ).toBeNull();
    expect(
      getFileValidationError(file, { maxFiles: 1 }, existing)
    ).toEqual({
      code: 'too-many-files',
      reason: 'Maximum number of files reached',
    });
  });

  it('checks passing and failing size, type, and custom rules', () => {
    const file = new File(['xx'], 'file.txt', { type: 'text/plain' });

    expect(getFileValidationError(file, { minSize: 1 }, [])).toBeNull();
    expect(getFileValidationError(file, { minSize: 3 }, [])).toEqual({
      code: 'file-too-small',
      reason: 'File is too small',
    });
    expect(getFileValidationError(file, { maxSize: 3 }, [])).toBeNull();
    expect(getFileValidationError(file, { maxSize: 1 }, [])).toEqual({
      code: 'file-too-large',
      reason: 'File is too large',
    });
    expect(getFileValidationError(file, { accept: 'text/*' }, [])).toBeNull();
    expect(getFileValidationError(file, { accept: 'image/*' }, [])).toEqual({
      code: 'file-invalid-type',
      reason: 'File type is not allowed',
    });
    expect(
      getFileValidationError(file, { validate: () => null }, [])
    ).toBeNull();
    expect(
      getFileValidationError(file, { validate: () => 'Custom rejection' }, [])
    ).toEqual({
      code: 'custom',
      reason: 'Custom rejection',
    });
    expect(validateFile(file, {}, [])).toBeNull();
  });

  it('formats every size boundary', () => {
    expect(formatFileSize(Number.POSITIVE_INFINITY)).toBe('0 B');
    expect(formatFileSize(-1)).toBe('0 B');
    expect(formatFileSize(1)).toBe('1 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 ** 5)).toBe('1024 TB');
  });

  it('formats extensions, MIME fallbacks, and generic files', () => {
    expect(
      formatFileType(new File(['x'], 'photo.png', { type: 'image/png' }))
    ).toBe('PNG');
    expect(
      formatFileType(
        new File(['x'], 'payload.', { type: 'application/ld+json' })
      )
    ).toBe('LD');
    expect(formatFileType(new File(['x'], 'README', { type: '' }))).toBe(
      'FILE'
    );
  });

  it('formats every accepted-type list shape', () => {
    expect(formatAcceptedTypes(undefined)).toBe('');
    expect(formatAcceptedTypes(' , ')).toBe('');
    expect(formatAcceptedTypes('.png')).toBe('PNG');
    expect(formatAcceptedTypes('.png,.jpg')).toBe('PNG or JPG');
    expect(formatAcceptedTypes('.png,.jpg,.pdf')).toBe(
      'PNG, JPG, or PDF'
    );
    expect(formatAcceptedTypes('image/*')).toBe('image files');
    expect(formatAcceptedTypes('application/ld+json')).toBe('LD');
    expect(formatAcceptedTypes('custom')).toBe('custom');
    expect(formatAcceptedTypes('.png,.png')).toBe('PNG');
  });
});
