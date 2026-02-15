import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chip } from 'frey-ui';
import { fn } from 'storybook/test';

const meta: Meta<typeof Chip> = {
  component: Chip,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: {
        type: 'text'
      },
      description: 'The text to display in the chip'
    },
    onClick: {
      type: 'function',
      description: 'The event handler for the click event',
      action: 'clicked'
    },
    as: {
      description: 'The HTML element to render for the chip',
      table: {
        type: {
          summary: "'button' | 'div' | 'span' | 'a'"
        }
      },
      control: {
        type: 'select'
      },
      options: ['button', 'div', 'span', 'a']
    },
    href: {
      description: 'URL when rendering as an anchor chip',
      control: {
        type: 'text'
      }
    },
    variant: {
      description: 'The variant of the chip',
      table: {
        type: {
          summary: 'default | outlined'
        }
      },
      control: {
        type: 'select'
      },
      options: ['default', 'outlined']
    },
    style: {
      description: 'The style of the chip',
      control: {
        type: 'object'
      },
      table: {
        type: {
          summary: 'CSSProperties'
        }
      }
    },
    className: {
      description: 'The class name of the chip',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'string'
        }
      }
    }
  }
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

export const Basic_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: undefined,
    className: undefined,
    style: undefined
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Chip {...args} variant={'default'} />
      <Chip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn(),
    as: 'button',
    className: undefined,
    style: undefined
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Chip {...args} variant={'default'} />
      <Chip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const Link_Chip: Story = {
  args: {
    label: 'Read docs',
    as: 'a',
    href: 'https://storybook.js.org',
    variant: 'outlined'
  },
  render: (args) => <Chip {...args} />
} satisfies Story;
