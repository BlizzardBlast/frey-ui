import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type React from 'react';

import { TextInput } from 'frey-ui';
import type { TextInputProps } from 'frey-ui';
import { expect, userEvent, within } from 'storybook/test';

const StoryTextInput =
  TextInput as unknown as React.ComponentType<TextInputProps>;

const meta: Meta<TextInputProps> = {
  component: StoryTextInput,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the input'
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Visually hide the label'
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display'
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text below the input'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled'
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'search', 'tel', 'url'],
      description: 'HTML input type'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<TextInputProps>;

export default meta;
type Story = StoryObj<TextInputProps>;

export const basic_text_input: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Jane Doe'
  }
} satisfies Story;

export const with_helper_text: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    helperText: 'We will never share your email.'
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Email',
    type: 'email',
    value: 'not-an-email',
    error: 'Please enter a valid email address.'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this'
  }
} satisfies Story;

export const read_only: Story = {
  args: {
    label: 'Read-only input',
    readOnly: true,
    value: 'Fixed value'
  }
} satisfies Story;

export const hidden_label: Story = {
  args: {
    label: 'Search',
    hideLabel: true,
    placeholder: 'Search...',
    type: 'search'
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledInput() {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 320 }}>
        <StoryTextInput
          label='Username'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={`${value.length}/20 characters`}
          error={value.length > 20 ? 'Too long!' : undefined}
        />
      </div>
    );
  }
} satisfies Story;

export const type_interaction: Story = {
  args: {
    label: 'Interactive input',
    placeholder: 'Type here...'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Interactive input');

    await userEvent.type(input, 'Hello world');

    expect(input).toHaveValue('Hello world');
  }
} satisfies Story;
