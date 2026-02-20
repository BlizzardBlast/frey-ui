import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import DropdownMenu from './index';

const items = [
  { label: 'Rename', value: 'rename' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete', value: 'delete', destructive: true }
];

describe('DropdownMenu', () => {
  it('opens from trigger click', async () => {
    const user = userEvent.setup();

    render(<DropdownMenu trigger={<Button>Open menu</Button>} items={items} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('button', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onSelect and closes on item click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu
        trigger={<Button>Actions</Button>}
        items={items}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(onSelect).toHaveBeenCalledWith('duplicate');
    expect(
      screen.queryByRole('button', { name: 'Rename' })
    ).not.toBeInTheDocument();
  });

  it('does not select disabled items', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu
        trigger={<Button>Actions</Button>}
        items={[
          { label: 'Disabled action', value: 'disabled', disabled: true }
        ]}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('button', { name: 'Disabled action' }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports arrow key navigation', async () => {
    const user = userEvent.setup();

    render(<DropdownMenu trigger={<Button>Open menu</Button>} items={items} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const rename = screen.getByRole('button', { name: 'Rename' });
    const duplicate = screen.getByRole('button', { name: 'Duplicate' });

    expect(rename).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(duplicate).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DropdownMenu
        trigger={<Button>A11y menu</Button>}
        items={items}
        defaultOpen
      />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
