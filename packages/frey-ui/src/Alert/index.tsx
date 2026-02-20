import clsx from 'clsx';
import React from 'react';
import {
  CircleCheckIcon,
  CircleInfoIcon,
  CircleXIcon,
  TriangleAlertIcon
} from '../Icons';
import styles from './alert.module.css';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const VariantClassMap: Record<AlertVariant, string> = {
  error: styles['alert-error'],
  success: styles['alert-success'],
  warning: styles['alert-warning'],
  info: styles['alert-info']
};

const VariantRoleMap: Record<AlertVariant, 'alert' | 'status'> = {
  error: 'alert',
  warning: 'alert',
  success: 'status',
  info: 'status'
};

const icons: Record<AlertVariant, React.ReactNode> = {
  error: (
    <CircleXIcon
      size='lg'
      strokeWidth='bold'
      className={styles.alert_icon_svg}
    />
  ),
  success: (
    <CircleCheckIcon
      size='lg'
      strokeWidth='bold'
      className={styles.alert_icon_svg}
    />
  ),
  warning: (
    <TriangleAlertIcon
      size='lg'
      strokeWidth='bold'
      className={styles.alert_icon_svg}
    />
  ),
  info: (
    <CircleInfoIcon
      size='lg'
      strokeWidth='bold'
      className={styles.alert_icon_svg}
    />
  )
};

const Alert = React.forwardRef<HTMLDivElement, Readonly<AlertProps>>(
  function Alert({ variant = 'info', title, children, className, style }, ref) {
    return (
      <div
        ref={ref}
        role={VariantRoleMap[variant]}
        className={clsx(styles.alert, VariantClassMap[variant], className)}
        style={style}
      >
        <span className={styles['alert-icon']}>{icons[variant]}</span>
        <div className={styles['alert-content']}>
          {title && <p className={styles['alert-title']}>{title}</p>}
          <p className={styles['alert-message']}>{children}</p>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
