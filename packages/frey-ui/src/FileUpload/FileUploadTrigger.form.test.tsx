import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './index';

describe('FileUpload.Trigger asChild form semantics', () => {
  it('defaults an untyped native button child to type button', () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    const { container } = render(
      <form onSubmit={onSubmit}>
        <FileUpload label='Attachment'>
          <FileUpload.Trigger asChild>
            {/* biome-ignore lint/a11y/useButtonType: This fixture verifies that FileUpload.Trigger supplies the missing type. */}
            <button>Browse files</button>
          </FileUpload.Trigger>
        </FileUpload>
      </form>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('button', { name: 'Browse files' });

    expect(trigger).toHaveAttribute('type', 'button');
    fireEvent.click(trigger);

    expect(inputClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserves a child button type over the trigger type', () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    const { container } = render(
      <form onSubmit={onSubmit}>
        <FileUpload label='Attachment'>
          <FileUpload.Trigger asChild type='reset'>
            <button type='submit'>Browse files</button>
          </FileUpload.Trigger>
        </FileUpload>
      </form>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('button', { name: 'Browse files' });

    expect(trigger).toHaveAttribute('type', 'submit');
    fireEvent.click(trigger);

    expect(inputClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses the trigger type when the native child has no type', () => {
    const onReset = vi.fn();
    const { container } = render(
      <form onReset={onReset}>
        <FileUpload label='Attachment'>
          <FileUpload.Trigger asChild type='reset'>
            {/* biome-ignore lint/a11y/useButtonType: This fixture verifies that FileUpload.Trigger forwards its type. */}
            <button>Browse files</button>
          </FileUpload.Trigger>
        </FileUpload>
      </form>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('button', { name: 'Browse files' });

    expect(trigger).toHaveAttribute('type', 'reset');
    fireEvent.click(trigger);

    expect(inputClick).toHaveBeenCalledTimes(1);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('prevents anchor navigation while opening the file dialog', () => {
    const { container } = render(
      <FileUpload label='Attachment'>
        <FileUpload.Trigger asChild>
          <a href='/upload'>Browse files</a>
        </FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('link', { name: 'Browse files' });

    expect(fireEvent.click(trigger)).toBe(false);
    expect(inputClick).toHaveBeenCalledTimes(1);
  });

  it('respects default prevention from the composed child', () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    const { container } = render(
      <FileUpload label='Attachment'>
        <FileUpload.Trigger asChild>
          <button type='button' onClick={onClick}>
            Browse files
          </button>
        </FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClick = vi.spyOn(input, 'click');

    expect(
      fireEvent.click(screen.getByRole('button', { name: 'Browse files' }))
    ).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(inputClick).not.toHaveBeenCalled();
  });
});
