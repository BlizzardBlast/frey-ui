import { describe, expect, it } from 'vitest';
import { resolveCalendarKeyboardCommand } from './calendarInteractions';

describe('Calendar interactions', () => {
  it.each([
    [
      'ArrowLeft',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'day', amount: -1 } },
    ],
    [
      'ArrowRight',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'day', amount: 1 } },
    ],
    [
      'ArrowLeft',
      false,
      'rtl',
      { type: 'move', movement: { unit: 'day', amount: 1 } },
    ],
    [
      'ArrowRight',
      false,
      'rtl',
      { type: 'move', movement: { unit: 'day', amount: -1 } },
    ],
    [
      'ArrowUp',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'week', amount: -1 } },
    ],
    [
      'ArrowDown',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'week', amount: 1 } },
    ],
    ['Home', false, 'ltr', { type: 'move', movement: { unit: 'week-start' } }],
    ['End', false, 'ltr', { type: 'move', movement: { unit: 'week-end' } }],
    [
      'PageUp',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'month', amount: -1 } },
    ],
    [
      'PageDown',
      false,
      'ltr',
      { type: 'move', movement: { unit: 'month', amount: 1 } },
    ],
    [
      'PageUp',
      true,
      'ltr',
      { type: 'move', movement: { unit: 'year', amount: -1 } },
    ],
    [
      'PageDown',
      true,
      'ltr',
      { type: 'move', movement: { unit: 'year', amount: 1 } },
    ],
  ] as const)('resolves %s with shift=%s in %s', (key, shiftKey, direction, expected) => {
    expect(resolveCalendarKeyboardCommand(key, shiftKey, direction)).toEqual(
      expected
    );
  });

  it.each(['Enter', ' '] as const)('resolves %j as activation', (key) => {
    expect(resolveCalendarKeyboardCommand(key, false, 'ltr')).toEqual({
      type: 'activate',
    });
  });

  it('returns null for unhandled keys', () => {
    expect(resolveCalendarKeyboardCommand('Escape', false, 'ltr')).toBeNull();
  });
});
