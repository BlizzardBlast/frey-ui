import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from 'frey-ui';
import { Select } from 'frey-ui';
import { useState } from 'react';

type SelectStoryProps = Pick<
  SelectProps,
  | 'label'
  | 'hideLabel'
  | 'helperText'
  | 'error'
  | 'disabled'
  | 'placeholder'
  | 'size'
  | 'className'
  | 'style'
>;

const meta: Meta<SelectStoryProps> = {
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
  ],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the select input',
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
      description: 'Supporting helper copy shown below the select',
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
      description: 'Error message shown below the select',
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
      description: 'Whether the select is disabled',
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
      description: 'Placeholder option shown before a value is selected',
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
      description: 'Size variant of the select input',
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
      description: 'Additional class names applied to the select field wrapper',
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
      description: 'Inline styles applied to the select field wrapper',
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
} satisfies Meta<SelectStoryProps>;

export default meta;

type Story = StoryObj<SelectStoryProps>;

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
  render: function ControlledSelect(args) {
    const [value, setValue] = useState('owner');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Select
          {...args}
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
