import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SwitchProps } from 'frey-ui';
import { Switch } from 'frey-ui';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

type SwitchStoryProps = Pick<
  SwitchProps,
  | 'label'
  | 'hideLabel'
  | 'checked'
  | 'disabled'
  | 'size'
  | 'className'
  | 'style'
>;

const meta: Meta<SwitchStoryProps> = {
  component: Switch,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the switch',
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
        'Whether to visually hide the label (still accessible to screen readers)',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Controlled checked state',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the switch',
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
      description: 'Additional class names applied to the switch container',
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
      description: 'Inline styles applied to the switch container',
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
} satisfies Meta<SwitchStoryProps>;

export default meta;
type Story = StoryObj<SwitchStoryProps>;

export const basic_switch: Story = {
  args: {
    label: 'Enable notifications'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Switch {...args} />
    </div>
  )
} satisfies Story;

export const hidden_label: Story = {
  args: {
    label: 'Toggle feature',
    hideLabel: true
  },
  render: (args) => <Switch {...args} />
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Switch label='Small' size='sm' />
      <Switch label='Medium (default)' size='md' />
      <Switch label='Large' size='lg' />
    </div>
  )
} satisfies Story;

export const disabled: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Switch label='Disabled unchecked' disabled />
      <Switch label='Disabled checked' disabled defaultChecked />
    </div>
  )
} satisfies Story;

export const controlled: Story = {
  render: function ControlledSwitch(args) {
    const [checked, setChecked] = useState(false);
    return (
      <div className='flex flex-col gap-4 items-center'>
        <Switch
          {...args}
          label={args.label ?? 'Dark mode'}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <p>Switch is: {checked ? 'ON' : 'OFF'}</p>
      </div>
    );
  }
} satisfies Story;

export const custom_colors: Story = {
  args: {
    label: 'Custom themed switch'
  },
  render: (args) => (
    <Switch
      {...args}
      style={
        {
          '--switch-track-inactive': '#94a3b8',
          '--switch-track-active': '#22c55e',
          '--switch-focus-ring': '#22c55e'
        } as NonNullable<SwitchProps['style']>
      }
    />
  )
} satisfies Story;

export const toggle_interaction: Story = {
  args: {
    label: 'Interactive switch'
  },
  render: (args) => <Switch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Interactive switch' });

    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).not.toBeChecked();
  }
} satisfies Story;

export const keyboard_toggle: Story = {
  args: {
    label: 'Keyboard switch'
  },
  render: (args) => <Switch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Keyboard switch' });

    toggle.focus();
    await userEvent.keyboard('{Enter}');

    expect(toggle).toBeChecked();

    await userEvent.keyboard(' ');

    expect(toggle).not.toBeChecked();
  }
} satisfies Story;

export const disabled_interaction: Story = {
  args: {
    label: 'Disabled switch',
    disabled: true
  },
  render: (args) => <Switch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Disabled switch' });

    expect(toggle).toBeDisabled();

    await userEvent.click(toggle);

    expect(toggle).not.toBeChecked();
  }
} satisfies Story;
