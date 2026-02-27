import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flex, type FlexProps } from 'frey-ui';

const meta: Meta<FlexProps> = {
  component: Flex,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<FlexProps>;

export default meta;
type Story = StoryObj<FlexProps>;

const itemStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--frey-radius-sm)',
  backgroundColor: 'var(--frey-color-surface-subtle)',
  border: '1px solid var(--frey-color-border-subtle)'
};

export const horizontal: Story = {
  render: () => (
    <Flex gap='3' align='center'>
      <div style={itemStyle}>Design</div>
      <div style={itemStyle}>Build</div>
      <div style={itemStyle}>Ship</div>
    </Flex>
  )
} satisfies Story;

export const wrapped: Story = {
  render: () => (
    <Flex gap='2' wrap='wrap' style={{ maxWidth: 280 }}>
      <div style={itemStyle}>Status</div>
      <div style={itemStyle}>Priority</div>
      <div style={itemStyle}>Owner</div>
      <div style={itemStyle}>Updated</div>
      <div style={itemStyle}>Region</div>
    </Flex>
  )
} satisfies Story;
