import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CheckboxProps } from 'frey-ui';
import { Checkbox } from 'frey-ui';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<CheckboxProps> = {
  component: Checkbox,
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
      <Checkbox label='Small' size='sm' />
      <Checkbox label='Medium (default)' size='md' />
      <Checkbox label='Large' size='lg' />
    </div>
  )
} satisfies Story;

export const disabled_checkbox: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Checkbox label='Disabled unchecked' disabled />
      <Checkbox label='Disabled checked' disabled defaultChecked />
    </div>
  )
} satisfies Story;

export const indeterminate: Story = {
  render: function IndeterminateDemo() {
    const [items, setItems] = useState([
      { id: '1', checked: true },
      { id: '2', checked: false },
      { id: '3', checked: true }
    ]);
    const allChecked = items.every((item) => item.checked);
    const someChecked = items.some((item) => item.checked) && !allChecked;

    const handleSelectAll = () => {
      setItems(
        items.map((item) => ({
          ...item,
          checked: !allChecked
        }))
      );
    };

    return (
      <div className='flex flex-col gap-2'>
        <Checkbox
          label='Select all'
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleSelectAll}
        />
        <div className='flex flex-col gap-1' style={{ paddingLeft: '1.5rem' }}>
          {items.map((item, i) => (
            <Checkbox
              key={item.id}
              label={`Item ${i + 1}`}
              checked={item.checked}
              onChange={() => {
                const next = [...items];
                next[i] = { ...next[i], checked: !next[i].checked };
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
        <Checkbox
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
