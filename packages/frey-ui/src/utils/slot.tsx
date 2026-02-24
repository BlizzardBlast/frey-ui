import clsx from 'clsx';
import React from 'react';
import { mergeRefs } from './mergeRefs';

type AnyProps = Record<string, unknown>;
type AnyEvent = {
  defaultPrevented?: boolean;
};

type EventHandler<EventType = AnyEvent> = (event: EventType) => void;

function isEventHandler(
  propName: string,
  value: unknown
): value is EventHandler {
  return propName.startsWith('on') && typeof value === 'function';
}

export function composeEventHandlers<EventType>(
  childHandler?: EventHandler<EventType>,
  slotHandler?: EventHandler<EventType>
): EventHandler<EventType> {
  return (event) => {
    childHandler?.(event);

    if (!(event as AnyEvent).defaultPrevented) {
      slotHandler?.(event);
    }
  };
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const mergedProps: AnyProps = {
    ...slotProps,
    ...childProps
  };

  if (slotProps.style || childProps.style) {
    mergedProps.style = {
      ...(slotProps.style as React.CSSProperties | undefined),
      ...(childProps.style as React.CSSProperties | undefined)
    };
  }

  if (slotProps.className || childProps.className) {
    mergedProps.className = clsx(
      slotProps.className as string | undefined,
      childProps.className as string | undefined
    );
  }

  for (const propName of Object.keys(slotProps)) {
    const slotValue = slotProps[propName];
    const childValue = childProps[propName];

    if (isEventHandler(propName, slotValue)) {
      mergedProps[propName] = composeEventHandlers(
        childValue as EventHandler | undefined,
        slotValue
      );
    }
  }

  return mergedProps;
}

function getElementRef(
  element: React.ReactElement
): React.Ref<unknown> | undefined {
  return (
    (element.props as { ref?: React.Ref<unknown> }).ref ??
    (element as unknown as { ref?: React.Ref<unknown> }).ref
  );
}

export type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement;
};

export const Slot: React.ForwardRefExoticComponent<
  SlotProps & React.RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef
) {
  if (!React.isValidElement(children)) {
    return null;
  }

  const mergedProps = mergeProps(
    slotProps as AnyProps,
    children.props as AnyProps
  );
  const childRef = getElementRef(children);

  return React.cloneElement(children, {
    ...mergedProps,
    ref: mergeRefs(childRef as React.Ref<HTMLElement>, forwardedRef)
  } as Record<string, unknown>);
});

Slot.displayName = 'Slot';
