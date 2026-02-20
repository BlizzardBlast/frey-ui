import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarProps } from 'frey-ui';

const meta: Meta<AvatarProps> = {
  component: Avatar,
  parameters: {
    layout: 'centered'
  },
  args: {
    size: 'md'
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'idle', 'dnd']
    }
  }
} satisfies Meta<AvatarProps>;

export default meta;

type Story = StoryObj<AvatarProps>;

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
