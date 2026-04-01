import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, type StackProps } from 'frey-ui';

type StackStoryProps = Pick<
  StackProps,
  'as' | 'direction' | 'align' | 'justify' | 'wrap' | 'gap'
>;

const meta: Meta<StackStoryProps> = {
  component: Stack,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'article'],
      description: 'Element rendered by the stack container',
      table: {
        type: {
          summary: 'BoxElement'
        },
        defaultValue: {
          summary: "'div'"
        }
      }
    },
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Stack orientation',
      table: {
        type: {
          summary: "'vertical' | 'horizontal'"
        },
        defaultValue: {
          summary: "'vertical'"
        }
      }
    },
    align: {
      control: { type: 'select' },
      options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
      description: 'Cross-axis alignment of stack children',
      table: {
        type: {
          summary: 'CSSProperties["alignItems"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    justify: {
      control: { type: 'select' },
      options: [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly'
      ],
      description: 'Main-axis distribution of stack children',
      table: {
        type: {
          summary: 'CSSProperties["justifyContent"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    wrap: {
      control: { type: 'select' },
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Wrapping behavior for horizontal stacks',
      table: {
        type: {
          summary: 'CSSProperties["flexWrap"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    gap: {
      control: { type: 'text' },
      description: 'Gap between stack children',
      table: {
        type: {
          summary: 'string | number'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<StackStoryProps>;

export default meta;
type Story = StoryObj<StackStoryProps>;

const panelStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--frey-color-border-subtle)',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)'
};

export const vertical: Story = {
  args: {
    gap: '3'
  },
  render: (args) => (
    <Stack {...args} style={{ minWidth: 280 }}>
      <div style={panelStyle}>Profile</div>
      <div style={panelStyle}>Notifications</div>
      <div style={panelStyle}>Security</div>
    </Stack>
  )
} satisfies Story;

export const horizontal: Story = {
  args: {
    direction: 'horizontal',
    gap: '2'
  },
  render: (args) => (
    <Stack {...args}>
      <div style={panelStyle}>Monthly</div>
      <div style={panelStyle}>Quarterly</div>
      <div style={panelStyle}>Yearly</div>
    </Stack>
  )
} satisfies Story;
