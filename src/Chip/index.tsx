import { memo } from 'react';
import styles from './Chip.module.css';

export type ChipProps = {
  label: string;
  onClick: () => void;
};

function Chip({ label, onClick }: Readonly<ChipProps>) {
  return (
    <button className={styles.chip} onClick={onClick} type='button'>
      <span className={styles.chip_text}>{label}</span>
    </button>
  );
}

export default memo(Chip);
