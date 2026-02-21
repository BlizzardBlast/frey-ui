import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import DropdownMenu from './index';

describe('DropdownMenu', () => {
  it('opens from trigger click', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>Open menu</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
          <DropdownMenu.Item>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(
      screen.getByRole('menuitem', { name: 'Rename' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Delete' })
    ).toBeInTheDocument();
  });

  it('calls onSelect and closes on item click', async () => {
    const user = userEvent.setup();
    const onSelectRename = vi.fn();
    const onSelectDuplicate = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>Actions</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onSelectRename}>
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={onSelectDuplicate}>
            Duplicate
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));

    expect(onSelectDuplicate).toHaveBeenCalled();
    expect(
      screen.queryByRole('menuitem', { name: 'Rename' })
    ).not.toBeInTheDocument();
  });

  it('does not select disabled items', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>Actions</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item disabled onSelect={onSelect}>
            Disabled action
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Disabled action' }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports arrow key navigation', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>Open menu</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const rename = screen.getByRole('menuitem', { name: 'Rename' });
    const duplicate = screen.getByRole('menuitem', { name: 'Duplicate' });

    expect(rename).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(duplicate).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>
          <Button>A11y menu</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
          <DropdownMenu.Item destructive>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
