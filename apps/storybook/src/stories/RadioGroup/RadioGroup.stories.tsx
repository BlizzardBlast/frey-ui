import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RadioGroupProps } from 'frey-ui';
import { RadioGroup } from 'frey-ui';
import { useEffect, useState } from 'react';

type RadioGroupStoryProps = Pick<
  RadioGroupProps,
  | 'label'
  | 'options'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'hideLabel'
  | 'helperText'
  | 'error'
  | 'disabled'
  | 'required'
  | 'orientation'
  | 'name'
  | 'id'
  | 'className'
  | 'style'
>;

const meta: Meta<RadioGroupStoryProps> = {
  component: RadioGroup,
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
      description: 'Accessible group label for the radio set',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    options: {
      control: { type: 'object' },
      description: 'Radio options rendered by the group',
      table: {
        type: {
          summary: 'ReadonlyArray<RadioOption>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial selected option when uncontrolled',
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
      description: 'Controlled selected option value',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onChange: {
      action: 'changed',
      description: 'Called when the selected radio option changes',
      table: {
        type: {
          summary: 'ChangeEventHandler<HTMLInputElement>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Whether to visually hide the group label',
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
      description: 'Supporting helper copy shown below the group',
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
      description: 'Error message shown below the group',
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
      description: 'Whether the entire radio group is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether a radio option selection is required',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the radio options',
      table: {
        type: {
          summary: "'vertical' | 'horizontal'"
        },
        defaultValue: {
          summary: "'vertical'"
        }
      }
    },
    name: {
      control: { type: 'text' },
      description: 'Name attribute shared by the radio inputs',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    id: {
      control: { type: 'text' },
      description: 'Base id used to derive the radio group and option ids',
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
        'Additional class names applied to the radio group field wrapper',
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
      description: 'Inline styles applied to the radio group field wrapper',
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
} satisfies Meta<RadioGroupStoryProps>;

export default meta;

type Story = StoryObj<RadioGroupStoryProps>;

const planOptions: RadioGroupProps['options'] = [
  {
    label: 'Starter',
    value: 'starter',
    description: 'Good for small teams'
  },
  {
    label: 'Growth',
    value: 'growth',
    description: 'Best for scaling products'
  },
  {
    label: 'Enterprise',
    value: 'enterprise',
    description: 'Advanced security and support'
  }
];

export const basic_radio_group: Story = {
  args: {
    label: 'Plan',
    options: planOptions,
    defaultValue: 'growth'
  }
} satisfies Story;

export const horizontal: Story = {
  args: {
    label: 'Environment',
    orientation: 'horizontal',
    options: [
      { label: 'Development', value: 'dev' },
      { label: 'Staging', value: 'staging' },
      { label: 'Production', value: 'prod' }
    ]
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Billing cycle',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' }
    ],
    error: 'Please choose a billing cycle.'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Readonly options',
    options: planOptions,
    defaultValue: 'starter',
    disabled: true
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledRadioGroup(args) {
    const [value, setValue] = useState(args.defaultValue ?? 'starter');
    const resolvedValue = args.value ?? value;

    useEffect(() => {
      if (args.value === undefined) {
        setValue(args.defaultValue ?? 'starter');
      }
    }, [args.defaultValue, args.value]);

    const handleChange: NonNullable<RadioGroupProps['onChange']> = (event) => {
      if (args.value === undefined) {
        setValue(event.target.value);
      }

      args.onChange?.(event);
    };

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <RadioGroup
          {...args}
          label={args.label ?? 'Selected plan'}
          options={args.options ?? planOptions}
          value={resolvedValue}
          onChange={handleChange}
        />
        <small>Current selection: {resolvedValue}</small>
      </div>
    );
  }
} satisfies Story;
