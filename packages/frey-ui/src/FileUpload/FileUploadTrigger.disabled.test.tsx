import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './index';

describe('FileUpload.Trigger disabled asChild behavior', () => {
  it('disables a native button child', () => {
    const onClick = vi.fn();
    const { container } = render(
      <FileUpload label='Attachment' disabled>
        <FileUpload.Trigger asChild>
          <button type='button' onClick={onClick}>
            Attach file
          </button>
        </FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('button', { name: 'Attach file' });

    fireEvent.click(trigger);

    expect(trigger).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
    expect(inputClick).not.toHaveBeenCalled();
  });

  it('suppresses activation for a non-button child', () => {
    const onClick = vi.fn();
    const { container } = render(
      <FileUpload label='Attachment' disabled>
        <FileUpload.Trigger asChild>
          <a href='/upload' onClick={onClick}>
            Attach link
          </a>
        </FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('link', { name: 'Attach link' });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(onClick).not.toHaveBeenCalled();
    expect(inputClick).not.toHaveBeenCalled();
  });
});
