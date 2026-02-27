import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, type StackProps } from 'frey-ui';

const meta: Meta<StackProps> = {
  component: Stack,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<StackProps>;

export default meta;
type Story = StoryObj<StackProps>;

const panelStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--frey-color-border-subtle)',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)'
};

export const vertical: Story = {
  render: () => (
    <Stack gap='3' style={{ minWidth: 280 }}>
      <div style={panelStyle}>Profile</div>
      <div style={panelStyle}>Notifications</div>
      <div style={panelStyle}>Security</div>
    </Stack>
  )
} satisfies Story;

export const horizontal: Story = {
  render: () => (
    <Stack direction='horizontal' gap='2'>
      <div style={panelStyle}>Monthly</div>
      <div style={panelStyle}>Quarterly</div>
      <div style={panelStyle}>Yearly</div>
    </Stack>
  )
} satisfies Story;
