import React from 'react';
import { mergeRefs } from '../utils/mergeRefs';
import { Slot } from '../utils/slot';
import { useFileUploadContext } from './FileUploadContext';

export type FileUploadTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled'
> & {
    disabled?: boolean;
  };

type FileUploadTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadTriggerProps> & React.RefAttributes<HTMLElement>
>;

type TriggerChildProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

function isComposedElement(
  children: React.ReactNode
): children is React.ReactElement<TriggerChildProps> {
  return React.isValidElement(children) && children.type !== React.Fragment;
}

function preventDisabledActivation(event: React.MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

function getComposedChild(
  child: React.ReactElement<TriggerChildProps>,
  disabled: boolean,
  type: React.ButtonHTMLAttributes<HTMLButtonElement>['type'] | undefined
): React.ReactElement {
  const composedProps: TriggerChildProps = {};

  if (child.type === 'button') {
    composedProps.type = child.props.type ?? type ?? 'button';
  }

  if (disabled) {
    composedProps.onClick = preventDisabledActivation;

    if (child.type === 'button') {
      composedProps.disabled = true;
    }
  }

  if (Object.keys(composedProps).length === 0) {
    return child;
  }

  return React.cloneElement(child, composedProps);
}

export const FileUploadTrigger: FileUploadTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<FileUploadTriggerProps>
>(function FileUploadTrigger(
  {
    children,
    asChild = false,
    disabled: disabledProp,
    onClick,
    type,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...triggerProps
  },
  forwardedRef
) {
  const context = useFileUploadContext();
  const disabled = context.disabled || Boolean(disabledProp);
  const ref = mergeRefs<HTMLElement>(
    forwardedRef,
    context.triggerRef as React.Ref<HTMLElement>
  );

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);

    if (event.defaultPrevented || disabled) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    context.openFileDialog();
  };

  const accessibilityProps = {
    'aria-controls': context.inputId,
    'aria-describedby': ariaDescribedBy ?? context.describedBy,
    'aria-invalid': (ariaInvalid ?? context.hasError) || undefined,
    'aria-disabled': disabled || undefined,
    'data-disabled': disabled ? true : undefined,
  };

  if (asChild) {
    if (!isComposedElement(children)) {
      throw new Error(
        'FileUpload.Trigger with asChild expects a single valid React element child; fragments are not supported.'
      );
    }

    return (
      <Slot
        {...triggerProps}
        {...accessibilityProps}
        ref={ref}
        onClick={handleClick}
      >
        {getComposedChild(children, disabled, type)}
      </Slot>
    );
  }

  return (
    <button
      {...triggerProps}
      {...accessibilityProps}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      disabled={disabled}
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
    >
      {children}
    </button>
  );
});

FileUploadTrigger.displayName = 'FileUpload.Trigger';
