import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComboboxOption, ComboboxProps } from 'frey-ui';
import { Combobox } from 'frey-ui';
import { type ChangeEvent, useEffect, useState } from 'react';

const options: ReadonlyArray<ComboboxOption> = [
  {
    value: 'id',
    label: 'Indonesia'
  },
  {
    value: 'sg',
    label: 'Singapore'
  },
  {
    value: 'jp',
    label: 'Japan'
  },
  {
    value: 'us',
    label: 'United States'
  }
];

type ComboboxStoryProps = Pick<
  ComboboxProps,
  | 'label'
  | 'options'
  | 'hideLabel'
  | 'placeholder'
  | 'helperText'
  | 'error'
  | 'disabled'
  | 'defaultValue'
  | 'onChange'
  | 'noResultsText'
  | 'size'
  | 'value'
  | 'className'
  | 'style'
>;

const meta: Meta<ComboboxStoryProps> = {
  component: Combobox,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the combobox input',
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
      description: 'List of selectable options displayed in the combobox menu',
      table: {
        type: {
          summary: 'ReadonlyArray<ComboboxOption>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Whether to visually hide the field label',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown when the input is empty',
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
      description: 'Supporting helper copy shown below the input',
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
      description: 'Error message shown below the input',
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
      description: 'Whether the combobox is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial input value when the combobox is uncontrolled',
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
      description: 'Called when the combobox input value changes',
      table: {
        type: {
          summary: 'ChangeEventHandler<HTMLInputElement>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    noResultsText: {
      control: { type: 'text' },
      description: 'Message displayed when filtering returns no options',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'No results found'"
        }
      }
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled combobox input value',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the combobox input',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg'"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    className: {
      control: { type: 'text' },
      description:
        'Additional class names applied to the combobox field wrapper',
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
      description: 'Inline styles applied to the combobox field wrapper',
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
} satisfies Meta<ComboboxStoryProps>;

export default meta;

type Story = StoryObj<ComboboxStoryProps>;

export const basic_combobox: Story = {
  args: {
    label: 'Country',
    options,
    placeholder: 'Search country'
  }
} satisfies Story;

export const with_helper_text: Story = {
  args: {
    label: 'Timezone region',
    options: [
      {
        value: 'asia-jakarta',
        label: 'Asia/Jakarta'
      },
      {
        value: 'utc',
        label: 'UTC'
      },
      {
        value: 'america-new-york',
        label: 'America/New_York'
      }
    ],
    helperText: 'Type to filter long option lists quickly.'
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Country',
    options,
    error: 'Please choose a valid country.'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Country',
    options,
    value: 'Indonesia',
    disabled: true
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledCombobox(args) {
    const [value, setValue] = useState(args.defaultValue ?? 'Indonesia');
    const resolvedOptions = args.options ?? options;
    const resolvedValue = args.value ?? value;

    useEffect(() => {
      if (args.value === undefined) {
        setValue(args.defaultValue ?? 'Indonesia');
      }
    }, [args.defaultValue, args.value]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (args.value === undefined) {
        setValue(event.target.value);
      }

      args.onChange?.(event);
    };

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Combobox
          {...args}
          label={args.label ?? 'Country'}
          options={resolvedOptions}
          value={resolvedValue}
          onChange={handleChange}
        />
        <small>Current value: {resolvedValue}</small>
      </div>
    );
  }
} satisfies Story;

export const custom_empty_state: Story = {
  args: {
    label: 'Country',
    options,
    placeholder: 'Type a country name',
    noResultsText: 'No countries match your search.'
  }
} satisfies Story;
