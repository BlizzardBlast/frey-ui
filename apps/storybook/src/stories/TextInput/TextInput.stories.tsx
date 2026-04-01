import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TextInputProps } from 'frey-ui';
import { TextInput } from 'frey-ui';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

type TextInputStoryProps = Pick<
  TextInputProps,
  | 'label'
  | 'hideLabel'
  | 'error'
  | 'helperText'
  | 'disabled'
  | 'type'
  | 'placeholder'
  | 'value'
  | 'readOnly'
  | 'className'
  | 'style'
>;

const meta: Meta<TextInputStoryProps> = {
  component: TextInput,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the input',
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
      description: 'Visually hide the label',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text below the input',
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
      description: 'Whether the input is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'search', 'tel', 'url'],
      description: 'HTML input type',
      table: {
        type: {
          summary: "'text' | 'email' | 'password' | 'search' | 'tel' | 'url'"
        },
        defaultValue: {
          summary: "'text'"
        }
      }
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
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
      description: 'Controlled input value',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the input is read-only',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the input field wrapper',
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
      description: 'Inline styles applied to the input field wrapper',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<TextInputStoryProps>;

export default meta;
type Story = StoryObj<TextInputStoryProps>;

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
  render: function ControlledInput(args) {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 320 }}>
        <TextInput
          {...args}
          label={args.label ?? 'Username'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={args.helperText ?? `${value.length}/20 characters`}
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
