import styles from './switch.module.css';

export type SwitchProps = {
  label: string;
};

function Switch({ label }: Readonly<SwitchProps>) {
  return (
    <label className={styles.switch}>
      <input type='checkbox' aria-label={label} />
      <span className={styles.slider}></span>
    </label>
  );
}

export default Switch;

/**
 * Inspiration: https://uiverse.io/gharsh11032000/sour-vampirebat-66
 */
