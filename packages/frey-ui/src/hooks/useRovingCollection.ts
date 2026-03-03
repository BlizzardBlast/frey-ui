import React from 'react';

type RegisterItemOptions = {
  disabled?: boolean;
  value?: string;
};

type RovingItem = {
  element: HTMLElement | null;
  disabled: boolean;
  value?: string;
};

type OrderedRovingItem = RovingItem & {
  id: string;
};

export type RovingCollection = {
  registerItem: (
    id: string,
    element: HTMLElement | null,
    options?: RegisterItemOptions
  ) => void;
  unregisterItem: (id: string) => void;
  focusNext: (currentId: string) => string | null;
  focusPrevious: (currentId: string) => string | null;
  focusFirst: () => string | null;
  focusLast: () => string | null;
  findItemIdByElement: (element: HTMLElement | null) => string | null;
};

function sortByDomOrder(a: OrderedRovingItem, b: OrderedRovingItem) {
  if (!a.element || !b.element || a.element === b.element) return 0;
  if (typeof Node === 'undefined') return 0;

  const position = a.element.compareDocumentPosition(b.element);

  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }

  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }

  return 0;
}

export function useRovingCollection(): RovingCollection {
  const itemsRef = React.useRef<Map<string, RovingItem>>(new Map());

  const registerItem = React.useCallback(
    (
      id: string,
      element: HTMLElement | null,
      options: RegisterItemOptions = {}
    ) => {
      itemsRef.current.set(id, {
        element,
        disabled: Boolean(options.disabled),
        value: options.value
      });
    },
    []
  );

  const unregisterItem = React.useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const getOrderedEnabledItems = React.useCallback((): OrderedRovingItem[] => {
    return Array.from(itemsRef.current.entries())
      .map(([id, item]) => ({ id, ...item }))
      .filter((item) => {
        return item.element?.isConnected && !item.disabled;
      })
      .sort(sortByDomOrder);
  }, []);

  const focusByIndex = React.useCallback(
    (index: number): string | null => {
      const orderedItems = getOrderedEnabledItems();
      const target = orderedItems[index];

      if (!target?.element) return null;

      target.element.focus();
      return target.id;
    },
    [getOrderedEnabledItems]
  );

  const focusNext = React.useCallback(
    (currentId: string): string | null => {
      const orderedItems = getOrderedEnabledItems();
      if (orderedItems.length === 0) return null;

      const currentIndex = orderedItems.findIndex(
        (item) => item.id === currentId
      );
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % orderedItems.length;

      return focusByIndex(nextIndex);
    },
    [focusByIndex, getOrderedEnabledItems]
  );

  const focusPrevious = React.useCallback(
    (currentId: string): string | null => {
      const orderedItems = getOrderedEnabledItems();
      if (orderedItems.length === 0) return null;

      const currentIndex = orderedItems.findIndex(
        (item) => item.id === currentId
      );
      const previousIndex =
        currentIndex === -1
          ? orderedItems.length - 1
          : (currentIndex - 1 + orderedItems.length) % orderedItems.length;

      return focusByIndex(previousIndex);
    },
    [focusByIndex, getOrderedEnabledItems]
  );

  const focusFirst = React.useCallback((): string | null => {
    return focusByIndex(0);
  }, [focusByIndex]);

  const focusLast = React.useCallback((): string | null => {
    const orderedItems = getOrderedEnabledItems();
    if (orderedItems.length === 0) return null;
    return focusByIndex(orderedItems.length - 1);
  }, [focusByIndex, getOrderedEnabledItems]);

  const findItemIdByElement = React.useCallback(
    (element: HTMLElement | null): string | null => {
      if (!element) return null;

      for (const [id, item] of itemsRef.current.entries()) {
        if (!item.element) continue;

        if (item.element === element || item.element.contains(element)) {
          return id;
        }
      }

      return null;
    },
    []
  );

  return React.useMemo(
    () => ({
      registerItem,
      unregisterItem,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      findItemIdByElement
    }),
    [
      registerItem,
      unregisterItem,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      findItemIdByElement
    ]
  );
}

export default useRovingCollection;
