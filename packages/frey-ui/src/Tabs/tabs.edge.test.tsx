import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockedCollection = vi.hoisted(() => ({
  registerItem: vi.fn(),
  unregisterItem: vi.fn(),
  focusNext: vi.fn<(currentId: string) => string | null>(() => null),
  focusPrevious: vi.fn<(currentId: string) => string | null>(() => null),
  focusFirst: vi.fn<() => string | null>(() => null),
  focusLast: vi.fn<() => string | null>(() => null),
  findItemIdByElement: vi.fn<(element: HTMLElement) => string | null>(
    () => null
  )
}));

vi.mock('../hooks/useRovingCollection', () => ({
  useRovingCollection: () => mockedCollection
}));

import Tabs from './index';

describe('Tabs edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedCollection.focusNext.mockReturnValue(null);
    mockedCollection.focusPrevious.mockReturnValue(null);
    mockedCollection.focusFirst.mockReturnValue(null);
    mockedCollection.focusLast.mockReturnValue(null);
    mockedCollection.findItemIdByElement.mockReturnValue(null);
  });

  function renderTabs(onValueChange?: (value: string) => void) {
    render(
      <Tabs defaultValue='one' onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two'>Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
      </Tabs>
    );
  }

  it('returns early on keydown when current trigger id cannot be resolved', () => {
    const onValueChange = vi.fn();

    renderTabs(onValueChange);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), {
      key: 'ArrowRight'
    });

    expect(mockedCollection.focusNext).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not change value when ArrowRight has no next item', () => {
    const onValueChange = vi.fn();
    mockedCollection.findItemIdByElement.mockReturnValue('one');

    renderTabs(onValueChange);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), {
      key: 'ArrowRight'
    });

    expect(mockedCollection.focusNext).toHaveBeenCalledWith('one');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not change value when ArrowLeft has no previous item', () => {
    const onValueChange = vi.fn();
    mockedCollection.findItemIdByElement.mockReturnValue('one');

    renderTabs(onValueChange);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), {
      key: 'ArrowLeft'
    });

    expect(mockedCollection.focusPrevious).toHaveBeenCalledWith('one');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores unrelated keys when trigger id is resolved', () => {
    const onValueChange = vi.fn();
    mockedCollection.findItemIdByElement.mockReturnValue('one');

    renderTabs(onValueChange);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), {
      key: 'Enter'
    });

    expect(mockedCollection.focusNext).not.toHaveBeenCalled();
    expect(mockedCollection.focusPrevious).not.toHaveBeenCalled();
    expect(mockedCollection.focusFirst).not.toHaveBeenCalled();
    expect(mockedCollection.focusLast).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
