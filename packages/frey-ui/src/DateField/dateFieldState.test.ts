import { describe, expect, it } from 'vitest';
import { createDraft, getDraftValue } from './dateFieldState';

describe('DateField draft state', () => {
  it('keeps a deterministic active segment when an Intl layout is empty', () => {
    const draft = createDraft(null, 'gregory', 'en-US', [], []);

    expect(draft.activeSegment).toBe('month');
    expect(draft.values).toEqual({ era: '', year: '', month: '', day: '' });
  });

  it('retains malformed complete numeric drafts without committing', () => {
    const draft = createDraft(null, 'gregory', 'en-US', [], []);

    expect(
      getDraftValue(
        {
          ...draft,
          values: { ...draft.values, year: '--', month: '1', day: '1' },
        },
        'en-US',
        'gregory'
      )
    ).toBeUndefined();
  });
});
