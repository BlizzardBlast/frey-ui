import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, type FieldProps } from 'frey-ui';
import { useState } from 'react';

const baseInputStyle = {
  width: '100%',
  border: '1px solid var(--frey-color-border-default, #cbd5e1)',
  borderRadius: 8,
  padding: '0.5rem 0.75rem',
  backgroundColor: 'var(--frey-color-surface-primary, #ffffff)',
  color: 'var(--frey-color-text-primary, #0f172a)'
} as const;

type FieldStoryProps = Pick<
  FieldProps,
  | 'children'
  | 'label'
  | 'hideLabel'
  | 'error'
  | 'helperText'
  | 'required'
  | 'disabled'
  | 'id'
  | 'className'
  | 'style'
  | 'labelElement'
>;

const meta: Meta<FieldStoryProps> = {
  component: Field,
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
      description: 'Visible label text for the field wrapper',
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
      description:
        'Whether to visually hide the label while keeping it accessible',
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
      description: 'Error message rendered below the field',
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
      description: 'Supporting helper copy rendered below the field',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is marked as required',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the field and its label are presented as disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    labelElement: {
      control: { type: 'select' },
      options: ['label', 'span'],
      description: 'Element used to render the label wrapper',
      table: {
        type: {
          summary: "'label' | 'span'"
        },
        defaultValue: {
          summary: "'label'"
        }
      }
    },
    children: {
      control: false,
      description:
        'Render function that receives ids and validation state for the input',
      table: {
        type: {
          summary: '(props: Readonly<FieldRenderProps>) => ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    id: {
      control: { type: 'text' },
      description: 'Base id used to derive the field label and helper ids',
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
      description: 'Additional class names applied to the field container',
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
      description: 'Inline styles applied to the field container',
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
} satisfies Meta<FieldStoryProps>;

export default meta;

type Story = StoryObj<FieldStoryProps>;

export const basic_field: Story = {
  args: {
    label: 'Email address',
    helperText: 'We only use this for account notifications.'
  },
  render: (args) => (
    <Field {...args}>
      {({ inputId, describedBy, hasError }) => (
        <input
          id={inputId}
          type='email'
          placeholder='you@example.com'
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          style={baseInputStyle}
        />
      )}
    </Field>
  )
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Username',
    error: 'That username is already taken.'
  },
  render: (args) => (
    <Field {...args}>
      {({ inputId, describedBy, hasError }) => (
        <input
          id={inputId}
          type='text'
          defaultValue='frey-ui'
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          style={baseInputStyle}
        />
      )}
    </Field>
  )
} satisfies Story;

export const grouped_controls: Story = {
  args: {
    label: 'Theme preference',
    labelElement: 'span',
    helperText: 'Use arrow keys to navigate choices.'
  },
  render: (args) => (
    <Field {...args}>
      {({ labelId, describedBy }) => (
        <div
          role='radiogroup'
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          style={{ display: 'grid', gap: 8 }}
        >
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' defaultChecked />
            <span>System</span>
          </label>
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' />
            <span>Light</span>
          </label>
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' />
            <span>Dark</span>
          </label>
        </div>
      )}
    </Field>
  )
} satisfies Story;

export const controlled_field: Story = {
  render: function ControlledFieldStory(args) {
    const [value, setValue] = useState('');
    const hasError = value.length > 0 && value.length < 3;

    return (
      <Field
        {...args}
        label={args.label ?? 'Project key'}
        helperText={args.helperText ?? 'Minimum 3 characters.'}
        error={hasError ? 'Project key is too short.' : undefined}
      >
        {({ inputId, describedBy, hasError: invalid }) => (
          <input
            id={inputId}
            type='text'
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            style={baseInputStyle}
          />
        )}
      </Field>
    );
  }
} satisfies Story;
