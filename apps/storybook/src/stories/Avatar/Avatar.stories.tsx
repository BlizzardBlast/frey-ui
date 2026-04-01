import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarProps } from 'frey-ui';

type AvatarStoryProps = Pick<
  AvatarProps,
  'src' | 'alt' | 'fallback' | 'size' | 'status'
>;

const meta: Meta<AvatarStoryProps> = {
  component: Avatar,
  parameters: {
    layout: 'centered'
  },
  args: {
    size: 'md'
  },
  argTypes: {
    src: {
      control: { type: 'text' },
      description: 'Image source URL',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    alt: {
      control: { type: 'text' },
      description: 'Alternative text for the avatar image',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    fallback: {
      control: { type: 'text' },
      description: 'Fallback text shown when the image is unavailable',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size variant',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg'"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'idle', 'dnd'],
      description: 'Optional presence status indicator',
      table: {
        type: {
          summary: "'online' | 'offline' | 'idle' | 'dnd'"
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<AvatarStoryProps>;

export default meta;

type Story = StoryObj<AvatarStoryProps>;

export const basic: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    alt: 'Jason Bourne',
    fallback: 'JB'
  }
} satisfies Story;

export const with_fallback: Story = {
  args: {
    alt: 'Alice Smith',
    fallback: 'AS'
  }
} satisfies Story;

export const with_broken_image: Story = {
  args: {
    src: 'https://broken-link.example.com/avatar.jpg',
    alt: 'Broken Image User',
    fallback: 'BU'
  }
} satisfies Story;

export const sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar {...args} size='sm' />
      <Avatar {...args} size='md' />
      <Avatar {...args} size='lg' />
    </div>
  ),
  args: {
    src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    alt: 'Jane Doe',
    fallback: 'JD'
  }
} satisfies Story;

export const with_status: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar {...args} status='online' fallback='ON' />
      <Avatar {...args} status='idle' fallback='ID' />
      <Avatar {...args} status='dnd' fallback='DN' />
      <Avatar {...args} status='offline' fallback='OF' />
    </div>
  ),
  args: {
    src: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    alt: 'Status User'
  }
} satisfies Story;
