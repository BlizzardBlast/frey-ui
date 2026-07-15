import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from './index';

function BasicSegmentedControl({
  defaultValue,
}: Readonly<{ defaultValue?: string }>) {
  return (
    <SegmentedControl label='Dashboard view' defaultValue={defaultValue}>
      <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
      <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
    </SegmentedControl>
  );
}

describe('SegmentedControl', () => {
  it('throws when an item is rendered outside the root', () => {
    expect(() => {
      render(<SegmentedControl.Item value='list'>List</SegmentedControl.Item>);
    }).toThrow(
      'SegmentedControl.Item must be rendered within a SegmentedControl component'
    );
  });

  it('renders a labeled native radio group with a shared generated name', () => {
    render(<BasicSegmentedControl />);

    expect(
      screen.getByRole('radiogroup', { name: 'Dashboard view' })
    ).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    const names = new Set(radios.map((radio) => radio.getAttribute('name')));

    expect(radios).toHaveLength(3);
    expect(names.size).toBe(1);
    expect(radios[0]).toHaveAttribute('name');
  });

  it('keeps a visually hidden label as the accessible group name', () => {
    render(
      <SegmentedControl label='Display density' hideLabel>
        <SegmentedControl.Item value='comfortable'>
          Comfortable
        </SegmentedControl.Item>
        <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
      </SegmentedControl>
    );

    expect(
      screen.getByRole('radiogroup', { name: 'Display density' })
    ).toBeInTheDocument();
    expect(screen.getByText('Display density')).toBeInTheDocument();
  });

  it('supports uncontrolled selection via defaultValue', async () => {
    const user = userEvent.setup();

    render(<BasicSegmentedControl defaultValue='list' />);

    const list = screen.getByRole('radio', { name: 'List' });
    const grid = screen.getByRole('radio', { name: 'Grid' });

    expect(list).toBeChecked();

    await user.click(grid);

    expect(grid).toBeChecked();
    expect(list).not.toBeChecked();
  });

  it('keeps controlled value as the source of truth and emits the next value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl
        label='Dashboard view'
        value='list'
        onValueChange={onValueChange}
      >
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      </SegmentedControl>
    );

    await user.click(screen.getByRole('radio', { name: 'Grid' }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Grid' })).not.toBeChecked();
  });

  it('starts unselected and tabs to the first enabled item', async () => {
    const user = userEvent.setup();

    render(<BasicSegmentedControl />);

    const radios = screen.getAllByRole('radio');
    expect(radios.every((radio) => !(radio as HTMLInputElement).checked)).toBe(
      true
    );

    await user.tab();

    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
  });

  it('keeps an empty-string item unselected until the user chooses it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl label='Optional filter' onValueChange={onValueChange}>
        <SegmentedControl.Item value=''>All results</SegmentedControl.Item>
        <SegmentedControl.Item value='active'>Active</SegmentedControl.Item>
      </SegmentedControl>
    );

    const allResults = screen.getByRole('radio', { name: 'All results' });

    expect(allResults).not.toBeChecked();

    await user.click(allResults);

    expect(allResults).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('uses native arrow navigation in both directions with wrapping', async () => {
    const user = userEvent.setup();

    render(<BasicSegmentedControl defaultValue='list' />);

    const list = screen.getByRole('radio', { name: 'List' });
    const grid = screen.getByRole('radio', { name: 'Grid' });
    const compact = screen.getByRole('radio', { name: 'Compact' });

    list.focus();
    await user.keyboard('{ArrowRight}');
    expect(grid).toHaveFocus();
    expect(grid).toBeChecked();

    await user.keyboard('{ArrowDown}');
    expect(compact).toHaveFocus();
    expect(compact).toBeChecked();

    await user.keyboard('{ArrowRight}');
    expect(list).toHaveFocus();
    expect(list).toBeChecked();

    await user.keyboard('{ArrowLeft}');
    expect(compact).toHaveFocus();
    expect(compact).toBeChecked();

    await user.keyboard('{ArrowUp}');
    expect(grid).toHaveFocus();
    expect(grid).toBeChecked();
  });

  it('skips disabled items during native arrow navigation', async () => {
    const user = userEvent.setup();

    render(
      <SegmentedControl label='Dashboard view' defaultValue='list'>
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid' disabled>
          Grid
        </SegmentedControl.Item>
        <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
      </SegmentedControl>
    );

    const list = screen.getByRole('radio', { name: 'List' });
    const compact = screen.getByRole('radio', { name: 'Compact' });

    list.focus();
    await user.keyboard('{ArrowRight}');

    expect(compact).toHaveFocus();
    expect(compact).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeDisabled();
  });

  it('disables every item from the root and supports item-level disabled state', () => {
    const { rerender } = render(
      <SegmentedControl label='Dashboard view' disabled>
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      </SegmentedControl>
    );

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }

    rerender(
      <SegmentedControl label='Dashboard view'>
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid' disabled>
          Grid
        </SegmentedControl.Item>
      </SegmentedControl>
    );

    expect(screen.getByRole('radio', { name: 'List' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeDisabled();
  });

  it('participates in native form submission with the provided name', () => {
    const { container } = render(
      <form>
        <SegmentedControl
          label='Dashboard view'
          name='dashboard-view'
          defaultValue='grid'
        >
          <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
          <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
        </SegmentedControl>
      </form>
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    const formData = new FormData(form as HTMLFormElement);
    expect(formData.get('dashboard-view')).toBe('grid');
  });

  it('connects required, helper, and error state to the group', () => {
    render(
      <SegmentedControl
        label='Billing interval'
        helperText='Choose one interval.'
        error='An interval is required.'
        required
      >
        <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item value='yearly'>Yearly</SegmentedControl.Item>
      </SegmentedControl>
    );

    const group = screen.getByRole('radiogroup', {
      name: 'Billing interval',
    });
    const describedBy = group.getAttribute('aria-describedby') ?? '';

    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toContain('-error');
    expect(describedBy).toContain('-helper');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'An interval is required.'
    );
    expect(screen.getByText('Choose one interval.')).toBeInTheDocument();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired();
    }
  });

  it('supports sm, md, and lg size classes with md as the default', () => {
    render(
      <>
        <SegmentedControl label='Small' size='sm'>
          <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        </SegmentedControl>
        <SegmentedControl label='Medium' size='md'>
          <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        </SegmentedControl>
        <SegmentedControl label='Large' size='lg'>
          <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        </SegmentedControl>
        <SegmentedControl label='Default'>
          <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        </SegmentedControl>
      </>
    );

    const smallClass = screen.getByRole('radiogroup', {
      name: 'Small',
    }).className;
    const mediumClass = screen.getByRole('radiogroup', {
      name: 'Medium',
    }).className;
    const largeClass = screen.getByRole('radiogroup', {
      name: 'Large',
    }).className;
    const defaultClass = screen.getByRole('radiogroup', {
      name: 'Default',
    }).className;

    expect(new Set([smallClass, mediumClass, largeClass]).size).toBe(3);
    expect(defaultClass).toBe(mediumClass);
  });

  it('applies root and item DOM customization to their documented elements', () => {
    render(
      <SegmentedControl
        label='Dashboard view'
        id='dashboard-view'
        className='custom-group'
        style={{ marginTop: 12 }}
        data-testid='segmented-root'
      >
        <SegmentedControl.Item
          value='list'
          id='dashboard-list'
          className='custom-item'
          style={{ minWidth: 80 }}
        >
          List
        </SegmentedControl.Item>
      </SegmentedControl>
    );

    const group = screen.getByTestId('segmented-root');
    const radio = screen.getByRole('radio', { name: 'List' });
    const visibleSegment = screen.getByText('List');

    expect(group).toHaveAttribute('id', 'dashboard-view');
    expect(group).toHaveClass('custom-group');
    expect(group).toHaveStyle({ marginTop: '12px' });
    expect(radio).toHaveAttribute('id', 'dashboard-list');
    expect(visibleSegment).toHaveClass('custom-item');
    expect(visibleSegment).toHaveStyle({ minWidth: '80px' });
  });

  it('forwards root and item refs to the documented DOM elements', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLInputElement>();

    render(
      <SegmentedControl label='Dashboard view' ref={rootRef}>
        <SegmentedControl.Item value='list' ref={itemRef}>
          List
        </SegmentedControl.Item>
      </SegmentedControl>
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveAttribute('role', 'radiogroup');
    expect(itemRef.current).toBeInstanceOf(HTMLInputElement);
    expect(itemRef.current).toHaveAttribute('type', 'radio');
  });

  it('has no accessibility violations in default, validation, and disabled states', async () => {
    const { container, rerender } = render(
      <BasicSegmentedControl defaultValue='list' />
    );

    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <SegmentedControl label='Required choice' error='Choose one' required>
        <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        <SegmentedControl.Item value='two'>Two</SegmentedControl.Item>
      </SegmentedControl>
    );
    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <SegmentedControl label='Disabled choice' disabled>
        <SegmentedControl.Item value='one'>One</SegmentedControl.Item>
        <SegmentedControl.Item value='two'>Two</SegmentedControl.Item>
      </SegmentedControl>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
