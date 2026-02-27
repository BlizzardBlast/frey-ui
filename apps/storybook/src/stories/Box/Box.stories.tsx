import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, type BoxProps } from 'frey-ui';

const meta: Meta<BoxProps> = {
  component: Box,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<BoxProps>;

export default meta;
type Story = StoryObj<BoxProps>;

export const basic: Story = {
  render: () => (
    <Box
      p='4'
      radius='md'
      bg='surface-subtle'
      borderColor='border-subtle'
      style={{ borderStyle: 'solid', borderWidth: 1, minWidth: 260 }}
    >
      Token-based box primitive
    </Box>
  )
} satisfies Story;

export const spacing_and_tokens: Story = {
  render: () => (
    <Box
      p='6'
      m='2'
      radius='lg'
      bg='surface'
      color='text-primary'
      borderColor='border'
      style={{ borderStyle: 'solid', borderWidth: 1, width: 320 }}
    >
      <Box mb='2' color='text-muted'>
        Title
      </Box>
      <Box color='text'>Compose layout and token props without custom CSS.</Box>
    </Box>
  )
} satisfies Story;

export const polymorphic_link: Story = {
  render: () => (
    <Box
      as='a'
      href='https://blizzardblast.github.io/frey-ui'
      p='3'
      radius='md'
      bg='surface-subtle'
      color='primary'
      style={{
        textDecoration: 'none',
        border: '1px solid var(--frey-color-border)'
      }}
    >
      Open Frey UI docs
    </Box>
  )
} satisfies Story;
