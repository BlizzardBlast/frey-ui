import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CircleInfoIcon,
  CircleXIcon,
  CloseIcon,
  type IconProps,
  MinusIcon,
  TriangleAlertIcon
} from 'frey-ui';

type IconStoryProps = Pick<
  IconProps,
  'size' | 'strokeWidth' | 'title' | 'className' | 'style'
>;

const meta: Meta<IconStoryProps> = {
  component: CloseIcon,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Named icon size token (also accepts number override)',
      table: {
        type: {
          summary: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    strokeWidth: {
      control: { type: 'select' },
      options: ['thin', 'regular', 'bold'],
      description: 'Named stroke token (also accepts number override)',
      table: {
        type: {
          summary: "'thin' | 'regular' | 'bold' | number"
        },
        defaultValue: {
          summary: "'regular'"
        }
      }
    },
    title: {
      control: { type: 'text' },
      description: 'Accessible title announced for the icon graphic',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the SVG element',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the SVG element',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<IconStoryProps>;

export default meta;

type Story = StoryObj<IconStoryProps>;

export const icon_gallery: Story = {
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 20,
        color: 'var(--frey-color-text-primary, #111827)'
      }}
    >
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <CloseIcon {...args} title={args.title ?? 'Close icon'} />
        <small>CloseIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <ChevronDownIcon {...args} title={args.title ?? 'Chevron down icon'} />
        <small>ChevronDownIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <CheckIcon {...args} title={args.title ?? 'Check icon'} />
        <small>CheckIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MinusIcon {...args} title={args.title ?? 'Minus icon'} />
        <small>MinusIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <CircleXIcon {...args} title={args.title ?? 'Error icon'} />
        <small>CircleXIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <CircleCheckIcon {...args} title={args.title ?? 'Success icon'} />
        <small>CircleCheckIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <TriangleAlertIcon {...args} title={args.title ?? 'Warning icon'} />
        <small>TriangleAlertIcon</small>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <CircleInfoIcon {...args} title={args.title ?? 'Info icon'} />
        <small>CircleInfoIcon</small>
      </div>
    </div>
  ),
  args: {
    size: 'lg',
    strokeWidth: 'regular',
    title: 'Icon'
  }
} satisfies Story;

export const size_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <ChevronDownIcon size='xs' title='Extra small chevron' />
      <ChevronDownIcon size='sm' title='Small chevron' />
      <ChevronDownIcon size='md' title='Medium chevron' />
      <ChevronDownIcon size='lg' title='Large chevron' />
      <ChevronDownIcon size='xl' title='Extra large chevron' />
    </div>
  )
} satisfies Story;

export const numeric_override: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <CloseIcon size={18} strokeWidth={1.5} title='Thin stroke close icon' />
      <CloseIcon size={22} strokeWidth={2.2} title='Regular close icon' />
      <CloseIcon size={28} strokeWidth={2.8} title='Bold close icon' />
    </div>
  )
} satisfies Story;
