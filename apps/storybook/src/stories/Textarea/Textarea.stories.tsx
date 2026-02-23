import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TextareaProps } from 'frey-ui';
import { Textarea } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<TextareaProps> = {
  component: Textarea,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<TextareaProps>;

export default meta;

type Story = StoryObj<TextareaProps>;

export const basic_textarea: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...'
  }
} satisfies Story;

export const with_helper_text: Story = {
  args: {
    label: 'Product description',
    helperText: 'Markdown is not supported.',
    placeholder: 'Write a short description...'
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Comment',
    error: 'Comment is required.',
    placeholder: 'Leave a comment...'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Disabled textarea',
    disabled: true,
    value: 'This field is disabled'
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledTextarea() {
    const [value, setValue] = useState('');

    return (
      <Textarea
        label='Release notes'
        value={value}
        onChange={(event) => setValue(event.target.value)}
        helperText={`${value.length}/280 characters`}
        error={value.length > 280 ? 'Maximum length exceeded.' : undefined}
      />
    );
  }
} satisfies Story;
