import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFileUploadState } from './useFileUploadState';

function ResetHarness() {
  const state = useFileUploadState({});

  return (
    <form data-testid='form'>
      <input
        type='file'
        ref={state.inputRef}
        onChange={state.onInputChange}
        data-testid='input'
      />
    </form>
  );
}

describe('useFileUploadState repeated form reset', () => {
  it('cancels an outstanding native input reconciliation', () => {
    const { unmount } = render(<ResetHarness />);
    const form = screen.getByTestId('form');
    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.reset(form);
    fireEvent.reset(form);

    expect(input.files).toHaveLength(0);
    unmount();
  });
});
