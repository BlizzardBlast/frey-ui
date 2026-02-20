import clsx from 'clsx';
import React from 'react';
import styles from './card.module.css';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const CardRoot = React.forwardRef<HTMLDivElement, Readonly<CardProps>>(
  function Card({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.card, className)} {...props} />
    );
  }
);
CardRoot.displayName = 'Card';

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const CardHeader = React.forwardRef<HTMLDivElement, Readonly<CardHeaderProps>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.card_header, className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'Card.Header';

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const CardTitle = React.forwardRef<
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

const CardContent = React.forwardRef<
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

const CardFooter = React.forwardRef<HTMLDivElement, Readonly<CardFooterProps>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.card_footer, className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter
});

export default Card;
