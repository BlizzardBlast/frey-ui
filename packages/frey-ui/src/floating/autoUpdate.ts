type Cleanup = () => void;

type SharedListener = {
  callbacks: Set<EventListener>;
  listener: EventListener;
  options?: AddEventListenerOptions;
};

const sharedListeners = new WeakMap<EventTarget, Map<string, SharedListener>>();

const overflowPattern = /(auto|scroll|overlay|hidden|clip)/;

function subscribeShared(
  target: EventTarget,
  type: string,
  callback: EventListener,
  options?: AddEventListenerOptions
): Cleanup {
  let targetListeners = sharedListeners.get(target);
  if (!targetListeners) {
    targetListeners = new Map();
    sharedListeners.set(target, targetListeners);
  }

  const key = type;
  let subscription = targetListeners.get(key);
  if (!subscription) {
    const callbacks = new Set<EventListener>();
    const listener: EventListener = (event) => {
      callbacks.forEach((registeredCallback) => {
        registeredCallback(event);
      });
    };
    subscription = { callbacks, listener, options };
    targetListeners.set(key, subscription);
    target.addEventListener(type, listener, options);
  }

  subscription.callbacks.add(callback);
  const activeSubscription = subscription;
  const activeTargetListeners = targetListeners;

  return () => {
    activeSubscription.callbacks.delete(callback);

    if (activeSubscription.callbacks.size === 0) {
      target.removeEventListener(
        type,
        activeSubscription.listener,
        activeSubscription.options
      );
      activeTargetListeners.delete(key);
      if (activeTargetListeners.size === 0) {
        sharedListeners.delete(target);
      }
    }
  };
}

function getParentElement(element: Element): Element | null {
  const assignedSlot = (element as HTMLElement).assignedSlot;
  if (assignedSlot) return assignedSlot;

  const parentNode = element.parentNode;
  if (parentNode instanceof Element) return parentNode;
  if (parentNode instanceof ShadowRoot) return parentNode.host;
  return null;
}

function isOverflowElement(element: Element): boolean {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  if (!style) return false;

  return overflowPattern.test(
    `${style.overflow}${style.overflowX}${style.overflowY}`
  );
}

export function getOverflowElements(element: Element): Element[] {
  const ancestors: Element[] = [];
  let current = getParentElement(element);

  while (current) {
    if (isOverflowElement(current)) {
      ancestors.push(current);
    }
    current = getParentElement(current);
  }

  return ancestors;
}

function getOverflowAncestors(
  element: Element,
  ownerWindow: Window
): EventTarget[] {
  return [...getOverflowElements(element), ownerWindow];
}

function observeReferenceMove(
  reference: Element,
  update: () => void
): Cleanup | undefined {
  const ownerWindow = reference.ownerDocument.defaultView;
  if (!ownerWindow?.IntersectionObserver) {
    return undefined;
  }
  const IntersectionObserverConstructor = ownerWindow.IntersectionObserver;

  const documentElement = reference.ownerDocument.documentElement;
  let observer: IntersectionObserver | null = null;
  let timeoutId: number | undefined;
  let active = true;

  const cleanupObserver = () => {
    if (timeoutId !== undefined) ownerWindow.clearTimeout(timeoutId);
    timeoutId = undefined;
    observer?.disconnect();
    observer = null;
  };
  const rectKeys = ['top', 'right', 'bottom', 'left'] as const;
  const rectsMatch = (first: DOMRect, second: DOMRect) => {
    for (const key of rectKeys) {
      if (first[key] !== second[key]) return false;
    }
    return true;
  };

  const refresh = (skipUpdate = false, threshold = 1) => {
    if (!active) return;
    cleanupObserver();
    const rect = reference.getBoundingClientRect();
    if (!skipUpdate) update();

    const viewportWidth = documentElement.clientWidth || ownerWindow.innerWidth;
    const viewportHeight =
      documentElement.clientHeight || ownerWindow.innerHeight;
    const rootMargin = `${-Math.floor(rect.top)}px ${-Math.floor(
      viewportWidth - rect.right
    )}px ${-Math.floor(viewportHeight - rect.bottom)}px ${-Math.floor(
      rect.left
    )}px`;
    const normalizedThreshold = Math.max(0, Math.min(1, threshold));
    let firstNotification = true;

    observer = new IntersectionObserverConstructor(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          update();
          return;
        }

        const ratio = entry.intersectionRatio;
        if (ratio !== threshold) {
          if (!firstNotification) {
            refresh();
            return;
          }

          if (ratio === 0) {
            timeoutId = ownerWindow.setTimeout(
              () => refresh(false, 0.0000001),
              1000
            );
          } else {
            refresh(false, ratio);
            return;
          }
        }

        if (
          ratio === 1 &&
          !rectsMatch(rect, reference.getBoundingClientRect())
        ) {
          refresh();
          return;
        }
        firstNotification = false;
      },
      {
        rootMargin,
        threshold: normalizedThreshold,
      }
    );
    observer.observe(reference);
  };

  refresh(true);
  return () => {
    active = false;
    cleanupObserver();
  };
}

export function autoUpdateFloating(
  reference: Element,
  floating: HTMLElement,
  update: () => void
): Cleanup {
  const ownerWindow = reference.ownerDocument.defaultView;
  if (!ownerWindow) {
    update();
    return () => {};
  }

  let active = true;
  let frameId: number | null = null;
  const cleanupCallbacks: Cleanup[] = [];
  const scheduleUpdate = () => {
    if (!active || frameId !== null) return;
    frameId = ownerWindow.requestAnimationFrame(() => {
      frameId = null;
      if (active) update();
    });
  };

  const ancestors = new Set([
    ...getOverflowAncestors(reference, ownerWindow),
    ...getOverflowAncestors(floating, ownerWindow),
  ]);
  ancestors.forEach((ancestor) => {
    cleanupCallbacks.push(
      subscribeShared(ancestor, 'scroll', scheduleUpdate, { passive: true }),
      subscribeShared(ancestor, 'resize', scheduleUpdate)
    );
  });

  const visualViewport = ownerWindow.visualViewport;
  if (visualViewport) {
    cleanupCallbacks.push(
      subscribeShared(visualViewport, 'scroll', scheduleUpdate, {
        passive: true,
      }),
      subscribeShared(visualViewport, 'resize', scheduleUpdate)
    );
  }

  const ResizeObserverConstructor = ownerWindow.ResizeObserver;
  if (ResizeObserverConstructor !== undefined) {
    const resizeObserver = new ResizeObserverConstructor(scheduleUpdate);
    resizeObserver.observe(reference);
    resizeObserver.observe(floating);
    cleanupCallbacks.push(() => resizeObserver.disconnect());
  }

  const cleanupMoveObserver = observeReferenceMove(reference, scheduleUpdate);
  if (cleanupMoveObserver) cleanupCallbacks.push(cleanupMoveObserver);

  update();
  let cleanedUp = false;

  return () => {
    if (cleanedUp) return;
    cleanedUp = true;
    active = false;
    if (frameId !== null) {
      ownerWindow.cancelAnimationFrame(frameId);
      frameId = null;
    }
    cleanupCallbacks.forEach((cleanup) => {
      cleanup();
    });
  };
}
