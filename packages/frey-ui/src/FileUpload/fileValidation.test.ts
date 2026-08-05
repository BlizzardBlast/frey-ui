import { describe, expect, it } from 'vitest';
import {
  type FileValidationRule,
  formatFileSize,
  matchesAccept,
  parseAccept,
  validateFile,
} from './fileValidation';

describe('parseAccept', () => {
  it('returns empty whitelists for undefined', () => {
    const result = parseAccept(undefined);
    expect(result.mimeTypes).toEqual([]);
    expect(result.extensions).toEqual([]);
  });

  it('returns empty whitelists for an empty string', () => {
    const result = parseAccept('  ');
    expect(result.mimeTypes).toEqual([]);
    expect(result.extensions).toEqual([]);
  });

  it('splits MIME types and extensions by comma', () => {
    const result = parseAccept('image/*,.pdf,application/json');
    expect(result.mimeTypes).toEqual(['image/*', 'application/json']);
    expect(result.extensions).toEqual(['.pdf']);
  });

  it('trims whitespace and lowercases extensions', () => {
    const result = parseAccept('  .PNG  , IMAGE/JPEG ');
    expect(result.mimeTypes).toEqual(['IMAGE/JPEG']);
    expect(result.extensions).toEqual(['.png']);
  });
});

describe('matchesAccept', () => {
  it('allows any file when accept is empty', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(matchesAccept(file, '')).toBe(true);
  });

  it('matches by exact MIME type', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(matchesAccept(file, 'image/png')).toBe(true);
    expect(matchesAccept(file, 'image/jpeg')).toBe(false);
  });

  it('matches by wildcard MIME type', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(matchesAccept(file, 'image/*')).toBe(true);
    expect(matchesAccept(file, 'audio/*')).toBe(false);
  });

  it('falls back to extension when MIME type is missing or wrong', () => {
    const file = new File([''], 'data.csv', { type: '' });
    expect(matchesAccept(file, '.csv')).toBe(true);
    expect(matchesAccept(file, '.pdf')).toBe(false);
  });

  it('matches any of several comma-separated values', () => {
    const file = new File([''], 'report.pdf', { type: 'application/pdf' });
    expect(matchesAccept(file, 'image/*,.pdf,.docx')).toBe(true);
  });
});

describe('validateFile', () => {
  it('returns null for a valid file', () => {
    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    const rule: FileValidationRule = {};
    expect(validateFile(file, rule, [])).toBe(null);
  });

  it('rejects files larger than maxSize', () => {
    const file = new File(['x'.repeat(1024 * 1024 + 1)], 'large.bin', {
      type: 'application/octet-stream',
    });
    const rule: FileValidationRule = { maxSize: 1024 * 1024 };
    expect(validateFile(file, rule, [])).toBe('File is too large');
  });

  it('rejects files smaller than minSize', () => {
    const file = new File(['x'], 'tiny.txt', { type: 'text/plain' });
    const rule: FileValidationRule = { minSize: 10 };
    expect(validateFile(file, rule, [])).toBe('File is too small');
  });

  it('rejects files with disallowed type or extension', () => {
    const file = new File([''], 'script.exe', { type: '' });
    const rule: FileValidationRule = { accept: 'image/*,.pdf' };
    expect(validateFile(file, rule, [])).toBe('File type is not allowed');
  });

  it('rejects files that exceed maxFiles count', () => {
    const existing = [new File(['a'], 'a.txt', { type: 'text/plain' })];
    const next = new File(['b'], 'b.txt', { type: 'text/plain' });
    const rule: FileValidationRule = { multiple: true, maxFiles: 1 };
    expect(validateFile(next, rule, existing)).toBe(
      'Maximum number of files reached'
    );
  });

  it('rejects additional files in single-file mode', () => {
    const existing = [new File(['a'], 'a.txt', { type: 'text/plain' })];
    const next = new File(['b'], 'b.txt', { type: 'text/plain' });
    const rule: FileValidationRule = { multiple: false };
    expect(validateFile(next, rule, existing)).toBe('Only one file is allowed');
  });

  it('uses custom validator result when built-in rules pass', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    const rule: FileValidationRule = {
      accept: 'image/*',
      validate: () => 'Custom error',
    };
    expect(validateFile(file, rule, [])).toBe('Custom error');
  });

  it('does not allow custom validator to override built-in rule failure', () => {
    const file = new File(['x'.repeat(1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    const rule: FileValidationRule = {
      maxSize: 1024 * 1024,
      validate: () => null,
    };
    expect(validateFile(file, rule, [])).toBe('File is too large');
  });
});

describe('matchesAccept edge cases', () => {
  it('matches any MIME type with the */* wildcard', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(matchesAccept(file, '*/*')).toBe(true);
  });

  it('allows a file when the accept string contains only separators', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(matchesAccept(file, '  ,  ')).toBe(true);
  });

  it('does not match a file without an extension against an extension rule', () => {
    const file = new File([''], 'README', { type: 'text/plain' });
    expect(matchesAccept(file, '.txt')).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('converts bytes into larger units', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });
});
