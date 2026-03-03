import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonSize, ButtonVariant } from 'frey-ui';
import { Button } from 'frey-ui';
import { expect, fn, userEvent, within } from 'storybook/test';

type ButtonStoryProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const meta: Meta<ButtonStoryProps> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual variant of the button'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled'
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in a loading state'
    }
  }
} satisfies Meta<ButtonStoryProps>;

export default meta;
type Story = StoryObj<ButtonStoryProps>;

export const basic_button: Story = {
  args: {
    children: 'Button'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Button {...args} variant='primary' />
      <Button {...args} variant='secondary' />
      <Button {...args} variant='ghost' />
      <Button {...args} variant='destructive' />
    </div>
  )
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Button size='sm'>Small</Button>
      <Button size='md'>Medium</Button>
      <Button size='lg'>Large</Button>
    </div>
  )
} satisfies Story;

export const disabled_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Button disabled>Primary</Button>
      <Button variant='secondary' disabled>
        Secondary
      </Button>
      <Button variant='destructive' disabled>
        Destructive
      </Button>
    </div>
  )
} satisfies Story;

export const loading_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Button loading>Submitting...</Button>
      <Button variant='secondary' loading>
        Loading
      </Button>
    </div>
  )
} satisfies Story;

export const as_link: Story = {
  args: {
    children: 'Visit docs',
    variant: 'secondary'
  },
  render: (args) => (
    <Button {...args} asChild>
      <a href='https://storybook.js.org' target='_blank' rel='noreferrer'>
        {args.children}
      </a>
    </Button>
  )
} satisfies Story;

export const click_interaction: Story = {
  args: {
    children: 'Click me',
    onClick: fn()
  },
  render: (args) => <Button {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(button);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;

export const disabled_interaction: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    onClick: fn()
  },
  render: (args) => <Button {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(args.onClick).not.toHaveBeenCalled();
  }
} satisfies Story;
