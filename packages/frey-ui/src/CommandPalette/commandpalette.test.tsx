import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { createRef, type HTMLAttributes, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CommandPalette from './index';

function CommandPaletteFixture(
  props: Readonly<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSelect?: (value: string) => void;
  }> = {}
) {
  const onSelectCreate = vi.fn();

  const ui = (
    <CommandPalette
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      onSelect={props.onSelect}
    >
      <CommandPalette.Trigger>Open command palette</CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Search commands' />
        <CommandPalette.List>
          <CommandPalette.Group heading='General'>
            <CommandPalette.Item
              value='open-dashboard'
              keywords={['home', 'overview']}
            >
              Open dashboard
              <CommandPalette.Shortcut>⌘D</CommandPalette.Shortcut>
            </CommandPalette.Item>
            <CommandPalette.Item value='manage-billing' keywords={['invoice']}>
              Manage billing
              <CommandPalette.Shortcut>⌘B</CommandPalette.Shortcut>
            </CommandPalette.Item>
          </CommandPalette.Group>
          <CommandPalette.Group heading='Project'>
            <CommandPalette.Item value='rename-project' disabled>
              Rename project
            </CommandPalette.Item>
            <CommandPalette.Item
              value='create-project'
              onSelect={onSelectCreate}
            >
              Create project
              <CommandPalette.Shortcut>⌘K</CommandPalette.Shortcut>
            </CommandPalette.Item>
          </CommandPalette.Group>
          <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  );

  return {
    ui,
    onSelectCreate
  };
}

describe('CommandPalette', () => {
  it('throws when a compound child is rendered outside CommandPalette root', () => {
    expect(() => {
      render(<CommandPalette.Input />);
    }).toThrow(
      'CommandPalette compound components must be rendered within a CommandPalette component'
    );
  });

  it('opens from trigger and closes on Escape while restoring focus', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    const trigger = screen.getByRole('button', {
      name: 'Open command palette'
    });

    await user.click(trigger);

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(trigger).toHaveFocus();
  });

  it('filters command items and renders empty state when there are no matches', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.type(input, 'invoice');

    expect(
      screen.getByRole('option', {
        name: /Manage billing/i
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: /Open dashboard/i
      })
    ).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'definitely-not-here');

    expect(screen.getByText('No commands found.')).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: /Manage billing/i
      })
    ).not.toBeInTheDocument();
  });

  it('supports arrow-key navigation, skips disabled items, and selects on Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { ui, onSelectCreate } = CommandPaletteFixture({ onSelect });

    render(ui);

    const trigger = screen.getByRole('button', {
      name: 'Open command palette'
    });

    await user.click(trigger);

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.click(input);

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onSelectCreate).toHaveBeenCalledWith('create-project');
    expect(onSelect).toHaveBeenCalledWith('create-project');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(trigger).toHaveFocus();
  });

  it('closes on outside press and supports controlled open state', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    function ControlledPalette() {
      const [open, setOpen] = useState(true);

      return (
        <CommandPalette
          open={open}
          onOpenChange={(nextOpen: boolean) => {
            setOpen(nextOpen);
            onOpenChange(nextOpen);
          }}
        >
          <CommandPalette.Trigger>Toggle palette</CommandPalette.Trigger>
          <CommandPalette.Content>
            <CommandPalette.Input label='Find action' />
            <CommandPalette.List>
              <CommandPalette.Item value='save'>Save</CommandPalette.Item>
              <CommandPalette.Empty>No actions found.</CommandPalette.Empty>
            </CommandPalette.List>
          </CommandPalette.Content>
        </CommandPalette>
      );
    }

    render(<ControlledPalette />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    expect(onOpenChange).toHaveBeenCalledWith(false);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Toggle palette'
      })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('exposes listbox semantics for combobox navigation', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    expect(input).toHaveAttribute('aria-haspopup', 'listbox');

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('id', input.getAttribute('aria-controls'));

    const billingOption = screen.getByRole('option', {
      name: /Manage billing/i
    });
    fireEvent.mouseEnter(billingOption);

    expect(billingOption).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps generated list id when a consumer passes a list id prop', () => {
    const listProps: HTMLAttributes<HTMLDivElement> = {
      id: 'custom-list-id'
    };

    render(
      <CommandPalette defaultOpen>
        <CommandPalette.Content>
          <CommandPalette.Input label='Search commands' />
          <CommandPalette.List {...listProps}>
            <CommandPalette.Item value='create-project'>
              Create project
            </CommandPalette.Item>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });
    const listId = input.getAttribute('aria-controls');

    expect(listId).toBeTruthy();
    expect(document.getElementById(String(listId))).toBeInTheDocument();
    expect(document.getElementById('custom-list-id')).not.toBeInTheDocument();
  });

  it('has no accessibility violations when open', async () => {
    const { ui } = CommandPaletteFixture({ defaultOpen: true });
    const { container } = render(ui);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('supports callback refs for input and items', () => {
    let inputNode: HTMLInputElement | null = null;
    let itemNode: HTMLButtonElement | null = null;

    render(
      <CommandPalette defaultOpen>
        <CommandPalette.Content>
          <CommandPalette.Input
            label='Search callback refs'
            ref={(node) => {
              inputNode = node;
            }}
          />
          <CommandPalette.List>
            <CommandPalette.Item
              value='callback-item'
              ref={(node) => {
                itemNode = node;
              }}
            >
              Callback item
            </CommandPalette.Item>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    expect(inputNode).toBeInstanceOf(HTMLInputElement);
    expect(itemNode).toBeInstanceOf(HTMLButtonElement);
  });

  it('supports object refs for input and items', () => {
    const inputRef = createRef<HTMLInputElement>();
    const itemRef = createRef<HTMLButtonElement>();

    render(
      <CommandPalette defaultOpen>
        <CommandPalette.Content>
          <CommandPalette.Input label='Search object refs' ref={inputRef} />
          <CommandPalette.List>
            <CommandPalette.Item value='object-item' ref={itemRef}>
              Object item
            </CommandPalette.Item>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('ignores keyboard handling when input keydown is default prevented', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <CommandPalette defaultOpen onSelect={onSelect}>
        <CommandPalette.Content>
          <CommandPalette.Input
            label='Prevented keydown'
            onKeyDown={(event) => {
              event.preventDefault();
            }}
          />
          <CommandPalette.List>
            <CommandPalette.Item value='save-command'>
              Save command
            </CommandPalette.Item>
            <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    const input = screen.getByRole('combobox', {
      name: 'Prevented keydown'
    });

    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports ArrowUp navigation to the last enabled item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { ui } = CommandPaletteFixture({ onSelect });

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.click(input);
    await user.keyboard('{ArrowUp}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('create-project');
  });

  it('keeps selection closed when no filtered items are available for navigation', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <CommandPalette defaultOpen onSelect={onSelect}>
        <CommandPalette.Content>
          <CommandPalette.Input label='No matches input' />
          <CommandPalette.List>
            <CommandPalette.Item value='open-dashboard'>
              Open dashboard
            </CommandPalette.Item>
            <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    const input = screen.getByRole('combobox', {
      name: 'No matches input'
    });

    await user.click(input);
    await user.type(input, 'not-found');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('No commands found.')).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('respects item interaction guards for prevented clicks and mouse events', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onMouseEnter = vi.fn((event) => {
      event.preventDefault();
    });

    render(
      <CommandPalette defaultOpen onSelect={onSelect}>
        <CommandPalette.Content>
          <CommandPalette.Input label='Guarded interactions' />
          <CommandPalette.List>
            <CommandPalette.Item
              value='guarded'
              onClick={(event) => {
                event.preventDefault();
              }}
              onMouseEnter={onMouseEnter}
            >
              Guarded action
            </CommandPalette.Item>
            <CommandPalette.Item value='disabled-guarded' disabled>
              Disabled guarded
            </CommandPalette.Item>
            <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    const guardedButton = screen.getByRole('option', {
      name: 'Guarded action'
    });

    fireEvent.mouseEnter(guardedButton);
    expect(onMouseEnter).toHaveBeenCalled();

    await user.click(guardedButton);
    expect(onSelect).not.toHaveBeenCalled();

    const enabledMouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true
    });
    guardedButton.dispatchEvent(enabledMouseDownEvent);
    expect(enabledMouseDownEvent.defaultPrevented).toBe(true);

    const disabledButton = screen.getByRole('option', {
      name: 'Disabled guarded'
    });
    const disabledMouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true
    });
    disabledButton.dispatchEvent(disabledMouseDownEvent);
    expect(disabledMouseDownEvent.defaultPrevented).toBe(false);
  });

  it('updates active item on hover and selects item on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { ui } = CommandPaletteFixture({ onSelect });

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });
    const billingItem = screen.getByRole('option', {
      name: /Manage billing/i
    });

    fireEvent.mouseEnter(billingItem);
    expect(input).toHaveAttribute('aria-activedescendant', billingItem.id);

    await user.click(billingItem);
    expect(onSelect).toHaveBeenCalledWith('manage-billing');
  });

  it('keeps hidden items from preventing default on mousedown', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.type(input, 'invoice');

    const hiddenOpenDashboardButton = screen
      .getByText('Open dashboard')
      .closest('button');

    expect(hiddenOpenDashboardButton).toBeTruthy();

    const hiddenMouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true
    });

    hiddenOpenDashboardButton?.dispatchEvent(hiddenMouseDownEvent);

    expect(hiddenMouseDownEvent.defaultPrevented).toBe(false);
  });

  it('does not select when Enter is pressed with a stale non-visible active item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { ui } = CommandPaletteFixture({ onSelect });

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });
    const openDashboardItem = screen.getByRole('option', {
      name: /Open dashboard/i
    });

    fireEvent.mouseEnter(openDashboardItem);

    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: 'invoice'
        }
      });
      fireEvent.keyDown(input, {
        key: 'Enter'
      });
    });

    expect(onSelect).not.toHaveBeenCalledWith('open-dashboard');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('starts ArrowDown navigation from first item when active id is temporarily null', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.type(input, 'not-found');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: ''
        }
      });
      fireEvent.keyDown(input, {
        key: 'ArrowDown'
      });
    });

    const visibleItems = [
      screen.getByRole('option', {
        name: /Open dashboard/i
      }).id,
      screen.getByRole('option', {
        name: /Manage billing/i
      }).id,
      screen.getByRole('option', {
        name: /Create project/i
      }).id
    ];

    expect(visibleItems).toContain(
      input.getAttribute('aria-activedescendant') ?? ''
    );
  });

  it('starts ArrowUp navigation from last item when active id is temporarily null', async () => {
    const user = userEvent.setup();
    const { ui } = CommandPaletteFixture();

    render(ui);

    await user.click(
      screen.getByRole('button', {
        name: 'Open command palette'
      })
    );

    const input = screen.getByRole('combobox', {
      name: 'Search commands'
    });

    await user.type(input, 'not-found');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: ''
        }
      });
      fireEvent.keyDown(input, {
        key: 'ArrowUp'
      });
    });

    const createProjectItem = screen.getByRole('option', {
      name: /Create project/i
    });

    expect(input).toHaveAttribute(
      'aria-activedescendant',
      createProjectItem.id
    );
  });

  it('supports visually hidden labels for the command input', () => {
    render(
      <CommandPalette defaultOpen>
        <CommandPalette.Content>
          <CommandPalette.Input label='Hidden label example' hideLabel />
          <CommandPalette.List>
            <CommandPalette.Item value='sample'>Sample</CommandPalette.Item>
            <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
          </CommandPalette.List>
        </CommandPalette.Content>
      </CommandPalette>
    );

    expect(screen.getByText('Hidden label example').className).toContain(
      'visually_hidden'
    );
  });
});
