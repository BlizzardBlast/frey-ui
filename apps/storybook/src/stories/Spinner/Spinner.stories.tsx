import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner, type SpinnerProps } from 'frey-ui';

type SpinnerStoryProps = Pick<
  SpinnerProps,
  'size' | 'label' | 'className' | 'style'
>;

const meta: Meta<SpinnerStoryProps> = {
  component: Spinner,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description:
        'Named spinner size token (also accepts a numeric pixel size)',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg' | number"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible loading label announced to assistive technology',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'Loading'"
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the spinner root',
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
      description: 'Inline styles applied to the spinner root',
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
} satisfies Meta<SpinnerStoryProps>;

export default meta;

type Story = StoryObj<SpinnerStoryProps>;

export const basic_spinner: Story = {
  args: {
    size: 'md',
    label: 'Loading data'
  }
} satisfies Story;

export const size_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size='sm' label='Small loading spinner' />
      <Spinner size='md' label='Medium loading spinner' />
      <Spinner size='lg' label='Large loading spinner' />
      <Spinner size={28} label='Custom loading spinner' />
    </div>
  )
} satisfies Story;
