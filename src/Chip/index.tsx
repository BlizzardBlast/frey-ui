import clsx from 'clsx';
import styles from './Chip.module.css';

export type ChipProps = {
  label: string;
  onClick: () => void;
};

function Chip({ label, onClick }: Readonly<ChipProps>) {
  return (
    <button
      className={clsx({
        [styles.chip]: !onClick,
        [styles.chip_clickable]: onClick
      })}
      onClick={onClick}
      type='button'
    >
      <span className={styles.chip_text}>{label}</span>
    </button>
  );
}

export default Chip;
