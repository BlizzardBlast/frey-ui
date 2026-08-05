import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { useFileUploadState } from './useFileUploadState';

function ResetHarness() {
  const state = useFileUploadState({});

  return (
    <form data-testid='form'>
      <input type='file' ref={state.inputRef} onChange={state.onInputChange} />
    </form>
  );
}

describe('useFileUploadState repeated form reset', () => {
  it('cancels an outstanding native input reconciliation', () => {
    const { unmount } = render(<ResetHarness />);
    const form = screen.getByTestId('form');

    fireEvent.reset(form);
    fireEvent.reset(form);

    unmount();
  });
});
