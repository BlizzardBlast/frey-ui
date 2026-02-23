import clsx from 'clsx';
import React, { createContext, useContext, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../Icons';
import styles from './dialog.module.css';

export type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPrefix: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be wrapped in <Dialog>');
  }
  return context;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    });
  };
}

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

type DialogRootComponent = {
  (props: Readonly<DialogProps>): React.JSX.Element;
  displayName?: string;
};

const DialogRoot: DialogRootComponent = function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children
}: Readonly<DialogProps>): React.JSX.Element {
  const idPrefix = useId();
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? open : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo(
    () => ({ open: currentOpen, onOpenChange: handleOpenChange, idPrefix }),
    [currentOpen, handleOpenChange, idPrefix]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};
DialogRoot.displayName = 'Dialog';

export type DialogTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

type DialogTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<DialogTriggerProps> & React.RefAttributes<HTMLElement>
>;

const DialogTrigger: DialogTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<DialogTriggerProps>
>(function DialogTrigger({ children }, ref) {
  const { open, onOpenChange, idPrefix } = useDialogContext();

  const triggerProps = children.props as {
    onClick?: React.MouseEventHandler;
    ref?: React.Ref<HTMLElement>;
  };

  return React.cloneElement(children, {
    ref: mergeRefs(triggerProps.ref, ref),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) {
        onOpenChange(!open);
      }
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-dialog`
  } as Record<string, unknown>);
});
DialogTrigger.displayName = 'Dialog.Trigger';

export type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
  containerClassName?: string;
};

type DialogContentComponent = React.ForwardRefExoticComponent<
  Readonly<DialogContentProps> & React.RefAttributes<HTMLDialogElement>
>;

const DialogContent: DialogContentComponent = React.forwardRef<
  HTMLDialogElement,
  Readonly<DialogContentProps>
>(function DialogContent(
  {
    closeLabel = 'Close dialog',
    closeOnEscape = true,
    closeOnOverlayClick = true,
    hideCloseButton = false,
    className,
    containerClassName,
    children,
    ...props
  },
  ref
) {
  const { open, onOpenChange, idPrefix } = useDialogContext();
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const previousFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(open);

  const dialogId = `${idPrefix}-dialog`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      if (document.activeElement instanceof HTMLElement) {
        previousFocusedElementRef.current = document.activeElement;
      }
      return;
    }
    previousFocusedElementRef.current?.focus();
    previousFocusedElementRef.current = null;
  }, [open]);

  React.useEffect(() => {
    if (!mounted) return;
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const canShowModal = typeof dialogElement.showModal === 'function';

    if (open) {
      if (!dialogElement.open) {
        if (canShowModal) {
          dialogElement.showModal();
        } else {
          dialogElement.setAttribute('open', '');
        }
      }
      return;
    }

    if (dialogElement.open || dialogElement.hasAttribute('open')) {
      if (typeof dialogElement.close === 'function') {
        dialogElement.close();
      } else {
        dialogElement.removeAttribute('open');
      }
    }

    const timer = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const dialogElement = dialogRef.current;
    if (!dialogElement || typeof dialogElement.showModal === 'function') return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;

    const dialogElement = dialogRef.current;
    if (!dialogElement || typeof dialogElement.showModal === 'function') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement || !closeOnOverlayClick) return;

    const handleDialogClick = (event: MouseEvent) => {
      if (event.target === dialogElement) {
        onOpenChange(false);
      }
    };

    dialogElement.addEventListener('click', handleDialogClick);
    return () => dialogElement.removeEventListener('click', handleDialogClick);
  }, [closeOnOverlayClick, onOpenChange]);

  if (typeof document === 'undefined' || !mounted) return null;

  return createPortal(
    <dialog
      id={dialogId}
      ref={(node) => {
        dialogRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={clsx(styles.dialog_root, containerClassName)}
      onCancel={(event) => {
        if (!closeOnEscape) {
          event.preventDefault();
        }
      }}
      onClose={() => {
        if (open) {
          onOpenChange(false);
        }
      }}
    >
      <div className={clsx(styles.dialog_content, className)} {...props}>
        {!hideCloseButton && (
          <button
            type='button'
            className={styles.dialog_close}
            onClick={() => onOpenChange(false)}
            aria-label={closeLabel}
          >
            <CloseIcon size={16} className={styles.dialog_close_icon} />
          </button>
        )}
        {children}
      </div>
    </dialog>,
    document.body
  );
});
DialogContent.displayName = 'Dialog.Content';

export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

type DialogHeaderComponent = React.ForwardRefExoticComponent<
  Readonly<DialogHeaderProps> & React.RefAttributes<HTMLDivElement>
>;

const DialogHeader: DialogHeaderComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DialogHeaderProps>
>(function DialogHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.dialog_header, className)}
      {...props}
    />
  );
});
DialogHeader.displayName = 'Dialog.Header';

export type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

type DialogTitleComponent = React.ForwardRefExoticComponent<
  Readonly<DialogTitleProps> & React.RefAttributes<HTMLHeadingElement>
>;

const DialogTitle: DialogTitleComponent = React.forwardRef<
  HTMLHeadingElement,
  Readonly<DialogTitleProps>
>(function DialogTitle({ className, children, ...props }, ref) {
  const { idPrefix } = useDialogContext();
  return (
    <h2
      ref={ref}
      id={`${idPrefix}-title`}
      className={clsx(styles.dialog_title, className)}
      {...props}
    >
      {children}
    </h2>
  );
});
DialogTitle.displayName = 'Dialog.Title';

export type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

type DialogDescriptionComponent = React.ForwardRefExoticComponent<
  Readonly<DialogDescriptionProps> & React.RefAttributes<HTMLParagraphElement>
>;

const DialogDescription: DialogDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  Readonly<DialogDescriptionProps>
>(function DialogDescription({ className, children, ...props }, ref) {
  const { idPrefix } = useDialogContext();
  return (
    <p
      ref={ref}
      id={`${idPrefix}-description`}
      className={clsx(styles.dialog_description, className)}
      {...props}
    >
      {children}
    </p>
  );
});
DialogDescription.displayName = 'Dialog.Description';

export type DialogBodyProps = React.HTMLAttributes<HTMLDivElement>;

type DialogBodyComponent = React.ForwardRefExoticComponent<
  Readonly<DialogBodyProps> & React.RefAttributes<HTMLDivElement>
>;

const DialogBody: DialogBodyComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DialogBodyProps>
>(function DialogBody({ className, ...props }, ref) {
  return (
    <div ref={ref} className={clsx(styles.dialog_body, className)} {...props} />
  );
});
DialogBody.displayName = 'Dialog.Body';

export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

type DialogFooterComponent = React.ForwardRefExoticComponent<
  Readonly<DialogFooterProps> & React.RefAttributes<HTMLDivElement>
>;

const DialogFooter: DialogFooterComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DialogFooterProps>
>(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.dialog_body, className)}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '16px',
        ...props.style
      }}
      {...props}
    />
  );
});
DialogFooter.displayName = 'Dialog.Footer';

type DialogComponent = typeof DialogRoot & {
  Trigger: typeof DialogTrigger;
  Content: typeof DialogContent;
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
};

export const Dialog: DialogComponent = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter
});

export default Dialog;
