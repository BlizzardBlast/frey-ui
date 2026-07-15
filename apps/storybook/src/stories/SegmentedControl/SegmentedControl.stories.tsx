import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SegmentedControlProps } from 'frey-ui';
import { SegmentedControl, ThemeProvider } from 'frey-ui';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type SegmentedControlStoryProps = Pick<
  SegmentedControlProps,
  | 'children'
  | 'label'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'hideLabel'
  | 'helperText'
  | 'error'
  | 'disabled'
  | 'required'
  | 'name'
  | 'size'
  | 'id'
  | 'className'
  | 'style'
  | 'groupClassName'
  | 'groupStyle'
>;

type ThemeCompatibilityPreviewProps = {
  label: string;
  name: string;
  theme: 'light' | 'dark';
  highContrast: boolean;
};

function ThemeCompatibilityPreview({
  label,
  name,
  theme,
  highContrast,
}: Readonly<ThemeCompatibilityPreviewProps>) {
  return (
    <ThemeProvider theme={theme} highContrast={highContrast}>
      <div
        style={{
          display: 'grid',
          gap: 8,
          padding: 16,
          border: '1px solid var(--frey-color-border)',
          borderRadius: 'var(--frey-radius-lg)',
          background: 'var(--frey-color-surface)',
        }}
      >
        <strong>{label}</strong>
        <SegmentedControl
          label={`${label} dashboard view`}
          name={name}
          defaultValue='list'
        >
          <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
          <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
          <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
        </SegmentedControl>
      </div>
    </ThemeProvider>
  );
}

const meta: Meta<SegmentedControlStoryProps> = {
  component: SegmentedControl,
  subcomponents: {
    'SegmentedControl.Item': SegmentedControl.Item,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native radio-backed single-select control. Root `className` and `style` target the Field wrapper; `groupClassName`, `groupStyle`, other div attributes, the root id, and the root ref target the radiogroup. Each `SegmentedControl.Item` requires a unique `value` and visible text content. Item `disabled` and `id` target the native radio, while item `className` and `style` target the visible segment. Selection and focus colors can be customized with the `--frey-segmented-control-selected-bg`, `--frey-segmented-control-selected-text`, and `--frey-segmented-control-focus-ring` tokens.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    children: {
      control: false,
      description: 'Composed SegmentedControl.Item elements.',
      table: {
        type: {
          summary: 'ReactNode',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the single-select group.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled selected item value.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial selected value when uncontrolled.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    onValueChange: {
      action: 'selection changed',
      description: 'Called with the newly selected item value.',
      table: {
        type: {
          summary: '(value: string) => void',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    hideLabel: {
      control: { type: 'boolean' },
      description:
        'Whether to visually hide the label while preserving its accessible name.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    helperText: {
      control: { type: 'text' },
      description: 'Supporting text associated with the group.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    error: {
      control: { type: 'text' },
      description: 'Error text that marks the group as invalid.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether every item in the group is disabled.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether native form validation requires a selection.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    name: {
      control: { type: 'text' },
      description: 'Native radio name used for grouping and form submission.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'Generated',
        },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Visual size shared by every segment.',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg'",
        },
        defaultValue: {
          summary: "'md'",
        },
      },
    },
    id: {
      control: { type: 'text' },
      description: 'Id applied to the radiogroup and used to derive field ids.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'Generated',
        },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the Field wrapper.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the Field wrapper.',
      table: {
        type: {
          summary: 'CSSProperties',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    groupClassName: {
      control: { type: 'text' },
      description: 'Additional class names applied to the radiogroup.',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    groupStyle: {
      control: { type: 'object' },
      description: 'Inline styles applied to the radiogroup.',
      table: {
        type: {
          summary: 'CSSProperties',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
  },
} satisfies Meta<SegmentedControlStoryProps>;

export default meta;

type Story = StoryObj<SegmentedControlStoryProps>;

export const basic: Story = {
  args: {
    label: 'Dashboard view',
    defaultValue: 'list',
    onValueChange: fn(),
  },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
      <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
    </SegmentedControl>
  ),
  play: async ({ canvas, args }) => {
    const grid = canvas.getByRole('radio', { name: 'Grid' });

    await userEvent.click(grid);

    await expect(grid).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith('grid');
  },
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <SegmentedControl label='Small control' defaultValue='daily' size='sm'>
        <SegmentedControl.Item value='daily'>Daily</SegmentedControl.Item>
        <SegmentedControl.Item value='weekly'>Weekly</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl label='Medium control' defaultValue='daily' size='md'>
        <SegmentedControl.Item value='daily'>Daily</SegmentedControl.Item>
        <SegmentedControl.Item value='weekly'>Weekly</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl label='Large control' defaultValue='daily' size='lg'>
        <SegmentedControl.Item value='daily'>Daily</SegmentedControl.Item>
        <SegmentedControl.Item value='weekly'>Weekly</SegmentedControl.Item>
      </SegmentedControl>
    </div>
  ),
} satisfies Story;

export const controlled_selection: Story = {
  args: {
    label: 'Reporting period',
    defaultValue: 'month',
  },
  render: function ControlledSelectionStory(args) {
    const [selection, setSelection] = useState(
      args.value ?? args.defaultValue ?? 'month'
    );
    const resolvedValue = args.value ?? selection;

    const handleValueChange = (nextValue: string) => {
      if (args.value === undefined) {
        setSelection(nextValue);
      }

      args.onValueChange?.(nextValue);
    };

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <SegmentedControl
          {...args}
          value={resolvedValue}
          onValueChange={handleValueChange}
        >
          <SegmentedControl.Item value='week'>Week</SegmentedControl.Item>
          <SegmentedControl.Item value='month'>Month</SegmentedControl.Item>
          <SegmentedControl.Item value='quarter'>Quarter</SegmentedControl.Item>
        </SegmentedControl>
        <small>Current period: {resolvedValue}</small>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Quarter' }));

    await expect(canvas.getByText('Current period: quarter')).toBeVisible();
  },
} satisfies Story;

export const disabled_states: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <SegmentedControl label='Layout navigation' defaultValue='list'>
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid' disabled>
          Grid unavailable
        </SegmentedControl.Item>
        <SegmentedControl.Item value='compact'>Compact</SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl label='Archived layout' defaultValue='list' disabled>
        <SegmentedControl.Item value='list'>List</SegmentedControl.Item>
        <SegmentedControl.Item value='grid'>Grid</SegmentedControl.Item>
      </SegmentedControl>
    </div>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', {
      name: 'Layout navigation',
    });
    const groupCanvas = within(group);
    const list = groupCanvas.getByRole('radio', { name: 'List' });
    const unavailable = groupCanvas.getByRole('radio', {
      name: 'Grid unavailable',
    });
    const compact = groupCanvas.getByRole('radio', { name: 'Compact' });

    await expect(unavailable).toBeDisabled();

    list.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(compact).toHaveFocus();
    await expect(compact).toBeChecked();

    await userEvent.keyboard('{ArrowRight}');
    await expect(list).toHaveFocus();
    await expect(list).toBeChecked();
  },
} satisfies Story;

export const validation_state: Story = {
  render: () => (
    <SegmentedControl
      label='Billing interval'
      helperText='Choose the interval used for future invoices.'
      error='Select a billing interval.'
      required
    >
      <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
      <SegmentedControl.Item value='yearly'>Yearly</SegmentedControl.Item>
    </SegmentedControl>
  ),
} satisfies Story;

export const dashboard_filter: Story = {
  render: function DashboardFilterStory() {
    const [status, setStatus] = useState('all');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <SegmentedControl
          label='Transaction status'
          value={status}
          onValueChange={setStatus}
        >
          <SegmentedControl.Item value='all'>All</SegmentedControl.Item>
          <SegmentedControl.Item value='pending'>Pending</SegmentedControl.Item>
          <SegmentedControl.Item value='completed'>
            Completed
          </SegmentedControl.Item>
        </SegmentedControl>
        <small>Showing {status} transactions</small>
      </div>
    );
  },
} satisfies Story;

export const theme_compatibility: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <ThemeCompatibilityPreview
        label='Light theme'
        name='light-theme-dashboard-view'
        theme='light'
        highContrast={false}
      />
      <ThemeCompatibilityPreview
        label='Dark theme'
        name='dark-theme-dashboard-view'
        theme='dark'
        highContrast={false}
      />
      <ThemeCompatibilityPreview
        label='Light high contrast'
        name='light-high-contrast-dashboard-view'
        theme='light'
        highContrast
      />
      <ThemeCompatibilityPreview
        label='Dark high contrast'
        name='dark-high-contrast-dashboard-view'
        theme='dark'
        highContrast
      />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const label of [
      'Light theme',
      'Dark theme',
      'Light high contrast',
      'Dark high contrast',
    ]) {
      const group = canvas.getByRole('radiogroup', {
        name: `${label} dashboard view`,
      });

      await expect(
        within(group).getByRole('radio', { name: 'List' })
      ).toBeChecked();
    }
  },
} satisfies Story;
