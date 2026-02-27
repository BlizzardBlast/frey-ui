import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid, type GridProps } from 'frey-ui';

const meta: Meta<GridProps> = {
  component: Grid,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<GridProps>;

export default meta;
type Story = StoryObj<GridProps>;

const cellStyle: React.CSSProperties = {
  border: '1px solid var(--frey-color-border-subtle)',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)',
  padding: '0.75rem',
  textAlign: 'center'
};

export const columns: Story = {
  render: () => (
    <Grid columns={3} gap='3' style={{ minWidth: 420 }}>
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
  render: () => (
    <Grid
      columns='240px 1fr'
      rows='auto auto'
      gap='2'
      style={{ minWidth: 520 }}
    >
      <div style={cellStyle}>Sidebar</div>
      <div style={cellStyle}>Main content</div>
      <div style={cellStyle}>Filters</div>
      <div style={cellStyle}>Data table</div>
    </Grid>
  )
} satisfies Story;
