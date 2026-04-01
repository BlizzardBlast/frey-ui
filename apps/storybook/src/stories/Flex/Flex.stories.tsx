import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flex, type FlexProps } from 'frey-ui';

type FlexStoryProps = Pick<
  FlexProps,
  'as' | 'inline' | 'direction' | 'align' | 'justify' | 'wrap' | 'gap'
>;

const meta: Meta<FlexStoryProps> = {
  component: Flex,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'article'],
      description: 'Element rendered by the flex container',
      table: {
        type: {
          summary: 'BoxElement'
        },
        defaultValue: {
          summary: "'div'"
        }
      }
    },
    inline: {
      control: { type: 'boolean' },
      description: 'Whether the container uses inline-flex instead of flex',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Main axis direction for flex children',
      table: {
        type: {
          summary: 'CSSProperties["flexDirection"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    align: {
      control: { type: 'select' },
      options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
      description: 'Cross-axis alignment of flex children',
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
      description: 'Main-axis distribution of flex children',
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
      description: 'Wrapping behavior for flex children',
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
      description: 'Gap between flex children',
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
} satisfies Meta<FlexStoryProps>;

export default meta;
type Story = StoryObj<FlexStoryProps>;

const itemStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)',
  border: '1px solid var(--frey-color-border-subtle)'
};

export const horizontal: Story = {
  args: {
    gap: '3',
    align: 'center'
  },
  render: (args) => (
    <Flex {...args}>
      <div style={itemStyle}>Design</div>
      <div style={itemStyle}>Build</div>
      <div style={itemStyle}>Ship</div>
    </Flex>
  )
} satisfies Story;

export const wrapped: Story = {
  args: {
    gap: '2',
    wrap: 'wrap'
  },
  render: (args) => (
    <Flex {...args} style={{ maxWidth: 280 }}>
      <div style={itemStyle}>Status</div>
      <div style={itemStyle}>Priority</div>
      <div style={itemStyle}>Owner</div>
      <div style={itemStyle}>Updated</div>
      <div style={itemStyle}>Region</div>
    </Flex>
  )
} satisfies Story;
