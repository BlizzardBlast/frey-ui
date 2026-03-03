import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const scriptPath = path.resolve(
  process.cwd(),
  '../../scripts/generate-theme-tokens.mjs'
);

function runGenerator(args: string[], cwd?: string) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: 'utf8',
    cwd
  });
}

describe('generate-theme-tokens CLI', () => {
  it('exits with a clear error when --primary is missing', () => {
    const result = runGenerator([]);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('--primary');
  });

  it('emits deterministic CSS for a valid primary color', () => {
    const result = runGenerator(['--primary', '#3366ff']);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain(
      ".frey-theme-provider[data-frey-theme='light']"
    );
    expect(result.stdout).toContain(
      ".frey-theme-provider[data-frey-theme='dark']"
    );
    expect(result.stdout).toContain('--frey-color-primary: #3366ff;');
    expect(result.stdout).toContain('--frey-button-primary-bg: #3366ff;');
  });

  it('maps optional semantic overrides into generated variables', () => {
    const result = runGenerator([
      '--primary',
      '#3366ff',
      '--success',
      '#0f9d58',
      '--warning',
      '#f59e0b',
      '--error',
      '#dc2626',
      '--info',
      '#0284c7'
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--frey-color-success: #0f9d58;');
    expect(result.stdout).toContain('--frey-color-warning: #f59e0b;');
    expect(result.stdout).toContain('--frey-color-error: #dc2626;');
    expect(result.stdout).toContain('--frey-color-info: #0284c7;');
  });

  it('prints to stdout without writing files', () => {
    const tempDirectory = mkdtempSync(path.join(tmpdir(), 'frey-theme-cli-'));
    const beforeEntries = readdirSync(tempDirectory);

    const result = runGenerator(['--primary', '#123456'], tempDirectory);
    const afterEntries = readdirSync(tempDirectory);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.length).toBeGreaterThan(0);
    expect(afterEntries).toEqual(beforeEntries);
  });
});
