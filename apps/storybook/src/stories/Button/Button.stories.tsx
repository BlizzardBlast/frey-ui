import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from 'frey-ui';
import type { ButtonElement, ButtonSize, ButtonVariant } from 'frey-ui';
import { expect, fn, userEvent, within } from 'storybook/test';

type ButtonStoryProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  as?: ButtonElement;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const StoryButton = Button as unknown as React.ComponentType<ButtonStoryProps>;

const meta: Meta<ButtonStoryProps> = {
  component: StoryButton,
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
      <StoryButton {...args} variant='primary' />
      <StoryButton {...args} variant='secondary' />
      <StoryButton {...args} variant='ghost' />
      <StoryButton {...args} variant='destructive' />
    </div>
  )
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <StoryButton size='sm'>Small</StoryButton>
      <StoryButton size='md'>Medium</StoryButton>
      <StoryButton size='lg'>Large</StoryButton>
    </div>
  )
} satisfies Story;

export const disabled_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <StoryButton disabled>Primary</StoryButton>
      <StoryButton variant='secondary' disabled>
        Secondary
      </StoryButton>
      <StoryButton variant='destructive' disabled>
        Destructive
      </StoryButton>
    </div>
  )
} satisfies Story;

export const loading_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <StoryButton loading>Submitting...</StoryButton>
      <StoryButton variant='secondary' loading>
        Loading
      </StoryButton>
    </div>
  )
} satisfies Story;

export const as_link: Story = {
  args: {
    children: 'Visit docs',
    variant: 'secondary'
  },
  render: (args) => (
    <StoryButton {...args} as='a' href='https://storybook.js.org' />
  )
} satisfies Story;

export const click_interaction: Story = {
  args: {
    children: 'Click me',
    onClick: fn()
  },
  render: (args) => <StoryButton {...args} />,
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
  render: (args) => <StoryButton {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(args.onClick).not.toHaveBeenCalled();
  }
} satisfies Story;
