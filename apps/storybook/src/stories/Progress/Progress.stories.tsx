import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ProgressProps } from 'frey-ui';
import { Progress } from 'frey-ui';

type ProgressStoryProps = Pick<
  ProgressProps,
  | 'label'
  | 'value'
  | 'max'
  | 'indeterminate'
  | 'showValue'
  | 'size'
  | 'className'
  | 'style'
  | 'barClassName'
>;

const meta: Meta<ProgressStoryProps> = {
  component: Progress,
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
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Height variant for the progress indicator',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg'"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible label shown above the progress bar',
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
      control: { type: 'number' },
      description: 'Current progress value',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '0'
        }
      }
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum progress value',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '100'
        }
      }
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Whether the progress is loading without a fixed value',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    showValue: {
      control: { type: 'boolean' },
      description: 'Whether to display the computed percentage label',
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
      description: 'Additional class names applied to the progress root',
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
      description: 'Inline styles applied to the progress root',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    barClassName: {
      control: { type: 'text' },
      description: 'Additional class names applied to the native progress bar',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<ProgressStoryProps>;

export default meta;

type Story = StoryObj<ProgressStoryProps>;

export const basic_progress: Story = {
  args: {
    label: 'Upload progress',
    value: 45,
    max: 100,
    size: 'md',
    showValue: true
  }
} satisfies Story;

export const size_variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Progress label='Small progress' value={30} size='sm' />
      <Progress label='Medium progress' value={55} size='md' />
      <Progress label='Large progress' value={80} size='lg' />
    </div>
  )
} satisfies Story;

export const indeterminate: Story = {
  args: {
    label: 'Preparing report',
    indeterminate: true,
    size: 'md'
  }
} satisfies Story;
