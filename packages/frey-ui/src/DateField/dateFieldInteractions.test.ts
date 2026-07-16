import { describe, expect, it } from 'vitest';
import { parseDateValue } from '../date/dateEngine';
import {
  formatLocalizedNumber,
  getCalendarEraOptions,
  getDateSegmentLayout,
  type CalendarEraOption,
  type DateSegmentLayoutPart,
} from '../date/dateLocale';
import type { DateSegment } from '../date/types';
import {
  createDateDraftEdit,
  normalizeDateFieldValue,
  parseDateFieldPaste,
  resolveDateDraftValue,
  resolveDateFieldKeyCommand,
  stepDateDraft,
} from './dateFieldInteractions';
import { createDraft, TEMPLATE_VALUE } from './dateFieldState';

const GREGORIAN_LAYOUT = getDateSegmentLayout(
  TEMPLATE_VALUE,
  'en-US',
  'gregory'
);
const GREGORIAN_SEGMENTS: readonly DateSegment[] = ['month', 'day', 'year'];

describe('DateField interactions', () => {
  it('normalizes date props while preserving empty control states and errors', () => {
    expect(normalizeDateFieldValue(undefined, 'value')).toBeUndefined();
    expect(normalizeDateFieldValue(null, 'value')).toBeNull();
    expect(normalizeDateFieldValue('2024-02-29', 'defaultValue')).toBe(
      '2024-02-29'
    );
    expect(() => normalizeDateFieldValue('2024-02-30', 'value')).toThrowError(
      /value/
    );
  });

  it('resolves physical segment movement in LTR and RTL', () => {
    expect(
      resolveDateFieldKeyCommand({
        key: 'ArrowRight',
        segment: 'month',
        direction: 'ltr',
        visibleSegments: GREGORIAN_SEGMENTS,
        editable: true,
      })
    ).toEqual({ type: 'move', target: 'day' });
    expect(
      resolveDateFieldKeyCommand({
        key: 'ArrowRight',
        segment: 'day',
        direction: 'rtl',
        visibleSegments: GREGORIAN_SEGMENTS,
        editable: true,
      })
    ).toEqual({ type: 'move', target: 'month' });
    expect(
      resolveDateFieldKeyCommand({
        key: 'ArrowLeft',
        segment: 'day',
        direction: 'rtl',
        visibleSegments: GREGORIAN_SEGMENTS,
        editable: true,
      })
    ).toEqual({ type: 'move', target: 'year' });
    expect(
      resolveDateFieldKeyCommand({
        key: 'ArrowLeft',
        segment: 'month',
        direction: 'ltr',
        visibleSegments: GREGORIAN_SEGMENTS,
        editable: true,
      })
    ).toEqual({ type: 'move', target: 'month' });
  });

  it('resolves restoration and editable-only clear and step commands', () => {
    const options = {
      segment: 'day' as const,
      direction: 'ltr' as const,
      visibleSegments: GREGORIAN_SEGMENTS,
    };

    expect(
      resolveDateFieldKeyCommand({ ...options, key: 'Escape', editable: false })
    ).toEqual({ type: 'restore' });
    expect(
      resolveDateFieldKeyCommand({
        ...options,
        key: 'Backspace',
        editable: true,
      })
    ).toEqual({ type: 'clear' });
    expect(
      resolveDateFieldKeyCommand({
        ...options,
        key: 'Delete',
        editable: false,
      })
    ).toBeNull();
    expect(
      resolveDateFieldKeyCommand({
        ...options,
        key: 'ArrowUp',
        editable: true,
      })
    ).toEqual({ type: 'step', segment: 'day', amount: 1 });
    expect(
      resolveDateFieldKeyCommand({
        ...options,
        key: 'ArrowDown',
        editable: false,
      })
    ).toBeNull();
    expect(
      resolveDateFieldKeyCommand({ ...options, key: 'Enter', editable: true })
    ).toBeNull();
  });

  it.each([
    ['day', 1, '2024-02-01'],
    ['month', 1, '2024-02-29'],
    ['year', 1, '2025-01-31'],
  ] as const)('steps the %s with calendar-aware clamping', (segment, amount, value) => {
    const draft = createDraft(
      '2024-01-31',
      'gregory',
      'en-US',
      GREGORIAN_LAYOUT,
      []
    );
    const stepped = stepDateDraft({
      draft,
      segment,
      amount,
      calendar: 'gregory',
      locale: 'en-US',
      layout: GREGORIAN_LAYOUT,
      eraOptions: [],
    });

    expect(stepped).not.toBeNull();
    expect(
      stepped &&
        resolveDateDraftValue({
          draft: stepped,
          locale: 'en-US',
          calendar: 'gregory',
        })
    ).toBe(value);
  });

  it('cycles era segments and stops at incomplete or ISO-boundary drafts', () => {
    const eraOptions: CalendarEraOption[] = [
      { id: 'before', label: 'Before' },
      { id: 'after', label: 'After' },
    ];
    const eraLayout: DateSegmentLayoutPart[] = [
      { kind: 'segment', type: 'era', value: 'After' },
      { kind: 'literal', value: ' ' },
      { kind: 'segment', type: 'year', value: '1' },
    ];
    const eraDraft = {
      ...createDraft(null, 'gregory', 'en-US', eraLayout, eraOptions),
      eraId: 'after',
      values: { era: 'After', year: '', month: '', day: '' },
    };

    expect(
      stepDateDraft({
        draft: eraDraft,
        segment: 'era',
        amount: 1,
        calendar: 'gregory',
        locale: 'en-US',
        layout: eraLayout,
        eraOptions,
      })
    ).toMatchObject({ eraId: 'before', values: { era: 'Before' } });
    expect(
      stepDateDraft({
        draft: eraDraft,
        segment: 'era',
        amount: 1,
        calendar: 'gregory',
        locale: 'en-US',
        layout: eraLayout,
        eraOptions: [],
      })
    ).toBeNull();
    expect(
      stepDateDraft({
        draft: eraDraft,
        segment: 'day',
        amount: 1,
        calendar: 'gregory',
        locale: 'en-US',
        layout: eraLayout,
        eraOptions,
      })
    ).toBeNull();

    const maximumDraft = createDraft(
      '9999-12-31',
      'gregory',
      'en-US',
      GREGORIAN_LAYOUT,
      []
    );
    expect(
      stepDateDraft({
        draft: maximumDraft,
        segment: 'day',
        amount: 1,
        calendar: 'gregory',
        locale: 'en-US',
        layout: GREGORIAN_LAYOUT,
        eraOptions: [],
      })
    ).toBeNull();
  });

  it('normalizes localized numeric edits and distinguishes era matches', () => {
    const persianDraft = createDraft(
      null,
      'gregory',
      'fa-IR',
      getDateSegmentLayout(TEMPLATE_VALUE, 'fa-IR', 'gregory'),
      []
    );
    const localizedDay = formatLocalizedNumber(25, 'fa-IR');
    expect(
      createDateDraftEdit({
        draft: persianDraft,
        segment: 'day',
        nextValue: `${localizedDay}x`,
        locale: 'fa-IR',
        eraOptions: [],
      })
    ).toMatchObject({
      shouldApply: true,
      draft: { values: { day: localizedDay } },
    });

    const eraOptions: CalendarEraOption[] = [
      { id: 'showa', label: 'Showa' },
      { id: 'short', label: 'Sho' },
      { id: 'heisei', label: 'Heisei' },
    ];
    const draft = {
      ...createDraft(null, 'gregory', 'en-US', [], eraOptions),
      values: { era: '', year: '', month: '', day: '' },
    };
    expect(
      createDateDraftEdit({
        draft,
        segment: 'era',
        nextValue: 'Sh',
        locale: 'en-US',
        eraOptions,
      })
    ).toMatchObject({
      shouldApply: false,
      draft: { values: { era: 'Showa' } },
    });
    expect(
      createDateDraftEdit({
        draft,
        segment: 'era',
        nextValue: 'Hei',
        locale: 'en-US',
        eraOptions,
      })
    ).toMatchObject({
      shouldApply: true,
      draft: { eraId: 'heisei', values: { era: 'Heisei' } },
    });
  });

  it('parses strict ISO, localized digits, and era-bearing paste', () => {
    const emptyGregorianDraft = createDraft(
      null,
      'gregory',
      'en-US',
      GREGORIAN_LAYOUT,
      []
    );
    const isoDraft = parseDateFieldPaste({
      text: '2024-03-20',
      draft: emptyGregorianDraft,
      calendar: 'gregory',
      locale: 'en-US',
      layout: GREGORIAN_LAYOUT,
      eraOptions: [],
    });
    expect(
      isoDraft &&
        resolveDateDraftValue({
          draft: isoDraft,
          locale: 'en-US',
          calendar: 'gregory',
        })
    ).toBe('2024-03-20');

    const persianLocale = 'fa-IR';
    const persianLayout = getDateSegmentLayout(
      TEMPLATE_VALUE,
      persianLocale,
      'gregory'
    );
    const localizedText = persianLayout
      .map((part) => {
        if (part.kind === 'literal') return part.value;
        const values = { year: 2024, month: 3, day: 20, era: 1 };
        return formatLocalizedNumber(values[part.type], persianLocale);
      })
      .join('');
    const localizedDraft = parseDateFieldPaste({
      text: localizedText,
      draft: createDraft(null, 'gregory', persianLocale, persianLayout, []),
      calendar: 'gregory',
      locale: persianLocale,
      layout: persianLayout,
      eraOptions: [],
    });
    expect(
      localizedDraft &&
        resolveDateDraftValue({
          draft: localizedDraft,
          locale: persianLocale,
          calendar: 'gregory',
        })
    ).toBe('2024-03-20');

    const japaneseLayout = getDateSegmentLayout(
      '2019-05-01',
      'en-US',
      'japanese'
    );
    const japaneseEras = getCalendarEraOptions('en-US', 'japanese');
    const reiwa = japaneseEras.find((option) => option.id === 'reiwa');
    expect(reiwa).toBeDefined();
    const eraText = japaneseLayout
      .map((part) => {
        if (part.kind === 'literal') return part.value;
        if (part.type === 'era') return reiwa?.label ?? '';
        const values = { year: 1, month: 5, day: 1 };
        return String(values[part.type]);
      })
      .join('');
    const eraDraft = parseDateFieldPaste({
      text: eraText,
      draft: createDraft(
        null,
        'japanese',
        'en-US',
        japaneseLayout,
        japaneseEras
      ),
      calendar: 'japanese',
      locale: 'en-US',
      layout: japaneseLayout,
      eraOptions: japaneseEras,
    });
    expect(
      eraDraft &&
        resolveDateDraftValue({
          draft: eraDraft,
          locale: 'en-US',
          calendar: 'japanese',
        })
    ).toBe('2019-05-01');
  });

  it('rejects malformed paste and retains incomplete or unavailable drafts', () => {
    const draft = createDraft(null, 'gregory', 'en-US', GREGORIAN_LAYOUT, []);
    expect(
      parseDateFieldPaste({
        text: 'not a date',
        draft,
        calendar: 'gregory',
        locale: 'en-US',
        layout: GREGORIAN_LAYOUT,
        eraOptions: [],
      })
    ).toBeNull();
    expect(
      resolveDateDraftValue({ draft, locale: 'en-US', calendar: 'gregory' })
    ).toBeNull();

    const partialDraft = {
      ...draft,
      values: { ...draft.values, month: '3' },
    };
    expect(
      resolveDateDraftValue({
        draft: partialDraft,
        locale: 'en-US',
        calendar: 'gregory',
      })
    ).toBeUndefined();

    const completeDraft = createDraft(
      '2024-03-20',
      'gregory',
      'en-US',
      GREGORIAN_LAYOUT,
      []
    );
    expect(
      resolveDateDraftValue({
        draft: completeDraft,
        locale: 'en-US',
        calendar: 'gregory',
        minDate: parseDateValue('2024-03-01'),
        maxDate: parseDateValue('2024-03-31'),
        isDateUnavailable: (value) => value === '2024-03-20',
      })
    ).toBeUndefined();
    expect(
      resolveDateDraftValue({
        draft: completeDraft,
        locale: 'en-US',
        calendar: 'gregory',
        minDate: parseDateValue('2024-03-21'),
      })
    ).toBeUndefined();
  });
});
