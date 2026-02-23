import clsx from 'clsx';
import React from 'react';
import styles from './card.module.css';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardRootComponent = React.ForwardRefExoticComponent<
  Readonly<CardProps> & React.RefAttributes<HTMLDivElement>
>;

const CardRoot: CardRootComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CardProps>
>(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={clsx(styles.card, className)} {...props} />;
});
CardRoot.displayName = 'Card';

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

type CardHeaderComponent = React.ForwardRefExoticComponent<
  Readonly<CardHeaderProps> & React.RefAttributes<HTMLDivElement>
>;

const CardHeader: CardHeaderComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CardHeaderProps>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div ref={ref} className={clsx(styles.card_header, className)} {...props} />
  );
});
CardHeader.displayName = 'Card.Header';

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

type CardTitleComponent = React.ForwardRefExoticComponent<
  Readonly<CardTitleProps> & React.RefAttributes<HTMLHeadingElement>
>;

const CardTitle: CardTitleComponent = React.forwardRef<
  HTMLHeadingElement,
  Readonly<CardTitleProps>
>(function CardTitle({ className, children, ...props }, ref) {
  return (
    <h3 ref={ref} className={clsx(styles.card_title, className)} {...props}>
      {children}
    </h3>
  );
});
CardTitle.displayName = 'Card.Title';

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

type CardContentComponent = React.ForwardRefExoticComponent<
  Readonly<CardContentProps> & React.RefAttributes<HTMLDivElement>
>;

const CardContent: CardContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CardContentProps>
>(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.card_content, className)}
      {...props}
    />
  );
});
CardContent.displayName = 'Card.Content';

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

type CardFooterComponent = React.ForwardRefExoticComponent<
  Readonly<CardFooterProps> & React.RefAttributes<HTMLDivElement>
>;

const CardFooter: CardFooterComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CardFooterProps>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div ref={ref} className={clsx(styles.card_footer, className)} {...props} />
  );
});
CardFooter.displayName = 'Card.Footer';

type CardComponent = typeof CardRoot & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

export const Card: CardComponent = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter
});

export default Card;
