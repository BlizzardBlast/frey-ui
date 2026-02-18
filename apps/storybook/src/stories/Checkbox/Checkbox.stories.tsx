import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CheckboxProps } from 'frey-ui';
import { Checkbox } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

const StoryCheckbox = Checkbox as unknown as React.ComponentType<CheckboxProps>;

const meta: Meta<CheckboxProps> = {
  component: StoryCheckbox,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the checkbox'
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Visually hide the label'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is disabled'
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is in an indeterminate state'
    }
  }
} satisfies Meta<CheckboxProps>;

export default meta;
type Story = StoryObj<CheckboxProps>;

export const basic_checkbox: Story = {
  args: {
    label: 'Accept terms and conditions'
  }
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <StoryCheckbox label='Small' size='sm' />
      <StoryCheckbox label='Medium (default)' size='md' />
      <StoryCheckbox label='Large' size='lg' />
    </div>
  )
} satisfies Story;

export const disabled_checkbox: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <StoryCheckbox label='Disabled unchecked' disabled />
      <StoryCheckbox label='Disabled checked' disabled defaultChecked />
    </div>
  )
} satisfies Story;

export const indeterminate: Story = {
  render: function IndeterminateDemo() {
    const [items, setItems] = useState([true, false, true]);
    const allChecked = items.every(Boolean);
    const someChecked = items.some(Boolean) && !allChecked;

    const handleSelectAll = () => {
      setItems(allChecked ? [false, false, false] : [true, true, true]);
    };

    return (
      <div className='flex flex-col gap-2'>
        <StoryCheckbox
          label='Select all'
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleSelectAll}
        />
        <div className='flex flex-col gap-1' style={{ paddingLeft: '1.5rem' }}>
          {items.map((checked, i) => (
            <StoryCheckbox
              key={i}
              label={`Item ${i + 1}`}
              checked={checked}
              onChange={() => {
                const next = [...items];
                next[i] = !next[i];
                setItems(next);
              }}
            />
          ))}
        </div>
      </div>
    );
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledCheckbox() {
    const [checked, setChecked] = useState(false);
    return (
      <div className='flex flex-col gap-4 items-center'>
        <StoryCheckbox
          label='Subscribe to newsletter'
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <p>Checkbox is: {checked ? 'checked' : 'unchecked'}</p>
      </div>
    );
  }
} satisfies Story;

export const toggle_interaction: Story = {
  args: {
    label: 'Interactive checkbox'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Interactive checkbox'
    });

    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  }
} satisfies Story;

export const disabled_interaction: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Disabled checkbox'
    });

    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  }
} satisfies Story;
