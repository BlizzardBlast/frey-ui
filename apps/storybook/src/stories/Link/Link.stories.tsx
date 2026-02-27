import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, type LinkProps } from 'frey-ui';

const meta: Meta<LinkProps> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
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
      ]
    },
    underline: {
      control: { type: 'select' },
      options: ['always', 'hover', 'none']
    }
  }
} satisfies Meta<LinkProps>;

export default meta;
type Story = StoryObj<LinkProps>;

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
