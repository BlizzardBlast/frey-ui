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
    cwd,
  });
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => {
    const normalized = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
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
      '#0284c7',
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--frey-color-success: #0f9d58;');
    expect(result.stdout).toContain('--frey-color-warning: #f59e0b;');
    expect(result.stdout).toContain('--frey-color-error: #dc2626;');
    expect(result.stdout).toContain('--frey-color-info: #0284c7;');
  });

  it.each([
    '#000000',
    '#3366ff',
    '#ffffff',
  ])('emits contrast-safe segmented control tokens for %s', (primary) => {
    const result = runGenerator(['--primary', primary]);
    const tokenPairs = [
      ...result.stdout.matchAll(
        /--frey-segmented-control-selected-bg: (#[0-9a-f]{6});\n {2}--frey-segmented-control-selected-text: (#[0-9a-f]{6});/g
      ),
    ];
    const focusTokens = result.stdout.match(
      /--frey-segmented-control-focus-ring:/g
    );

    expect(result.status).toBe(0);
    expect(tokenPairs).toHaveLength(4);
    expect(focusTokens).toHaveLength(4);

    for (const [, background, foreground] of tokenPairs) {
      expect(
        contrastRatio(foreground ?? '', background ?? '')
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each([
    '#000000',
    '#3366ff',
    '#ffffff',
  ])('emits contrast-safe Calendar selection tokens for %s', (primary) => {
    const result = runGenerator(['--primary', primary]);
    const surfaces = ['#ffffff', '#1f2937', '#ffffff', '#000000'];
    const tokenPairs = [
      ...result.stdout.matchAll(
        /--frey-calendar-selected-bg: (#[0-9a-f]{6});\n {2}--frey-calendar-selected-text: (#[0-9a-f]{6});/g
      ),
    ];

    expect(result.status).toBe(0);
    expect(tokenPairs).toHaveLength(4);
    for (const [index, [, background, foreground]] of tokenPairs.entries()) {
      expect(
        contrastRatio(foreground ?? '', background ?? '')
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(background ?? '', surfaces[index] ?? '')
      ).toBeGreaterThanOrEqual(3);
    }
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
