import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../Icons';
import styles from './dialog.module.css';

export type DialogProps = {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  description?: string;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  style?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
};

const Dialog = React.forwardRef<HTMLDialogElement, Readonly<DialogProps>>(
  function Dialog(
    {
      open,
      title,
      children,
      description,
      onOpenChange,
      id,
      closeLabel = 'Close dialog',
      closeOnEscape = true,
      closeOnOverlayClick = true,
      className,
      style,
      contentClassName,
      contentStyle
    },
    ref
  ) {
    const generatedId = React.useId();
    const dialogRef = React.useRef<HTMLDialogElement | null>(null);
    const previousFocusedElementRef = React.useRef<HTMLElement | null>(null);
    const dialogId = id ?? `${generatedId}-dialog`;
    const titleId = `${dialogId}-title`;
    const descriptionId = `${dialogId}-description`;

    const hasDescription =
      typeof description === 'string' && description.length > 0;

    React.useEffect(() => {
      if (open) {
        if (document.activeElement instanceof HTMLElement) {
          previousFocusedElementRef.current = document.activeElement;
        }

        return;
      }

      previousFocusedElementRef.current?.focus();
      previousFocusedElementRef.current = null;
    }, [open]);

    React.useEffect(() => {
      const dialogElement = dialogRef.current;

      if (!dialogElement) {
        return;
      }

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
    }, [open]);

    React.useEffect(() => {
      if (!open || !closeOnEscape) {
        return;
      }

      const dialogElement = dialogRef.current;

      if (!dialogElement || typeof dialogElement.showModal === 'function') {
        return;
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onOpenChange?.(false);
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, closeOnEscape, onOpenChange]);

    React.useEffect(() => {
      if (!open) {
        return;
      }

      const dialogElement = dialogRef.current;

      if (!dialogElement || typeof dialogElement.showModal === 'function') {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [open]);

    React.useEffect(() => {
      const dialogElement = dialogRef.current;

      if (!dialogElement || !closeOnOverlayClick) {
        return;
      }

      const handleDialogClick = (event: MouseEvent) => {
        if (event.target === dialogElement) {
          onOpenChange?.(false);
        }
      };

      dialogElement.addEventListener('click', handleDialogClick);

      return () => {
        dialogElement.removeEventListener('click', handleDialogClick);
      };
    }, [closeOnOverlayClick, onOpenChange]);

    if (typeof document === 'undefined') {
      return null;
    }

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
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={clsx(styles.dialog_root, className)}
        style={style}
        onCancel={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
        }}
        onClose={() => {
          if (open) {
            onOpenChange?.(false);
          }
        }}
      >
        <div
          className={clsx(styles.dialog_content, contentClassName)}
          style={contentStyle}
        >
          <div className={styles.dialog_header}>
            <h2 id={titleId} className={styles.dialog_title}>
              {title}
            </h2>
            <button
              type='button'
              className={styles.dialog_close}
              onClick={() => onOpenChange?.(false)}
              aria-label={closeLabel}
            >
              <CloseIcon size={16} className={styles.dialog_close_icon} />
            </button>
          </div>

          {hasDescription && (
            <p id={descriptionId} className={styles.dialog_description}>
              {description}
            </p>
          )}

          <div className={styles.dialog_body}>{children}</div>
        </div>
      </dialog>,
      document.body
    );
  }
);

Dialog.displayName = 'Dialog';

export default Dialog;
