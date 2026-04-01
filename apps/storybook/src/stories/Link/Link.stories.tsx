import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, type LinkProps } from 'frey-ui';

type LinkStoryProps = Pick<
  LinkProps,
  'href' | 'children' | 'color' | 'underline' | 'target'
>;

const meta: Meta<LinkStoryProps> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    href: {
      control: { type: 'text' },
      description: 'Destination URL for the anchor element',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    children: {
      control: { type: 'text' },
      description: 'Text content rendered inside the link',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    color: {
      control: { type: 'select' },
      options: [
        'primary',
        'text',
        'muted',
        'info',
        'success',
        'warning',
        'error'
      ],
      description: 'Semantic color treatment for the link text',
      table: {
        type: {
          summary:
            "'primary' | 'text' | 'muted' | 'info' | 'success' | 'warning' | 'error'"
        },
        defaultValue: {
          summary: "'primary'"
        }
      }
    },
    underline: {
      control: { type: 'select' },
      options: ['always', 'hover', 'none'],
      description: 'When the link underline should be visible',
      table: {
        type: {
          summary: "'always' | 'hover' | 'none'"
        },
        defaultValue: {
          summary: "'hover'"
        }
      }
    },
    target: {
      control: { type: 'select' },
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Browsing context used when the link opens',
      table: {
        type: {
          summary: "'_self' | '_blank' | '_parent' | '_top'"
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<LinkStoryProps>;

export default meta;
type Story = StoryObj<LinkStoryProps>;

export const basic: Story = {
  args: {
    href: 'https://blizzardblast.github.io/frey-ui',
    children: 'Read documentation',
    color: 'primary',
    underline: 'hover'
  }
} satisfies Story;

export const color_variants: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <Link href='#' color='primary'>
        Primary link
      </Link>
      <Link href='#' color='text'>
        Text link
      </Link>
      <Link href='#' color='muted'>
        Muted link
      </Link>
      <Link href='#' color='success'>
        Success link
      </Link>
      <Link href='#' color='error'>
        Error link
      </Link>
    </div>
  )
} satisfies Story;

export const target_blank: Story = {
  args: {
    href: 'https://storybook.js.org',
    target: '_blank',
    children: 'Open Storybook in new tab'
  }
} satisfies Story;
