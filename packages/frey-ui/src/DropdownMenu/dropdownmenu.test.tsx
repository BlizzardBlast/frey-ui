import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import DropdownMenu from './index';

function createMockRect({
  x = 0,
  y = 0,
  width = 0,
  height = 0
}: Readonly<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}>): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({})
  } as DOMRect;
}

describe('DropdownMenu', () => {
  it('opens from default native trigger button', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
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

  it('does not open when asChild trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Prevent menu
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Prevent menu' }));

    expect(
      screen.queryByRole('menuitem', { name: 'Rename' })
    ).not.toBeInTheDocument();
  });

  it('closes when clicking outside by default', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <DropdownMenu>
          <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Rename</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(
      screen.getByRole('menuitem', { name: 'Rename' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Rename' })
    ).not.toBeInTheDocument();
  });

  it('does not close on outside click when disabled', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <DropdownMenu closeOnOutsideClick={false}>
          <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Rename</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(
      screen.getByRole('menuitem', { name: 'Rename' })
    ).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DropdownMenu open onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on Escape when disabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DropdownMenu open onOpenChange={onOpenChange} closeOnEscape={false}>
        <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('calls onSelect and closes on item click', async () => {
    const user = userEvent.setup();
    const onSelectRename = vi.fn();
    const onSelectDuplicate = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
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
        <DropdownMenu.Trigger asChild>
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
        <DropdownMenu.Trigger asChild>
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

  it('flips from right to left when there is not enough right-side space', async () => {
    const user = userEvent.setup();
    const triggerRect = createMockRect({
      x: 280,
      y: 100,
      width: 40,
      height: 24
    });
    const menuRect = createMockRect({
      width: 160,
      height: 120
    });
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getBoundingClientRectMock(
        this: HTMLElement
      ) {
        if (
          this.tagName === 'BUTTON' &&
          this.textContent?.includes('Open right menu')
        ) {
          return triggerRect;
        }

        const id = this.getAttribute('id');
        if (id?.endsWith('-menu')) {
          return menuRect;
        }

        return createMockRect({});
      });
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 360
    });

    try {
      render(
        <DropdownMenu placement='right' offset={8}>
          <DropdownMenu.Trigger>Open right menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>One</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open right menu' }));

      const menu = screen.getByRole('list');

      await waitFor(() => {
        const left = Number.parseFloat(menu.style.left);
        expect(left).toBeCloseTo(272, 0);
      });
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth
      });
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger asChild>
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
