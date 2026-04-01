import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TextareaProps } from 'frey-ui';
import { Textarea } from 'frey-ui';
import { useState } from 'react';

type TextareaStoryProps = Pick<
  TextareaProps,
  | 'label'
  | 'hideLabel'
  | 'helperText'
  | 'error'
  | 'disabled'
  | 'resize'
  | 'placeholder'
  | 'value'
  | 'className'
  | 'style'
>;

const meta: Meta<TextareaStoryProps> = {
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
  ],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the textarea',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Whether to visually hide the label',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    helperText: {
      control: { type: 'text' },
      description: 'Supporting helper copy shown below the textarea',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    error: {
      control: { type: 'text' },
      description: 'Error message shown below the textarea',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    resize: {
      control: { type: 'select' },
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'Resize behavior of the textarea',
      table: {
        type: {
          summary: "'none' | 'vertical' | 'horizontal' | 'both'"
        },
        defaultValue: {
          summary: "'vertical'"
        }
      }
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown when the textarea is empty',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled textarea value',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description:
        'Additional class names applied to the textarea field wrapper',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the textarea field wrapper',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<TextareaStoryProps>;

export default meta;

type Story = StoryObj<TextareaStoryProps>;

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
  render: function ControlledTextarea(args) {
    const [value, setValue] = useState('');

    return (
      <Textarea
        {...args}
        label={args.label ?? 'Release notes'}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        helperText={args.helperText ?? `${value.length}/280 characters`}
        error={value.length > 280 ? 'Maximum length exceeded.' : undefined}
      />
    );
  }
} satisfies Story;
