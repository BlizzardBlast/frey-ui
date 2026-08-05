import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import { FileUpload } from './index';

describe('FileUpload', () => {
  it('renders a polished default composition', () => {
    const { container } = render(<FileUpload label='Attachments' />);

    expect(
      screen.getByRole('group', { name: 'Attachments' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Drag and drop a file here')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Browse files' })
    ).toBeInTheDocument();

    const input = container.querySelector('input[type="file"]');
    expect(input?.getAttribute('aria-labelledby')).toContain('-label');
  });

  it('adds dropped files and renders their metadata', () => {
    const onValueChange = vi.fn();
    const file = new File(['hello'], 'greeting.txt', {
      type: 'text/plain',
      lastModified: 123,
    });

    render(
      <FileUpload label='Attachments' onValueChange={onValueChange}>
        <FileUpload.Dropzone data-testid='dropzone' />
        <FileUpload.List />
      </FileUpload>
    );

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onValueChange).toHaveBeenCalledWith([file]);
    expect(screen.getByRole('listitem')).toHaveTextContent('greeting.txt');
    expect(screen.getByRole('listitem')).toHaveTextContent('TXT · 5 B');
    expect(screen.getByRole('status')).toHaveTextContent('1 file added');
  });

  it('opens the file dialog through the default trigger', () => {
    const { container } = render(<FileUpload label='Attachments' />);
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Browse files' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('supports an asChild trigger', () => {
    const { container } = render(
      <FileUpload label='Attachment'>
        <FileUpload.Trigger asChild>
          <Button variant='secondary'>Attach file</Button>
        </FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Attach file' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('respects prevented trigger clicks', () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    const { container } = render(
      <FileUpload label='Attachment'>
        <FileUpload.Trigger onClick={onClick}>Attach file</FileUpload.Trigger>
      </FileUpload>
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Attach file' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('composes consumer and internal drop handlers', () => {
    const onDrop = vi.fn();
    const onValueChange = vi.fn();
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    render(
      <FileUpload label='Attachments' onValueChange={onValueChange}>
        <FileUpload.Dropzone data-testid='dropzone' onDrop={onDrop} />
      </FileUpload>
    );

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it('allows a consumer to prevent internal drop handling', () => {
    const onValueChange = vi.fn();
    const file = new File(['x'], 'file.txt', { type: 'text/plain' });

    render(
      <FileUpload label='Attachments' onValueChange={onValueChange}>
        <FileUpload.Dropzone
          data-testid='dropzone'
          onDrop={(event) => event.preventDefault()}
        />
      </FileUpload>
    );

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('removes one duplicate file at a time and returns focus to the trigger', () => {
    const onValueChange = vi.fn();
    const file = new File(['x'], 'duplicate.txt', { type: 'text/plain' });

    render(
      <FileUpload
        label='Attachments'
        multiple
        value={[file, file]}
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Browse files' });
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove duplicate.txt',
    });

    fireEvent.click(removeButtons[0]);

    expect(onValueChange).toHaveBeenCalledWith([file]);
    expect(trigger).toHaveFocus();
  });

  it('renders custom item content', () => {
    const file = new File(['x'], 'custom.txt', { type: 'text/plain' });

    render(
      <FileUpload label='Attachments' value={[file]}>
        <FileUpload.List>
          <FileUpload.Item>
            {(currentFile) => (
              <span data-testid='custom-item'>{currentFile.name}</span>
            )}
          </FileUpload.Item>
        </FileUpload.List>
      </FileUpload>
    );

    expect(screen.getByTestId('custom-item')).toHaveTextContent('custom.txt');
  });

  it('does not render an empty list', () => {
    render(
      <FileUpload label='Attachments'>
        <FileUpload.List data-testid='file-list' />
      </FileUpload>
    );

    expect(screen.queryByTestId('file-list')).not.toBeInTheDocument();
  });

  it('displays deduplicated rejection messages with structured details', () => {
    const onFilesRejected = vi.fn();
    const first = new File(['x'], 'first.exe', { type: '' });
    const second = new File(['x'], 'second.exe', { type: '' });

    render(
      <FileUpload
        label='Attachments'
        accept='image/*'
        multiple
        onFilesRejected={onFilesRejected}
      >
        <FileUpload.Dropzone data-testid='dropzone' />
      </FileUpload>
    );

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [first, second], types: ['Files'] },
    });

    expect(screen.getAllByText('File type is not allowed')).toHaveLength(1);
    expect(onFilesRejected).toHaveBeenCalledWith([
      {
        file: first,
        code: 'file-invalid-type',
        reason: 'File type is not allowed',
      },
      {
        file: second,
        code: 'file-invalid-type',
        reason: 'File type is not allowed',
      },
    ]);
  });

  it('propagates disabled and required state to visible controls', () => {
    const { container } = render(
      <FileUpload label='Attachment' disabled required />
    );

    expect(
      screen.getByRole('button', { name: 'Browse files' })
    ).toBeDisabled();
    expect(
      screen.getByRole('group', { name: 'Attachment' })
    ).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('input[type="file"]')).toBeRequired();
  });

  it('focuses the trigger when native validation fails', () => {
    const { container } = render(
      <FileUpload label='Attachment' required />
    );
    const trigger = screen.getByRole('button', { name: 'Browse files' });
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.invalid(input);

    expect(trigger).toHaveFocus();
  });

  it('marks the dropzone as dragging only for file payloads', () => {
    render(
      <FileUpload label='Attachments'>
        <FileUpload.Dropzone data-testid='dropzone' />
      </FileUpload>
    );
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['text/plain'] },
    });
    expect(dropzone).not.toHaveAttribute('data-dragging');

    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [], types: ['Files'] },
    });
    expect(dropzone).toHaveAttribute('data-dragging', 'true');
  });

  it('throws when a compound child is used outside FileUpload', () => {
    expect(() =>
      render(<FileUpload.Trigger>Upload</FileUpload.Trigger>)
    ).toThrow('must be rendered inside <FileUpload>');
  });

  it('has no accessibility violations in default and populated states', async () => {
    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    const { container, rerender } = render(
      <FileUpload label='Attachments' helperText='Up to 5 MB' />
    );

    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <FileUpload
        label='Attachments'
        helperText='Up to 5 MB'
        value={[file]}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
