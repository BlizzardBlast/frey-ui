import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type RovingCollection,
  useRovingCollection
} from './useRovingCollection';

type HarnessProps = {
  onReady: (collection: RovingCollection) => void;
};

function Harness({ onReady }: Readonly<HarnessProps>) {
  const collection = useRovingCollection();

  React.useEffect(() => {
    onReady(collection);
  }, [collection, onReady]);

  return null;
}

function setupCollection(): RovingCollection {
  let collection: RovingCollection | null = null;

  render(
    <Harness
      onReady={(nextCollection) => {
        collection = nextCollection;
      }}
    />
  );

  if (!collection) {
    throw new Error('Roving collection was not initialized.');
  }

  return collection;
}

function createFocusableButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = label;
  document.body.appendChild(button);
  return button;
}

describe('useRovingCollection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('returns null when no enabled items are registered', () => {
    const collection = setupCollection();

    expect(collection.focusFirst()).toBeNull();
    expect(collection.focusLast()).toBeNull();
    expect(collection.focusNext('missing')).toBeNull();
    expect(collection.focusPrevious('missing')).toBeNull();
    expect(collection.findItemIdByElement(null)).toBeNull();
  });

  it('navigates between enabled items and wraps around', () => {
    const collection = setupCollection();
    const first = createFocusableButton('First');
    const second = createFocusableButton('Second');
    const third = createFocusableButton('Third');

    collection.registerItem('first', first);
    collection.registerItem('second', second, { disabled: true });
    collection.registerItem('third', third);

    expect(collection.focusFirst()).toBe('first');
    expect(first).toHaveFocus();

    expect(collection.focusNext('first')).toBe('third');
    expect(third).toHaveFocus();

    expect(collection.focusNext('unknown')).toBe('first');
    expect(first).toHaveFocus();

    expect(collection.focusPrevious('first')).toBe('third');
    expect(third).toHaveFocus();

    expect(collection.focusPrevious('unknown')).toBe('third');
    expect(third).toHaveFocus();

    expect(collection.focusLast()).toBe('third');

    collection.unregisterItem('third');

    expect(collection.focusLast()).toBe('first');
  });

  it('sorts by DOM order regardless of registration order', () => {
    const collection = setupCollection();
    const first = createFocusableButton('First');
    const second = createFocusableButton('Second');

    collection.registerItem('second', second);
    collection.registerItem('first', first);

    expect(collection.focusFirst()).toBe('first');
    expect(collection.focusLast()).toBe('second');
  });

  it('finds ids from descendants and skips null elements', () => {
    const collection = setupCollection();
    const parentButton = createFocusableButton('Parent');
    const childElement = document.createElement('span');

    parentButton.appendChild(childElement);

    collection.registerItem('ghost', null);
    collection.registerItem('parent', parentButton);

    expect(collection.findItemIdByElement(parentButton)).toBe('parent');
    expect(collection.findItemIdByElement(childElement)).toBe('parent');
  });

  it('supports sorting when Node is unavailable', () => {
    const collection = setupCollection();
    const first = createFocusableButton('First');
    const second = createFocusableButton('Second');

    vi.stubGlobal('Node', undefined);

    collection.registerItem('first', first);
    collection.registerItem('second', second);

    expect(collection.focusFirst()).toBe('first');
  });

  it('handles duplicate element registration without crashing', () => {
    const collection = setupCollection();
    const sharedButton = createFocusableButton('Shared');

    collection.registerItem('first', sharedButton);
    collection.registerItem('second', sharedButton);

    expect(collection.focusFirst()).toBe('first');
  });

  it('keeps stable order when compareDocumentPosition has no ordering flags', () => {
    const collection = setupCollection();
    const first = createFocusableButton('First');
    const second = createFocusableButton('Second');

    Object.defineProperty(first, 'compareDocumentPosition', {
      configurable: true,
      value: () => 0
    });
    Object.defineProperty(second, 'compareDocumentPosition', {
      configurable: true,
      value: () => 0
    });

    collection.registerItem('first', first);
    collection.registerItem('second', second);

    expect(collection.focusFirst()).toBe('first');
  });
});
