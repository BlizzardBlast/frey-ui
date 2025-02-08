import clsx from 'clsx';
import styles from './chip.module.css';
import React from 'react';

export type Variant = 'default' | 'outlined';

export type ChipProps = {
  label: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  variant?: Variant;
};

const VariantDefaultMap: Record<Variant, string> = {
  default: styles.chip_default,
  outlined: styles.chip_outlined
};

const VariantClickableMap: Record<Variant, string> = {
  default: styles.chip_default_clickable,
  outlined: styles.chip_outlined_clickable
};

function Chip({
  label,
  onClick,
  style,
  className,
  variant = 'default'
}: Readonly<ChipProps>) {
  return (
    <button
      className={clsx(
        VariantDefaultMap[variant],
        {
          [VariantClickableMap[variant]]: onClick
        },
        className
      )}
      onClick={onClick}
      type='button'
      style={style}
    >
      <span className={styles.chip_text}>{label}</span>
    </button>
  );
}

export default Chip;
