import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid, type GridProps } from 'frey-ui';

type GridStoryProps = Pick<
  GridProps,
  'as' | 'columns' | 'rows' | 'autoFlow' | 'alignItems' | 'justifyItems' | 'gap'
>;

const meta: Meta<GridStoryProps> = {
  component: Grid,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'article'],
      description: 'Element rendered by the grid container',
      table: {
        type: {
          summary: 'BoxElement'
        },
        defaultValue: {
          summary: "'div'"
        }
      }
    },
    columns: {
      control: { type: 'text' },
      description: 'Grid column template or column count',
      table: {
        type: {
          summary: 'number | string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    rows: {
      control: { type: 'text' },
      description: 'Grid row template or row count',
      table: {
        type: {
          summary: 'number | string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    autoFlow: {
      control: { type: 'select' },
      options: ['row', 'column', 'dense', 'row dense', 'column dense'],
      description: 'Auto-placement behavior for implicit grid items',
      table: {
        type: {
          summary: 'CSSProperties["gridAutoFlow"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    alignItems: {
      control: { type: 'select' },
      options: ['stretch', 'start', 'center', 'end'],
      description: 'Block-axis alignment of grid items',
      table: {
        type: {
          summary: 'CSSProperties["alignItems"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    justifyItems: {
      control: { type: 'select' },
      options: ['stretch', 'start', 'center', 'end'],
      description: 'Inline-axis alignment of grid items',
      table: {
        type: {
          summary: 'CSSProperties["justifyItems"]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    gap: {
      control: { type: 'text' },
      description: 'Gap between grid items',
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
} satisfies Meta<GridStoryProps>;

export default meta;
type Story = StoryObj<GridStoryProps>;

const cellStyle: React.CSSProperties = {
  border: '1px solid var(--frey-color-border-subtle)',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)',
  padding: '0.75rem',
  textAlign: 'center'
};

export const columns: Story = {
  args: {
    columns: 3,
    gap: '3'
  },
  render: (args) => (
    <Grid {...args} style={{ minWidth: 420 }}>
      <div style={cellStyle}>1</div>
      <div style={cellStyle}>2</div>
      <div style={cellStyle}>3</div>
      <div style={cellStyle}>4</div>
      <div style={cellStyle}>5</div>
      <div style={cellStyle}>6</div>
    </Grid>
  )
} satisfies Story;

export const custom_template: Story = {
  args: {
    columns: '240px 1fr',
    rows: 'auto auto',
    gap: '2'
  },
  render: (args) => (
    <Grid {...args} style={{ minWidth: 520 }}>
      <div style={cellStyle}>Sidebar</div>
      <div style={cellStyle}>Main content</div>
      <div style={cellStyle}>Filters</div>
      <div style={cellStyle}>Data table</div>
    </Grid>
  )
} satisfies Story;
