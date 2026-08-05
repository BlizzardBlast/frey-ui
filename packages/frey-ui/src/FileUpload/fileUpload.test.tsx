import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './index';

describe('FileUpload', () => {
  it('renders a labeled dropzone and hidden file input', () => {
    render(
      <FileUpload label='Attachments'>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    expect(
      screen.getByRole('button', { name: 'Attachments' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Attachments')).toBeInTheDocument();
  });

  it('adds files when they are dropped onto the dropzone', () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload label='Attachments' onValueChange={onValueChange}>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    const dropzone = screen.getByRole('button', { name: 'Attachments' });
    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it('renders selected files in the list', () => {
    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    render(
      <FileUpload label='Attachments' value={[file]}>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
        <FileUpload.List>
          <FileUpload.Item />
        </FileUpload.List>
      </FileUpload>
    );

    expect(screen.getByRole('listitem')).toHaveTextContent('greeting.txt');
  });

  it('removes a selected file when the remove button is activated', () => {
    const onValueChange = vi.fn();
    const file = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    render(
      <FileUpload
        label='Attachments'
        value={[file]}
        onValueChange={onValueChange}
      >
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
        <FileUpload.List>
          <FileUpload.Item />
        </FileUpload.List>
      </FileUpload>
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('is disabled when disabled is true', () => {
    render(
      <FileUpload label='Attachments' disabled>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    const dropzone = screen.getByRole('button', { name: 'Attachments' });
    expect(dropzone).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FileUpload label='Attachments'>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('throws when a compound child is used outside FileUpload', () => {
    expect(() => render(<FileUpload.Dropzone />)).toThrow(
      'must be rendered inside <FileUpload>'
    );
  });

  it('opens the file dialog when the dropzone is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(
      <FileUpload label='Attachments'>
        <FileUpload.Dropzone onClick={onClick}>Upload</FileUpload.Dropzone>
      </FileUpload>
    );

    const dropzone = screen.getByRole('button', { name: 'Attachments' });
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(dropzone);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('displays a validation error for rejected files', () => {
    render(
      <FileUpload label='Attachments' accept='image/*'>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    const dropzone = screen.getByRole('button', { name: 'Attachments' });
    const file = new File(['x'], 'script.exe', { type: '' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(screen.getByText('File type is not allowed')).toBeInTheDocument();
  });

  it('uses the error prop when provided', () => {
    render(
      <FileUpload label='Attachments' error='Custom error'>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('renders custom dropzone and item children', () => {
    const onValueChange = vi.fn();
    const file = new File(['x'], 'custom.txt', { type: 'text/plain' });
    render(
      <FileUpload
        label='Attachments'
        value={[file]}
        onValueChange={onValueChange}
      >
        <FileUpload.Dropzone>Custom dropzone</FileUpload.Dropzone>
        <FileUpload.List>
          <FileUpload.Item>
            {(currentFile, onRemove) => (
              <div>
                <span data-testid='custom-name'>{currentFile.name}</span>
                <button type='button' onClick={onRemove}>
                  Remove
                </button>
              </div>
            )}
          </FileUpload.Item>
        </FileUpload.List>
      </FileUpload>
    );

    expect(screen.getByText('Custom dropzone')).toBeInTheDocument();
    expect(screen.getByTestId('custom-name')).toHaveTextContent('custom.txt');

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('renders an item with no file as null', () => {
    render(
      <FileUpload label='Attachments'>
        <FileUpload.Item />
      </FileUpload>
    );

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('uses an item template inside the list', () => {
    const file = new File(['x'], 'template.txt', { type: 'text/plain' });
    render(
      <FileUpload label='Attachments' value={[file]}>
        <FileUpload.Dropzone />
        <FileUpload.List>
          <FileUpload.Item />
        </FileUpload.List>
      </FileUpload>
    );

    expect(screen.getByRole('listitem')).toHaveTextContent('template.txt');
  });

  it('applies dragover styles on drag enter', () => {
    render(
      <FileUpload label='Attachments'>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload>
    );

    const dropzone = screen.getByRole('button', { name: 'Attachments' });
    fireEvent.dragEnter(dropzone);

    expect(dropzone.className).toMatch(/dragover/);
  });

  it('marks the input as required only when required and empty', () => {
    const { container, rerender } = render(
      <FileUpload label='Attachments' required>
        <FileUpload.Dropzone />
      </FileUpload>
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeRequired();

    const file = new File(['x'], 'file.txt', { type: 'text/plain' });
    rerender(
      <FileUpload label='Attachments' required value={[file]}>
        <FileUpload.Dropzone />
      </FileUpload>
    );

    expect(input).not.toBeRequired();
  });

  it('uses plural wording in the default dropzone when multiple is true', () => {
    render(
      <FileUpload label='Attachments' multiple>
        <FileUpload.Dropzone />
      </FileUpload>
    );

    expect(screen.getByText(/drag files here/i)).toBeInTheDocument();
  });

  it('renders files with the default item when the list has no item child', () => {
    const file = new File(['x'], 'default.txt', { type: 'text/plain' });
    render(
      <FileUpload label='Attachments' value={[file]}>
        <FileUpload.Dropzone />
        <FileUpload.List />
      </FileUpload>
    );

    expect(screen.getByRole('listitem')).toHaveTextContent('default.txt');
  });
});
