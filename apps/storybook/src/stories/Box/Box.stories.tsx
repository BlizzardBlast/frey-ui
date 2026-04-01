import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, type BoxProps } from 'frey-ui';

type BoxStoryProps = Pick<
  BoxProps,
  'as' | 'p' | 'm' | 'bg' | 'color' | 'borderColor' | 'radius'
>;

const meta: Meta<BoxStoryProps> = {
  component: Box,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    as: {
      control: { type: 'select' },
      options: [
        'div',
        'span',
        'section',
        'article',
        'main',
        'aside',
        'header',
        'footer',
        'nav',
        'a',
        'button',
        'ul',
        'ol',
        'li',
        'p'
      ],
      description: 'Underlying HTML element to render',
      table: {
        type: {
          summary: 'BoxElement'
        },
        defaultValue: {
          summary: "'div'"
        }
      }
    },
    p: {
      control: { type: 'select' },
      options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
      description: 'Padding token applied on all sides',
      table: {
        type: {
          summary: 'SpaceToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    m: {
      control: { type: 'select' },
      options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
      description: 'Margin token applied on all sides',
      table: {
        type: {
          summary: 'SpaceToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    bg: {
      control: { type: 'select' },
      options: [
        'surface',
        'surface-subtle',
        'surface-hover',
        'surface-active',
        'text',
        'text-primary',
        'text-secondary',
        'text-muted',
        'text-title',
        'border',
        'border-muted',
        'border-subtle',
        'primary',
        'info',
        'success',
        'warning',
        'error'
      ],
      description: 'Background color token',
      table: {
        type: {
          summary: 'ColorToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    color: {
      control: { type: 'select' },
      options: [
        'surface',
        'surface-subtle',
        'surface-hover',
        'surface-active',
        'text',
        'text-primary',
        'text-secondary',
        'text-muted',
        'text-title',
        'border',
        'border-muted',
        'border-subtle',
        'primary',
        'info',
        'success',
        'warning',
        'error'
      ],
      description: 'Text color token',
      table: {
        type: {
          summary: 'ColorToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    borderColor: {
      control: { type: 'select' },
      options: [
        'surface',
        'surface-subtle',
        'surface-hover',
        'surface-active',
        'text',
        'text-primary',
        'text-secondary',
        'text-muted',
        'text-title',
        'border',
        'border-muted',
        'border-subtle',
        'primary',
        'info',
        'success',
        'warning',
        'error'
      ],
      description: 'Border color token',
      table: {
        type: {
          summary: 'ColorToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    radius: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius token',
      table: {
        type: {
          summary: 'RadiusToken'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<BoxStoryProps>;

export default meta;
type Story = StoryObj<BoxStoryProps>;

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
