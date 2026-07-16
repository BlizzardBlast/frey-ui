import type { CalendarFocusMovement } from './calendarModel';
import { getHorizontalDayDelta } from './calendarModel';

export type CalendarKeyboardCommand =
  | Readonly<{ type: 'move'; movement: CalendarFocusMovement }>
  | Readonly<{ type: 'activate' }>;

const STATIC_MOVEMENTS: Readonly<
  Record<string, CalendarFocusMovement | undefined>
> = {
  ArrowUp: { unit: 'week', amount: -1 },
  ArrowDown: { unit: 'week', amount: 1 },
  Home: { unit: 'week-start' },
  End: { unit: 'week-end' },
};

function resolvePageMovement(
  key: string,
  shiftKey: boolean
): CalendarFocusMovement | undefined {
  if (key !== 'PageUp' && key !== 'PageDown') return undefined;
  return {
    unit: shiftKey ? 'year' : 'month',
    amount: key === 'PageUp' ? -1 : 1,
  };
}

export function resolveCalendarKeyboardCommand(
  key: string,
  shiftKey: boolean,
  direction: 'ltr' | 'rtl'
): CalendarKeyboardCommand | null {
  if (key === 'Enter' || key === ' ') return { type: 'activate' };
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    return {
      type: 'move',
      movement: { unit: 'day', amount: getHorizontalDayDelta(key, direction) },
    };
  }
  const movement = STATIC_MOVEMENTS[key] ?? resolvePageMovement(key, shiftKey);
  return movement ? { type: 'move', movement } : null;
}
