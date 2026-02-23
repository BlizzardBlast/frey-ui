import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from 'frey-ui';
import { Select } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<SelectProps> = {
  component: Select,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<SelectProps>;

export default meta;

type Story = StoryObj<SelectProps>;

export const basic_select: Story = {
  render: (args) => (
    <Select {...args}>
      <option value='product'>Product</option>
      <option value='engineering'>Engineering</option>
      <option value='design'>Design</option>
    </Select>
  ),
  args: {
    label: 'Team',
    placeholder: 'Select a team'
  }
} satisfies Story;

export const with_helper_text: Story = {
  render: (args) => (
    <Select {...args}>
      <option value='id'>Indonesia</option>
      <option value='sg'>Singapore</option>
      <option value='jp'>Japan</option>
    </Select>
  ),
  args: {
    label: 'Country',
    helperText: 'Used for localization defaults.'
  }
} satisfies Story;

export const with_error: Story = {
  render: (args) => (
    <Select {...args}>
      <option value='owner'>Owner</option>
      <option value='member'>Member</option>
    </Select>
  ),
  args: {
    label: 'Role',
    error: 'Role is required.'
  }
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Select label='Small' size='sm'>
        <option value='sm'>Small</option>
      </Select>
      <Select label='Medium' size='md'>
        <option value='md'>Medium</option>
      </Select>
      <Select label='Large' size='lg'>
        <option value='lg'>Large</option>
      </Select>
    </div>
  )
} satisfies Story;

export const controlled: Story = {
  render: function ControlledSelect() {
    const [value, setValue] = useState('owner');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Select
          label='Permission level'
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          <option value='owner'>Owner</option>
          <option value='editor'>Editor</option>
          <option value='viewer'>Viewer</option>
        </Select>
        <small>Selected: {value}</small>
      </div>
    );
  }
} satisfies Story;
