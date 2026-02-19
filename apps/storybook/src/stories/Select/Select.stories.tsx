import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from 'frey-ui';
import { Select } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';

const StorySelect = Select as unknown as React.ComponentType<SelectProps>;

const meta: Meta<SelectProps> = {
  component: StorySelect,
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
    <StorySelect {...args}>
      <option value='product'>Product</option>
      <option value='engineering'>Engineering</option>
      <option value='design'>Design</option>
    </StorySelect>
  ),
  args: {
    label: 'Team',
    placeholder: 'Select a team'
  }
} satisfies Story;

export const with_helper_text: Story = {
  render: (args) => (
    <StorySelect {...args}>
      <option value='id'>Indonesia</option>
      <option value='sg'>Singapore</option>
      <option value='jp'>Japan</option>
    </StorySelect>
  ),
  args: {
    label: 'Country',
    helperText: 'Used for localization defaults.'
  }
} satisfies Story;

export const with_error: Story = {
  render: (args) => (
    <StorySelect {...args}>
      <option value='owner'>Owner</option>
      <option value='member'>Member</option>
    </StorySelect>
  ),
  args: {
    label: 'Role',
    error: 'Role is required.'
  }
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <StorySelect label='Small' size='sm'>
        <option value='sm'>Small</option>
      </StorySelect>
      <StorySelect label='Medium' size='md'>
        <option value='md'>Medium</option>
      </StorySelect>
      <StorySelect label='Large' size='lg'>
        <option value='lg'>Large</option>
      </StorySelect>
    </div>
  )
} satisfies Story;

export const controlled: Story = {
  render: function ControlledSelect() {
    const [value, setValue] = useState('owner');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <StorySelect
          label='Permission level'
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          <option value='owner'>Owner</option>
          <option value='editor'>Editor</option>
          <option value='viewer'>Viewer</option>
        </StorySelect>
        <small>Selected: {value}</small>
      </div>
    );
  }
} satisfies Story;
