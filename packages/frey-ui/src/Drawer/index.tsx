import clsx from 'clsx';
import React, { createContext, useContext } from 'react';
import Dialog, {
  type DialogBodyProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogHeaderProps,
  type DialogTitleProps,
  type DialogTriggerProps
} from '../Dialog';
import styles from './drawer.module.css';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

type DrawerContextValue = {
  placement: DrawerPlacement;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error('Drawer components must be wrapped in <Drawer>');
  }

  return context;
}

export type DrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
  children: React.ReactNode;
};

const drawerRootPlacementClassMap: Record<DrawerPlacement, string> = {
  left: styles.drawer_root_left,
  right: styles.drawer_root_right,
  top: styles.drawer_root_top,
  bottom: styles.drawer_root_bottom
};

const drawerContentPlacementClassMap: Record<DrawerPlacement, string> = {
  left: styles.drawer_content_left,
  right: styles.drawer_content_right,
  top: styles.drawer_content_top,
  bottom: styles.drawer_content_bottom
};

type DrawerRootComponent = {
  (props: Readonly<DrawerProps>): React.JSX.Element;
  displayName?: string;
};

const DrawerRoot: DrawerRootComponent = function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'right',
  children
}: Readonly<DrawerProps>): React.JSX.Element {
  const contextValue = React.useMemo(() => ({ placement }), [placement]);

  return (
    <DrawerContext.Provider value={contextValue}>
      <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </DrawerContext.Provider>
  );
};
DrawerRoot.displayName = 'Drawer';

export type DrawerTriggerProps = DialogTriggerProps;

type DrawerTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerTriggerProps> & React.RefAttributes<HTMLElement>
>;

const DrawerTrigger: DrawerTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<DrawerTriggerProps>
>(function DrawerTrigger({ asChild = false, children, ...props }, ref) {
  useDrawerContext();

  if (asChild && !React.isValidElement(children)) {
    throw new Error(
      'Drawer.Trigger with asChild expects a single valid React element child.'
    );
  }

  return (
    <Dialog.Trigger ref={ref} asChild={asChild} {...props}>
      {children}
    </Dialog.Trigger>
  );
});
DrawerTrigger.displayName = 'Drawer.Trigger';

export type DrawerContentProps = DialogContentProps;

type DrawerContentComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerContentProps> & React.RefAttributes<HTMLDialogElement>
>;

const DrawerContent: DrawerContentComponent = React.forwardRef<
  HTMLDialogElement,
  Readonly<DrawerContentProps>
>(function DrawerContent(
  {
    className,
    containerClassName,
    closeLabel = 'Close drawer',
    children,
    ...props
  },
  ref
) {
  const { placement } = useDrawerContext();

  return (
    <Dialog.Content
      ref={ref}
      closeLabel={closeLabel}
      className={clsx(
        styles.drawer_content,
        drawerContentPlacementClassMap[placement],
        className
      )}
      containerClassName={clsx(
        styles.drawer_root,
        drawerRootPlacementClassMap[placement],
        containerClassName
      )}
      data-placement={placement}
      {...props}
    >
      {children}
    </Dialog.Content>
  );
});
DrawerContent.displayName = 'Drawer.Content';

export type DrawerHeaderProps = DialogHeaderProps;

type DrawerHeaderComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerHeaderProps> & React.RefAttributes<HTMLDivElement>
>;

const DrawerHeader: DrawerHeaderComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DrawerHeaderProps>
>(function DrawerHeader({ className, ...props }, ref) {
  useDrawerContext();

  return (
    <Dialog.Header
      ref={ref}
      className={clsx(styles.drawer_header, className)}
      {...props}
    />
  );
});
DrawerHeader.displayName = 'Drawer.Header';

export type DrawerTitleProps = DialogTitleProps;

type DrawerTitleComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerTitleProps> & React.RefAttributes<HTMLHeadingElement>
>;

const DrawerTitle: DrawerTitleComponent = React.forwardRef<
  HTMLHeadingElement,
  Readonly<DrawerTitleProps>
>(function DrawerTitle({ className, ...props }, ref) {
  useDrawerContext();

  return (
    <Dialog.Title
      ref={ref}
      className={clsx(styles.drawer_title, className)}
      {...props}
    />
  );
});
DrawerTitle.displayName = 'Drawer.Title';

export type DrawerDescriptionProps = DialogDescriptionProps;

type DrawerDescriptionComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerDescriptionProps> & React.RefAttributes<HTMLParagraphElement>
>;

const DrawerDescription: DrawerDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  Readonly<DrawerDescriptionProps>
>(function DrawerDescription({ className, ...props }, ref) {
  useDrawerContext();

  return (
    <Dialog.Description
      ref={ref}
      className={clsx(styles.drawer_description, className)}
      {...props}
    />
  );
});
DrawerDescription.displayName = 'Drawer.Description';

export type DrawerBodyProps = DialogBodyProps;

type DrawerBodyComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerBodyProps> & React.RefAttributes<HTMLDivElement>
>;

const DrawerBody: DrawerBodyComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DrawerBodyProps>
>(function DrawerBody({ className, ...props }, ref) {
  useDrawerContext();

  return (
    <Dialog.Body
      ref={ref}
      className={clsx(styles.drawer_body, className)}
      {...props}
    />
  );
});
DrawerBody.displayName = 'Drawer.Body';

export type DrawerFooterProps = DialogFooterProps;

type DrawerFooterComponent = React.ForwardRefExoticComponent<
  Readonly<DrawerFooterProps> & React.RefAttributes<HTMLDivElement>
>;

const DrawerFooter: DrawerFooterComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DrawerFooterProps>
>(function DrawerFooter({ className, ...props }, ref) {
  useDrawerContext();

  return (
    <Dialog.Footer
      ref={ref}
      className={clsx(styles.drawer_footer, className)}
      {...props}
    />
  );
});
DrawerFooter.displayName = 'Drawer.Footer';

type DrawerComponent = typeof DrawerRoot & {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
};

export const Drawer: DrawerComponent = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter
});

export default Drawer;
